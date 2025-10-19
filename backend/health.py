
def generate_report(race_data: dict) -> dict:
   
    summary_estimates = race_data.get("hpc_race_summary_estimates", {})     # expected that hpc has estimates
    events = race_data.get("significant_events", [])         # laps brah
    

    peak_lateral_g = 0          # g-force metrics
    peak_vertical_g = 0
    total_high_g_duration_ms = 0
    
    for event in events:
        g_forces = event.get("g_forces", {})
        if abs(g_forces.get("lateral_peak_g", 0)) > abs(peak_lateral_g):     # max lateral and vertical
            peak_lateral_g = g_forces.get("lateral_peak_g")
            
        if abs(g_forces.get("vertical_peak_g", 0)) > abs(peak_vertical_g):
            peak_vertical_g = g_forces.get("vertical_peak_g")
            
        if event.get("event_type") == "SustainedHighG":           # time sustained
            total_high_g_duration_ms += event.get("duration_ms", 0)

    report = {            # actual report
        "driver_id": race_data.get("driver_id"),
        "track_name": race_data.get("track_name"),
        "overall_summary": "",
        "key_metrics": [],
        "priority_recovery_plan": []
    }

    # basically check cases and have 3 thigns: severity, evidence and recommendations

    # for dehydration
    fluid_loss = summary_estimates.get("estimated_total_fluid_loss_l", 0)
    dehydration_report = {"focus_area": "Dehydration"}
    if fluid_loss > 2.5:
        dehydration_report["severity"] = "High"
        dehydration_report["evidence"] = f"HPC models estimate a significant fluid loss of {fluid_loss}L, based on a cockpit temperature of {race_data.get('cockpit_temp_c')}°C and sustained G-exertion."
        dehydration_report["recommendation"] = "Immediate intake of 1.5L of electrolyte solution over the next 60 minutes. Avoid caffeine for the next 4 hours."
    else:
        dehydration_report["severity"] = "Normal"
        dehydration_report["evidence"] = f"Estimated fluid loss of {fluid_loss}L is within expected limits."
        dehydration_report["recommendation"] = "Standard rehydration protocol."
    report["priority_recovery_plan"].append(dehydration_report)

    # Neck strain
    peak_neck_load = summary_estimates.get("peak_neck_load_equivalent_kg", 0)
    neck_strain_report = {"focus_area": "Neck Strain"}
    if peak_neck_load > 22:
        neck_strain_report["severity"] = "High"
        neck_strain_report["evidence"] = f"The vehicle experienced sustained lateral forces up to {abs(peak_lateral_g):.1f}G. Biomechanical models estimate this created a peak equivalent load of {peak_neck_load}kg on neck muscles."
        neck_strain_report["recommendation"] = "Targeted cryotherapy (ice pack) on the affected side of the neck for 15 minutes, followed by gentle stretching exercises."
    else:
        neck_strain_report["severity"] = "Low"
        neck_strain_report["evidence"] = "Neck load was within expected operational range."
        neck_strain_report["recommendation"] = "Standard stretching."
    report["priority_recovery_plan"].append(neck_strain_report)

    # spinal compression

    spinal_events = summary_estimates.get("cumulative_spinal_compression_events", 0)
    spinal_report = {"focus_area": "Spinal Compression"}
    if peak_vertical_g > 5.0 and spinal_events > 10:
        spinal_report["severity"] = "Moderate"
        spinal_report["evidence"] = f"The chassis accelerometer registered a significant vertical G-force spike of {peak_vertical_g:.1f}G from a kerb strike. The HPC counted {spinal_events} cumulative micro-compression events."
        spinal_report["recommendation"] = "10 minutes of spinal decompression stretches. Prioritize sleeping on a firm surface tonight. Report any lower back pain."
    else:
        spinal_report["severity"] = "Low"
        spinal_report["evidence"] = "Vertical loads and vibrations were within normal limits."
        spinal_report["recommendation"] = "No specific action required."
    report["priority_recovery_plan"].append(spinal_report)
    
    # Final Summary
    report["overall_summary"] = "A demanding race with significant physical exertion. Primary recovery focus should be on dehydration and neck strain."
    report["key_metrics"] = [
        {"metric": "Peak Lateral G-Force", "value": f"{abs(peak_lateral_g):.1f} G"},
        {"metric": "Peak Vertical G-Force", "value": f"{abs(peak_vertical_g):.1f} G"},
        {"metric": "Estimated Fluid Loss", "value": f"{fluid_loss} Liters"},
        {"metric": "Peak Neck Load", "value": f"~{peak_neck_load} kg"},
    ]

    return report


