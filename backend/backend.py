from flask import Flask, jsonify, request

app = Flask(__name__)

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials

import os

from poc import compute_setup_from_doc
from health import generate_report
from flask_cors import CORS

CORS(app)
# CORS(app, resources={r"/": {"origins": "*"}})

basedir = os.path.dirname((os.path.dirname(os.path.abspath(__file__))))

cred = credentials.Certificate(os.path.join(basedir, "serviceAccountKey.json"))
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

  print(result)
  return jsonify(result)       # return result



@app.route('/feedback')
def give_feedback():

  query = db.collection("race_data").limit(1)      # retrieve race_data
  results = list(query.stream())

  data = results[0]
  
  converted_data = data.to_dict()
  result = generate_report(converted_data)      # return health result

  return jsonify(result, 200)



if __name__ == "__main__":
  app.run(debug=True)