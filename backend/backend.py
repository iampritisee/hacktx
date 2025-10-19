from flask import Flask, jsonify, request

app = Flask(__name__)

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials

from poc import compute_setup_from_doc


cred = credentials.Certificate("../serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/dataForConfig', methods = ['POST'])
def get_ideal_config():

  questionnaire = request.get_json()       # questionnaire response only (metadata present in firestore)

  query = db.collection("test_drive").limit(1)
  results = list(query.stream())

  metadoc = results[0]

  calc_doc = metadoc.to_dict()

  stability = questionnaire.get('rookie_stability_priority')     # get the preferences
  steering = questionnaire.get('steering_weight_preference')
  throttle = questionnaire.get('throttle_pedal_linearity')
  brake = questionnaire.get('brake_pedal_linearity')

  if 'controls' not in calc_doc['initial_setup']:
    calc_doc['initial_setup']['controls'] = {}

  # changing preferences in metadoc
  calc_doc['metadata']['rookie_stability_priority'] = float(stability)
  calc_doc['initial_setup']['controls']['steering_weight_preference'] = steering
  calc_doc['initial_setup']['controls']['throttle_pedal_linearity'] = float(throttle)
  calc_doc['initial_setup']['controls']['brake_pedal_linearity'] = float(brake)

  result = compute_setup_from_doc(calc_doc)     # function from poc

  return jsonify(result.get("optimized_setup", {}))       # return result



@app.route('/feedback')
def give_feedback():

  inp_data = request.get_json()       # receive metadata at that turn

  turn_id = inp_data['turn']

  all_docs_stream = db.collection("reference_laps").stream()
        
  reference_point_data = None

  for doc in all_docs_stream:
    reference_lap_doc = doc.to_dict()
    reference_turns_data = reference_lap_doc.get('turns_data', [])
            # Loop through the turns data array inside the document
    for turn_data in reference_turns_data:
        if turn_data.get('turn') == turn_id:
          reference_point_data = turn_data
          break  # Found the turn
    if reference_point_data:
      break  # Found the turn, stop searching other documents

  if not reference_point_data:
    return jsonify({"error": f"No reference data found for turn {turn_id} in any test drive."}), 404

  # result = calc_feedback(data)     # computation for getting feedback

  # return jsonify(result)      # give feedback



if __name__ == "__main__":
  app.run(debug=True)