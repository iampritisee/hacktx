from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Any, List, Tuple
import numpy as np
import json
import math
import copy
import pprint

# ---------- Utilities ----------

def _huber(x: float, delta: float = 1.0) -> float:
    """Huber loss for robust aggregation (delta is the transition point)."""
    ax = abs(x)
    return 0.5 * ax * ax if ax <= delta else delta * (ax - 0.5 * delta)

def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def _dict_add_inplace(dst: Dict[str, float], src: Dict[str, float]) -> None:
    for k, v in src.items():
        dst[k] = dst.get(k, 0.0) + v

def _dict_scale_inplace(dst: Dict[str, float], s: float) -> None:
    for k in list(dst.keys()):
        dst[k] *= s

def _safe_get(d: Dict[str, Any], *keys, default=None):
    cur = d
    for k in keys:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur

def _nan_to_num_dict(d: Dict[str, float]) -> Dict[str, float]:
    return {k: (0.0 if (not isinstance(v, (int, float)) or math.isnan(v)) else float(v)) for k, v in d.items()}

# ---------- Preference Model ----------

@dataclass
class UserPreferences:
    """Preference weights that bias decisions, independent of track targets."""
    stability_bias: float = 0.8      # 0..1 (1 => prioritize stability/consistency over raw pace)
    steering_weight_preference: str = "medium"  # "light" | "medium" | "heavy"
    throttle_linearity: float = 0.85  # 0..1, higher => more linear (less aggressive initial response)
    brake_pedal_linearity: float = 0.90
    aggression: float = 0.2          # 0..1, 0 => conservative; 1 => aggressive changes
    # Sensitivity multipliers (domain heuristics)
    brake_bias_sensitivity: float = 1.0
    diff_sensitivity: float = 1.0
    wing_sensitivity: float = 1.0
    arb_sensitivity: float = 1.0
    damper_sensitivity: float = 1.0
    toe_sensitivity: float = 1.0
    pressure_sensitivity: float = 1.0
    ride_height_sensitivity: float = 1.0

def build_preferences_from_doc(doc: Dict[str, Any]) -> UserPreferences:
    rsp = float(_safe_get(doc, "metadata", "rookie_stability_priority", default=0.8) or 0.8)
    controls = _safe_get(doc, "initial_setup", "controls", default={}) or {}
    return UserPreferences(
        stability_bias=_clamp(rsp, 0.0, 1.0),
        steering_weight_preference=controls.get("steering_weight_preference", "medium"),
        throttle_linearity=float(controls.get("throttle_pedal_linearity", 0.85) or 0.85),
        brake_pedal_linearity=float(controls.get("brake_pedal_linearity", 0.90) or 0.90),
        aggression=0.15 + 0.2 * (1.0 - rsp),   # rookier (high rsp) => lower aggression
    )

# ---------- Validation ----------

def validate_schema(doc: Dict[str, Any]) -> None:
    required = ["metadata", "targets", "turns", "initial_setup"]
    for r in required:
        if r not in doc:
            raise ValueError(f"Missing top-level key: {r}")
    if not isinstance(doc["turns"], list) or len(doc["turns"]) == 0:
        raise ValueError("turns must be a non-empty list")
    # Spot-check presence of key sections inside targets
    _ = doc["targets"]["balance_goal"]
    _ = doc["targets"]["stability_goal"]
    _ = doc["targets"]["tyre_goal"]

# ---------- Cost Model ----------

@dataclass
class CostWeights:
    w_bal: float = 1.0
    w_stab: float = 1.0
    w_tyre: float = 0.7
    w_ride: float = 0.6
    w_pace: float = 0.2

def build_cost_weights(prefs: UserPreferences) -> CostWeights:
    # Favor stability when stability_bias is high; reduce pace importance
    sb = prefs.stability_bias
    return CostWeights(
        w_bal=1.0 + 0.5 * sb,
        w_stab=1.2 + 0.8 * sb,
        w_tyre=0.6 + 0.4 * sb,
        w_ride=0.5 + 0.4 * sb,
        w_pace=0.4 * (1.0 - sb)
    )

def compute_corner_weight(turn: Dict[str, Any], doc: Dict[str, Any]) -> float:
    cap = float(_safe_get(doc, "weights_and_constraints", "time_loss_weight_cap", default=3.0) or 3.0)
    tlw = float(turn.get("time_loss_weight", 1.0) or 1.0)
    occ = float(turn.get("occurrence_rate", 1.0) or 1.0)
    dcw = float(turn.get("driver_confidence_weight", 1.0) or 1.0)
    rsp = float(_safe_get(doc, "metadata", "rookie_stability_priority", default=0.8) or 0.8)
    return min(cap, tlw * occ * dcw * rsp)

def _phase_targets(doc: Dict[str, Any]) -> Tuple[float, float, float]:
    bg = doc["targets"]["balance_goal"]
    return float(bg["entry_oversteer_index"]), float(bg["mid_oversteer_index"]), float(bg["exit_oversteer_index"])

def error_vector_for_turn(turn: Dict[str, Any], doc: Dict[str, Any]) -> Dict[str, float]:
    t_entry, t_mid, t_exit = _phase_targets(doc)
    b = turn["balance"]
    # Oversteer index error (positive => too oversteery vs target; negative => too understeery)
    e = {
        "d_entry": float(b["entry_oversteer_index"]) - t_entry,
        "d_mid":   float(b["mid_oversteer_index"])   - t_mid,
        "d_exit":  float(b["exit_oversteer_index"])  - t_exit,
    }
    # Stability risks vs goals
    sg = doc["targets"]["stability_goal"]
    br = turn["braking"]
    tr = turn["traction"]
    ar = turn["aero_ride"]
    e.update({
        "lock_front_excess": float(br["brake_locking_risk_front"]) - float(sg["brake_locking_risk_front"]),
        "lock_rear_excess":  float(br["brake_locking_risk_rear"])  - float(sg["brake_locking_risk_rear"]),
        "traction_excess":   float(tr["traction_loss_index"])      - float(sg["traction_loss_index"]),
        "porpoise_excess":   float(ar["porpoising_amplitude_mm"])  - float(sg["porpoising_amplitude_mm"]),
    })
    # Thermal deltas (surface temps vs target)
    tg = doc["targets"]["tyre_goal"]
    surf = turn["tyre"]["surface_temp_c"]
    for ax in ["fl","fr","rl","rr"]:
        e[f"surf_{ax}_excess"] = float(surf[ax]) - float(tg["surface_temp_target_c"])
    return e

# ---------- Rules Engine (domain heuristics) ----------

def propose_turn_changes(
    turn: Dict[str, Any],
    errs: Dict[str, float],
    caps: Dict[str, float],
    prefs: UserPreferences,
) -> Dict[str, float]:
    """
    Propose per-turn changes based on error signals.
    Returns deltas keyed by setting names, before weighting and capping.
    """
    e = errs
    move: Dict[str, float] = {}

    # --- Entry balance ---
    if e["d_entry"] > +0.10:  # too lively (oversteer) on entry
        move["brake_bias_percent_front"] = move.get("brake_bias_percent_front", 0) + ( +0.4 * prefs.brake_bias_sensitivity )
        move["diff_entry_percent"]       = move.get("diff_entry_percent", 0)       + ( +3.0 * prefs.diff_sensitivity )
        move["front_wing_flap_deg"]      = move.get("front_wing_flap_deg", 0)      + ( -0.2 * prefs.wing_sensitivity )
    if e["d_entry"] < -0.10:  # entry push (understeer)
        move["brake_bias_percent_front"] = move.get("brake_bias_percent_front", 0) + ( -0.3 * prefs.brake_bias_sensitivity )
        move["diff_entry_percent"]       = move.get("diff_entry_percent", 0)       + ( -2.0 * prefs.diff_sensitivity )
        move["front_wing_flap_deg"]      = move.get("front_wing_flap_deg", 0)      + ( +0.2 * prefs.wing_sensitivity )

    # --- Mid balance ---
    if e["d_mid"] < -0.08:    # mid understeer (needs front bite)
        move["front_wing_flap_deg"]      = move.get("front_wing_flap_deg", 0)      + ( +0.3 * prefs.wing_sensitivity )
        move["front_toe_out_deg_total"]  = move.get("front_toe_out_deg_total", 0)  + ( +0.01 * prefs.toe_sensitivity )
        # Kerb impact => back off HS bump
        if float(turn["track_env"]["kerb_impact_g"]) > 0.8:
            move["high_speed_bump"]      = move.get("high_speed_bump", 0)          + ( -1.0 * prefs.damper_sensitivity )

    if e["d_mid"] > +0.08:    # mid oversteer (front too strong / rear too weak aero platform)
        move["rear_wing_main_deg"]       = move.get("rear_wing_main_deg", 0)       + ( +0.3 * prefs.wing_sensitivity )
        move["front_wing_flap_deg"]      = move.get("front_wing_flap_deg", 0)      + ( -0.1 * prefs.wing_sensitivity )

    # --- Exit balance / traction ---
    if e["d_exit"] > +0.10 or e["traction_excess"] > 0.10:
        move["diff_exit_percent"]        = move.get("diff_exit_percent", 0)        + ( -3.0 * prefs.diff_sensitivity )
        move["rear_arb_steps"]           = move.get("rear_arb_steps", 0)           + ( -1.0 * prefs.arb_sensitivity )
        move["ers_exit_scale"]           = move.get("ers_exit_scale", 0)           + ( -0.2 )  # scale factor to apply on exits at this corner

    if e["d_exit"] < -0.10 and e["traction_excess"] < -0.05: # exit understeer + good traction -> can free diff a bit
        move["diff_exit_percent"]        = move.get("diff_exit_percent", 0)        + ( +2.0 * prefs.diff_sensitivity )

    # --- Braking stability ---
    if e["lock_front_excess"] > 0.05:
        move["brake_bias_percent_front"] = move.get("brake_bias_percent_front", 0) + ( -0.3 * prefs.brake_bias_sensitivity )
        move["brake_migration_map"]      = move.get("brake_migration_map", 0)      + ( +1.0 )

    if e["lock_rear_excess"] > 0.05:
        move["brake_bias_percent_front"] = move.get("brake_bias_percent_front", 0) + ( +0.2 * prefs.brake_bias_sensitivity )

    # --- Thermal trims ---
    rr_hot = e.get("surf_rr_excess", 0.0)
    rl_hot = e.get("surf_rl_excess", 0.0)
    if rr_hot > 5.0 or rl_hot > 5.0:
        move["pressures_psi_rr"]         = move.get("pressures_psi_rr", 0)         + ( -0.3 * prefs.pressure_sensitivity )
        move["pressures_psi_rl"]         = move.get("pressures_psi_rl", 0)         + ( -0.3 * prefs.pressure_sensitivity )
        move["diff_exit_percent"]        = move.get("diff_exit_percent", 0)        + ( -1.0 * prefs.diff_sensitivity )

    fl_hot = e.get("surf_fl_excess", 0.0)
    fr_hot = e.get("surf_fr_excess", 0.0)
    if fl_hot > 5.0 or fr_hot > 5.0:
        move["pressures_psi_fl"]         = move.get("pressures_psi_fl", 0)         + ( -0.3 * prefs.pressure_sensitivity )
        move["pressures_psi_fr"]         = move.get("pressures_psi_fr", 0)         + ( -0.3 * prefs.pressure_sensitivity )
        # If mid understeer present, prefer wing change over pressure to keep front alive

    # --- Ride & floor ---
    if e["porpoise_excess"] > 0.2 or float(turn["aero_ride"]["bottoming_risk_index"]) > 0.4:
        move["ride_height_rear_mm"]      = move.get("ride_height_rear_mm", 0)      + ( +2.0 * prefs.ride_height_sensitivity )
        move["beam_wing_slot_gap_mm"]    = move.get("beam_wing_slot_gap_mm", 0)    + ( +0.5 )

    # Clip per-turn step caps
    capped = {}
    for k, v in move.items():
        cap = abs(float(caps.get(k, v if v != 0 else 1.0)))
        capped[k] = _clamp(v, -cap, cap)

    # Preference aggression scaling
    _dict_scale_inplace(capped, 0.7 + 0.6 * prefs.aggression)  # 0.7..1.3x
    return capped

# ---------- Aggregation & Application ----------

APPLY_ORDER = [
    # pressures first (thermal stability)
    "pressures_psi_fl", "pressures_psi_fr", "pressures_psi_rl", "pressures_psi_rr",
    # brakes
    "brake_bias_percent_front", "brake_migration_map",
    # diff
    "diff_entry_percent", "diff_mid_percent", "diff_exit_percent",
    # aero balance (front/rear wing & beam)
    "front_wing_flap_deg", "rear_wing_main_deg", "beam_wing_slot_gap_mm",
    # chassis
    "rear_arb_steps", "high_speed_bump",
    # alignment
    "front_toe_out_deg_total", "rear_toe_in_deg_total",
    # ride heights last
    "ride_height_front_mm", "ride_height_rear_mm"
]

def aggregate_moves(
    per_turn_moves: List[Dict[str, float]],
    per_turn_weights: List[float],
) -> Dict[str, float]:
    assert len(per_turn_moves) == len(per_turn_weights)
    agg: Dict[str, float] = {}
    for mv, w in zip(per_turn_moves, per_turn_weights):
        for k, v in mv.items():
            agg[k] = agg.get(k, 0.0) + w * v
    return agg

def apply_moves_in_order_and_clip(
    setup: Dict[str, Any],
    move: Dict[str, float],
    limits: Dict[str, Any],
) -> Dict[str, Any]:
    """Apply aggregated move in a safe order and clip to absolute limits."""
    s = copy.deepcopy(setup)

    # Helper to get & set nested fields
    def _get_set(path: List[str], delta: float) -> None:
        nonlocal s
        # navigate
        d = s
        for k in path[:-1]:
            d = d[k]
        leaf = path[-1]
        old = float(d.get(leaf, 0.0) or 0.0)
        new_val = old + float(delta)

        # Clip by absolute limits if available
        lim = limits.get(leaf) if isinstance(limits, dict) else None
        if lim is None:
            # try namespaced (e.g., pressures)
            if leaf.startswith("pressures_psi"):
                lo, hi = limits.get("pressures_psi", [None, None])
                if lo is not None and hi is not None:
                    new_val = _clamp(new_val, float(lo), float(hi))
        else:
            lo, hi = float(lim[0]), float(lim[1])
            new_val = _clamp(new_val, lo, hi)

        d[leaf] = new_val

    # Map setting keys to their JSON paths
    PATHS = {
        "pressures_psi_fl": ["tyres", "pressures_psi", "fl"],
        "pressures_psi_fr": ["tyres", "pressures_psi", "fr"],
        "pressures_psi_rl": ["tyres", "pressures_psi", "rl"],
        "pressures_psi_rr": ["tyres", "pressures_psi", "rr"],
        "brake_bias_percent_front": ["brakes", "brake_bias_percent_front"],
        "brake_migration_map": ["brakes", "brake_migration_map"],
        "diff_entry_percent": ["differential_and_power", "diff_entry_percent"],
        "diff_mid_percent": ["differential_and_power", "diff_mid_percent"],
        "diff_exit_percent": ["differential_and_power", "diff_exit_percent"],
        "front_wing_flap_deg": ["aero", "front_wing_flap_deg"],
        "rear_wing_main_deg": ["aero", "rear_wing_main_deg"],
        "beam_wing_slot_gap_mm": ["aero", "beam_wing_slot_gap_mm"],
        "rear_arb_steps": ["ride_and_suspension", "antiroll_bar_scale_0_10", "rear"],
        "high_speed_bump": ["ride_and_suspension", "dampers_clicks", "high_speed_bump"],
        "front_toe_out_deg_total": ["alignment", "front_toe_out_deg_total"],
        "rear_toe_in_deg_total": ["alignment", "rear_toe_in_deg_total"],
        "ride_height_front_mm": ["ride_and_suspension", "ride_height_front_mm"],
        "ride_height_rear_mm": ["ride_and_suspension", "ride_height_rear_mm"],
    }

    # Ensure all paths exist
    def _ensure_path(s: Dict[str, Any], path: List[str]) -> None:
        cur = s
        for k in path[:-1]:
            if k not in cur or not isinstance(cur[k], dict):
                cur[k] = {}
            cur = cur[k]

    for key in APPLY_ORDER:
        if key in move and key in PATHS:
            _ensure_path(s, PATHS[key])
            _get_set(PATHS[key], move[key])

    # Handle ERS exit scaling per-corner by converting to a global heuristic:
    # If many corners requested ERS cuts on exit, reduce default per-corner ERS by avg scale
    ers_scale_requests = [v for k, v in move.items() if k == "ers_exit_scale"]
    if ers_scale_requests:
        avg_cut = np.clip(np.mean(ers_scale_requests), -0.4, 0.0)
        # Apply a default policy: reduce all exits by avg_cut proportionally
        corner_deploy = _safe_get(s, "differential_and_power", "ers_corner_deployment", default={}) or {}
        for ck in list(corner_deploy.keys()):
            corner_deploy[ck] = float(corner_deploy[ck]) * (1.0 + avg_cut)
        s["differential_and_power"]["ers_corner_deployment"] = corner_deploy

    return s

# ---------- Public API ----------

def compute_setup_from_doc(
    doc: Dict[str, Any],
    user_prefs: UserPreferences | None = None,
) -> Dict[str, Any]:
    """
    Main entry: produce an optimized setup from the full JSON doc.
    Respects user preferences (stability bias, control linearities, etc.).
    """
    validate_schema(doc)
    if user_prefs is None:
        user_prefs = build_preferences_from_doc(doc)
    prefs = user_prefs

    weights_conf = _safe_get(doc, "weights_and_constraints", "per_turn_step_caps", default={}) or {}
    abs_limits = _safe_get(doc, "weights_and_constraints", "absolute_limits", default={}) or {}
    turns = doc["turns"]

    per_turn_moves = []
    per_turn_weights = []

    # Robust pre-weighting by leverage: scale by Huber on errors to downweight outliers
    for t in turns:
        errs = error_vector_for_turn(t, doc)

        # Compute a scalar "error magnitude" for robust weighting (Huber downweight big outliers)
        err_vals = np.array(list(_nan_to_num_dict(errs).values()), dtype=float)
        err_mag = float(np.mean([_huber(x, delta=0.8) for x in err_vals]))
        base_w = compute_corner_weight(t, doc)

        # Downweight high-error outliers slightly to avoid overfitting a single awkward corner
        outlier_scale = 1.0 / (1.0 + 0.6 * err_mag)
        w = base_w * outlier_scale

        mv = propose_turn_changes(t, errs, weights_conf, prefs)
        per_turn_moves.append(mv)
        per_turn_weights.append(w)

    # Aggregate across corners
    agg_move = aggregate_moves(per_turn_moves, per_turn_weights)

    # Apply in safe order and clip to absolute limits
    initial_setup = copy.deepcopy(doc["initial_setup"])
    new_setup = apply_moves_in_order_and_clip(initial_setup, agg_move, abs_limits)

    # Return both the new setup and some diagnostics
    diags = {
        "per_turn_weights": per_turn_weights,
        "aggregated_move": agg_move,
        "preferences": prefs.__dict__,
    }

    return {"optimized_setup": new_setup, "diagnostics": diags}

# ---------- Demo ----------

DEMO_DOC = {
  "metadata": {
    "track": "austin_cota",
    "session": "fp2",
    "tyre_compound": "c3",
    "ambient_temp_c": 29,
    "track_temp_c": 43,
    "wind_kmh": 14,
    "rookie_stability_priority": 0.8,
    "parc_ferme_safe": True
  },
  "targets": {
    "balance_goal": {"entry_oversteer_index": -0.08, "mid_oversteer_index": -0.04, "exit_oversteer_index": -0.05},
    "stability_goal": {"brake_locking_risk_front": 0.15, "brake_locking_risk_rear": 0.10, "traction_loss_index": 0.18, "porpoising_amplitude_mm": 0.0},
    "tyre_goal": {"core_temp_target_c": 95, "surface_temp_target_c": 100, "wear_balance_delta_pct_rl_rr": 0.0}
  },
  "weights_and_constraints": {
    "time_loss_weight_cap": 3.0,
    "per_turn_step_caps": {
      "brake_bias_percent_front": 0.8,
      "diff_entry_percent": 6,
      "diff_mid_percent": 6,
      "diff_exit_percent": 6,
      "front_wing_flap_deg": 0.6,
      "rear_wing_main_deg": 1.0,
      "front_toe_out_deg_total": 0.03,
      "rear_toe_in_deg_total": 0.04,
      "rear_arb_steps": 2,
      "high_speed_bump": 2,
      "ride_height_mm": 3,
      "pressures_psi": 0.6
    },
    "absolute_limits": {
      "front_camber_deg": [-3.6, -2.8],
      "rear_camber_deg": [-2.2, -1.6],
      "pressures_psi": [20.0, 24.5],
      "brake_bias_percent_front": [53.0, 58.5]
    }
  },
  "telemetry_units": {
    "speed": "kmh", "g": "g", "temp": "c", "pressure": "psi", "energy": "kj"
  },
  "turns": [
    {
      "turn_id": "t1",
      "name": "t1_hairpin_uphill",
      "sector": 1,
      "length_m": 375,
      "time_loss_weight": 1.3,
      "occurrence_rate": 1.0,
      "driver_confidence_weight": 1.2,
      "balance": { "entry_oversteer_index": 0.14, "mid_oversteer_index": 0.02, "exit_oversteer_index": 0.07 },
      "braking": { "brake_locking_risk_front": 0.26, "brake_locking_risk_rear": 0.08, "min_long_g_brake": -4.5 },
      "traction": { "traction_loss_index": 0.21, "deployment_wheelspin_risk": 0.18, "max_long_g_exit": 0.82 },
      "tyre": {
        "core_temp_c": { "fl": 96, "fr": 97, "rl": 93, "rr": 94 },
        "surface_temp_c": { "fl": 104, "fr": 105, "rl": 99, "rr": 100 },
        "pressures_psi": { "fl": 22.1, "fr": 22.2, "rl": 21.1, "rr": 21.0 },
        "wear_rate_pct_per_lap": { "fl": 2.1, "fr": 2.2, "rl": 1.8, "rr": 1.8 },
        "graining_risk": { "fl": 0.10, "fr": 0.12, "rl": 0.05, "rr": 0.05 },
        "blister_risk": { "fl": 0.08, "fr": 0.07, "rl": 0.05, "rr": 0.06 }
      },
      "aero_ride": { "aero_balance_shift_front_pct": 0.4, "porpoising_amplitude_mm": 0.0, "bottoming_risk_index": 0.05, "ride_height_margin_min_mm": 4.0 },
      "track_env": { "grip_index": 0.62, "wind_yaw_deg": 8.0, "wind_speed_kmh": 14, "kerb_impact_g": 0.6, "bump_rms_mm": 1.2 },
      "kinematics": { "v_entry_kmh": 305, "v_apex_kmh": 68, "v_exit_kmh": 228, "lat_g_apex": 1.6, "throttle_time_90pct_ms": 420, "brake_time_80pct_ms": 980 },
      "ers_fuel": { "ers_soc_start_pct": 86, "ers_soc_end_pct": 82, "mguk_harvest_kj": 220, "ers_deploy_kj": 45, "lift_and_coast_m": 0 },
      "flags": { "incidents_count": 0, "track_limits_warning": False }
    },
    {
      "turn_id": "t3_t6",
      "name": "esses_complex",
      "sector": 1,
      "length_m": 720,
      "time_loss_weight": 1.1,
      "occurrence_rate": 1.0,
      "driver_confidence_weight": 1.0,
      "balance": { "entry_oversteer_index": -0.02, "mid_oversteer_index": -0.11, "exit_oversteer_index": -0.06 },
      "braking": { "brake_locking_risk_front": 0.07, "brake_locking_risk_rear": 0.05, "min_long_g_brake": -2.3 },
      "traction": { "traction_loss_index": 0.09, "deployment_wheelspin_risk": 0.05, "max_long_g_exit": 0.55 },
      "tyre": {
        "core_temp_c": { "fl": 97, "fr": 98, "rl": 94, "rr": 94 },
        "surface_temp_c": { "fl": 103, "fr": 104, "rl": 99, "rr": 99 },
        "pressures_psi": { "fl": 22.2, "fr": 22.3, "rl": 21.1, "rr": 21.1 },
        "wear_rate_pct_per_lap": { "fl": 2.0, "fr": 2.1, "rl": 1.7, "rr": 1.7 },
        "graining_risk": { "fl": 0.14, "fr": 0.16, "rl": 0.06, "rr": 0.06 },
        "blister_risk": { "fl": 0.06, "fr": 0.06, "rl": 0.04, "rr": 0.04 }
      },
      "aero_ride": { "aero_balance_shift_front_pct": -0.2, "porpoising_amplitude_mm": 0.0, "bottoming_risk_index": 0.04, "ride_height_margin_min_mm": 5.0 },
      "track_env": { "grip_index": 0.64, "wind_yaw_deg": 6.0, "wind_speed_kmh": 13, "kerb_impact_g": 0.9, "bump_rms_mm": 1.4 },
      "kinematics": { "v_entry_kmh": 270, "v_apex_kmh": 220, "v_exit_kmh": 255, "lat_g_apex": 3.5, "throttle_time_90pct_ms": 580, "brake_time_80pct_ms": 120 },
      "ers_fuel": { "ers_soc_start_pct": 82, "ers_soc_end_pct": 79, "mguk_harvest_kj": 110, "ers_deploy_kj": 70, "lift_and_coast_m": 0 },
      "flags": { "incidents_count": 0, "track_limits_warning": False }
    },
    {
      "turn_id": "t11",
      "name": "t11_hairpin",
      "sector": 2,
      "length_m": 280,
      "time_loss_weight": 1.2,
      "occurrence_rate": 1.0,
      "driver_confidence_weight": 1.2,
      "balance": { "entry_oversteer_index": 0.05, "mid_oversteer_index": 0.01, "exit_oversteer_index": 0.16 },
      "braking": { "brake_locking_risk_front": 0.19, "brake_locking_risk_rear": 0.11, "min_long_g_brake": -4.1 },
      "traction": { "traction_loss_index": 0.31, "deployment_wheelspin_risk": 0.27, "max_long_g_exit": 0.88 },
      "tyre": {
        "core_temp_c": { "fl": 96, "fr": 97, "rl": 97, "rr": 99 },
        "surface_temp_c": { "fl": 103, "fr": 104, "rl": 107, "rr": 110 },
        "pressures_psi": { "fl": 22.3, "fr": 22.3, "rl": 21.3, "rr": 21.4 },
        "wear_rate_pct_per_lap": { "fl": 1.9, "fr": 2.0, "rl": 2.2, "rr": 2.5 },
        "graining_risk": { "fl": 0.10, "fr": 0.10, "rl": 0.18, "rr": 0.22 },
        "blister_risk": { "fl": 0.06, "fr": 0.06, "rl": 0.12, "rr": 0.16 }
      },
      "aero_ride": { "aero_balance_shift_front_pct": 0.1, "porpoising_amplitude_mm": 0.0, "bottoming_risk_index": 0.03, "ride_height_margin_min_mm": 4.5 },
      "track_env": { "grip_index": 0.66, "wind_yaw_deg": 3.0, "wind_speed_kmh": 11, "kerb_impact_g": 0.4, "bump_rms_mm": 0.9 },
      "kinematics": { "v_entry_kmh": 290, "v_apex_kmh": 72, "v_exit_kmh": 240, "lat_g_apex": 1.7, "throttle_time_90pct_ms": 500, "brake_time_80pct_ms": 820 },
      "ers_fuel": { "ers_soc_start_pct": 79, "ers_soc_end_pct": 74, "mguk_harvest_kj": 190, "ers_deploy_kj": 85, "lift_and_coast_m": 0 },
      "flags": { "incidents_count": 1, "track_limits_warning": False }
    },
    {
      "turn_id": "t12",
      "name": "t12_heavy_brake",
      "sector": 2,
      "length_m": 200,
      "time_loss_weight": 1.1,
      "occurrence_rate": 1.0,
      "driver_confidence_weight": 1.1,
      "balance": { "entry_oversteer_index": 0.10, "mid_oversteer_index": -0.02, "exit_oversteer_index": 0.02 },
      "braking": { "brake_locking_risk_front": 0.28, "brake_locking_risk_rear": 0.09, "min_long_g_brake": -4.6 },
      "traction": { "traction_loss_index": 0.14, "deployment_wheelspin_risk": 0.10, "max_long_g_exit": 0.70 },
      "tyre": {
        "core_temp_c": { "fl": 98, "fr": 99, "rl": 96, "rr": 97 },
        "surface_temp_c": { "fl": 106, "fr": 107, "rl": 102, "rr": 103 },
        "pressures_psi": { "fl": 22.4, "fr": 22.5, "rl": 21.2, "rr": 21.2 },
        "wear_rate_pct_per_lap": { "fl": 2.2, "fr": 2.3, "rl": 1.9, "rr": 1.9 },
        "graining_risk": { "fl": 0.12, "fr": 0.14, "rl": 0.06, "rr": 0.06 },
        "blister_risk": { "fl": 0.08, "fr": 0.08, "rl": 0.05, "rr": 0.05 }
      },
      "aero_ride": { "aero_balance_shift_front_pct": 0.2, "porpoising_amplitude_mm": 0.0, "bottoming_risk_index": 0.05, "ride_height_margin_min_mm": 4.0 },
      "track_env": { "grip_index": 0.65, "wind_yaw_deg": 2.0, "wind_speed_kmh": 10, "kerb_impact_g": 0.3, "bump_rms_mm": 1.0 },
      "kinematics": { "v_entry_kmh": 325, "v_apex_kmh": 120, "v_exit_kmh": 220, "lat_g_apex": 2.1, "throttle_time_90pct_ms": 360, "brake_time_80pct_ms": 900 },
      "ers_fuel": { "ers_soc_start_pct": 74, "ers_soc_end_pct": 72, "mguk_harvest_kj": 230, "ers_deploy_kj": 40, "lift_and_coast_m": 10 },
      "flags": { "incidents_count": 0, "track_limits_warning": False }
    },
    {
      "turn_id": "t16_t18",
      "name": "long_right",
      "sector": 3,
      "length_m": 620,
      "time_loss_weight": 1.2,
      "occurrence_rate": 1.0,
      "driver_confidence_weight": 1.1,
      "balance": { "entry_oversteer_index": -0.04, "mid_oversteer_index": 0.06, "exit_oversteer_index": 0.11 },
      "braking": { "brake_locking_risk_front": 0.05, "brake_locking_risk_rear": 0.05, "min_long_g_brake": -1.5 },
      "traction": { "traction_loss_index": 0.26, "deployment_wheelspin_risk": 0.22, "max_long_g_exit": 0.86 },
      "tyre": {
        "core_temp_c": { "fl": 95, "fr": 96, "rl": 100, "rr": 103 },
        "surface_temp_c": { "fl": 101, "fr": 102, "rl": 109, "rr": 113 },
        "pressures_psi": { "fl": 22.2, "fr": 22.2, "rl": 21.4, "rr": 21.6 },
        "wear_rate_pct_per_lap": { "fl": 1.8, "fr": 1.9, "rl": 2.6, "rr": 2.9 },
        "graining_risk": { "fl": 0.08, "fr": 0.08, "rl": 0.20, "rr": 0.25 },
        "blister_risk": { "fl": 0.06, "fr": 0.06, "rl": 0.15, "rr": 0.20 }
      },
      "aero_ride": { "aero_balance_shift_front_pct": -0.1, "porpoising_amplitude_mm": 0.0, "bottoming_risk_index": 0.03, "ride_height_margin_min_mm": 5.0 },
      "track_env": { "grip_index": 0.66, "wind_yaw_deg": 4.0, "wind_speed_kmh": 12, "kerb_impact_g": 0.4, "bump_rms_mm": 0.8 },
      "kinematics": { "v_entry_kmh": 215, "v_apex_kmh": 190, "v_exit_kmh": 230, "lat_g_apex": 3.2, "throttle_time_90pct_ms": 840, "brake_time_80pct_ms": 0 },
      "ers_fuel": { "ers_soc_start_pct": 72, "ers_soc_end_pct": 68, "mguk_harvest_kj": 50, "ers_deploy_kj": 80, "lift_and_coast_m": 0 },
      "flags": { "incidents_count": 0, "track_limits_warning": False }
    },
    {
      "turn_id": "t20",
      "name": "final_corner",
      "sector": 3,
      "length_m": 180,
      "time_loss_weight": 1.3,
      "occurrence_rate": 1.0,
      "driver_confidence_weight": 1.2,
      "balance": { "entry_oversteer_index": -0.03, "mid_oversteer_index": -0.01, "exit_oversteer_index": 0.18 },
      "braking": { "brake_locking_risk_front": 0.11, "brake_locking_risk_rear": 0.09, "min_long_g_brake": -2.8 },
      "traction": { "traction_loss_index": 0.33, "deployment_wheelspin_risk": 0.30, "max_long_g_exit": 0.92 },
      "tyre": {
        "core_temp_c": { "fl": 95, "fr": 96, "rl": 100, "rr": 101 },
        "surface_temp_c": { "fl": 101, "fr": 102, "rl": 108, "rr": 110 },
        "pressures_psi": { "fl": 22.1, "fr": 22.2, "rl": 21.2, "rr": 21.3 },
        "wear_rate_pct_per_lap": { "fl": 1.8, "fr": 1.8, "rl": 2.3, "rr": 2.6 },
        "graining_risk": { "fl": 0.07, "fr": 0.08, "rl": 0.18, "rr": 0.22 },
        "blister_risk": { "fl": 0.05, "fr": 0.05, "rl": 0.14, "rr": 0.18 }
      },
      "aero_ride": { "aero_balance_shift_front_pct": 0.0, "porpoising_amplitude_mm": 0.0, "bottoming_risk_index": 0.02, "ride_height_margin_min_mm": 5.0 },
      "track_env": { "grip_index": 0.67, "wind_yaw_deg": 3.0, "wind_speed_kmh": 11, "kerb_impact_g": 0.5, "bump_rms_mm": 0.8 },
      "kinematics": { "v_entry_kmh": 210, "v_apex_kmh": 135, "v_exit_kmh": 280, "lat_g_apex": 2.3, "throttle_time_90pct_ms": 700, "brake_time_80pct_ms": 360 },
      "ers_fuel": { "ers_soc_start_pct": 68, "ers_soc_end_pct": 63, "mguk_harvest_kj": 40, "ers_deploy_kj": 95, "lift_and_coast_m": 0 },
      "flags": { "incidents_count": 0, "track_limits_warning": False }
    }
  ],
  "initial_setup": {
    "aero": {
      "front_wing_flap_deg": -0.8,
      "rear_wing_main_deg": 11.0,
      "beam_wing_slot_gap_mm": 8.5,
      "aero_balance_percent_front_at_250kph": 44.0
    },
    "ride_and_suspension": {
      "ride_height_front_mm": 34,
      "ride_height_rear_mm": 70,
      "rake_deg": 1.3,
      "springs_n_per_mm": { "fl": 150, "fr": 150, "rl": 165, "rr": 165 },
      "antiroll_bar_scale_0_10": { "front": 6, "rear": 4 },
      "dampers_clicks": { "low_speed_bump": 6, "low_speed_rebound": 8, "high_speed_bump": 4, "high_speed_rebound": 6 },
      "heave_spring_n_per_mm": { "front": 820, "rear": 900 }
    },
    "alignment": {
      "front_camber_deg": -3.3,
      "rear_camber_deg": -2.0,
      "front_toe_out_deg_total": 0.12,
      "rear_toe_in_deg_total": 0.22,
      "steering_ratio": 12.5
    },
    "tyres": {
      "pressures_psi": { "fl": 22.0, "fr": 22.0, "rl": 21.0, "rr": 21.0 },
      "start_purge_temp_c": 70,
      "bleed_strategy": "hold_targets_for_+12c_track_rise"
    },
    "brakes": {
      "brake_bias_percent_front": 55.6,
      "brake_migration_map": 3,
      "engine_braking_level": 5,
      "brake_duct_blank_percent_front": 32,
      "brake_duct_blank_percent_rear": 28
    },
    "differential_and_power": {
      "diff_entry_percent": 28,
      "diff_mid_percent": 32,
      "diff_exit_percent": 34,
      "throttle_map": "progressive_2",
      "ers_deploy_mode": "balanced",
      "ers_corner_deployment": {
        "t1": 0.0,
        "t3_t6_esses": 0.0,
        "t11_exit": 0.7,
        "t12": 0.0,
        "t16_t18_long_right_exit": 0.8,
        "t19": 0.4,
        "t20_exit": 1.0
      }
    },
    "cooling": { "radiator_blank_percent": 18, "oil_cooler_blank_percent": 10 },
    "fuel_and_shift": {
      "start_fuel_kg": 19.0,
      "lift_and_coast_meters_per_corner": 15,
      "shift_map": "rookie_safety_early_upshift",
      "upshift_rpm": 11700,
      "downshift_rpm": 8500
    },
    "controls": { "throttle_pedal_linearity": 0.85, "brake_pedal_linearity": 0.90, "steering_weight_preference": "medium" }
  }
}

def _demo_run():
    res = compute_setup_from_doc(DEMO_DOC)
    print("=== Optimized Setup (rookie-friendly) ===")
    pprint.pprint(res)

if __name__ == "__main__":
    _demo_run()
