from flask import Flask, jsonify, request

app = Flask(__name__)

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials

cred = credentials.Certificate("../serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()



  
@app.route('/dataForConfig', methods = ['POST'])
def get_ideal_config():

  data = request.get_json()       # array of jsons for turns and questionnaire response

  try:
    # Get a reference to a new document in a collection named 'test'
    update_time, doc_ref = db.collection("config_requests").add(data[0])
    


  except Exception as e:
    print(f"--- ERROR ---")
    print(e)

  # result = calc_config(data)      (assume calc_config is computation)
  # return jsonify(result)       # give back the ideal config


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