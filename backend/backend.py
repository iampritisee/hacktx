from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/dataForConfig', methods = ['GET'])
def get_ideal_config():

  data = request.get_json()       # array of jsons for turns and questionnaire response


  # result = calc_config(data)      (assume calc_config is computation)
  # return jsonify(result)       # give back the ideal config


@app.route('/feedback')
def give_feedback():

  data = request.get_json()       # receive metadata at that turn

  # result = calc_feedback(data)     # computation for getting feedback

  # return jsonify(result)      # give feedback


if __name__ == "__main__":
  app.run(debug=True)