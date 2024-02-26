# Python HTTP server.

from flask import Flask, request, jsonify
from flask_cors import CORS
from calculations import top_k, top_k_pairs, composition, check
from feedbacks import record_feedback

app = Flask(__name__)
CORS(app)

def safe_request(arg: str, default: int) -> int:
    try:
        return int(request.args.get(arg, default))
    except ValueError:
        return 0

# This is merely for preventing overloading the disk, str cannot be arbitrary long.
# (which means you can actually send me any content using e.g. postman...)
def check_feedback_sanity(word: str, task_id: int, answer: str, like: bool) -> bool:
    if len(word) > 30:
        return False
    if task_id not in [1, 2, 3]:
        return False
    if len(answer) > 20:
        return False
    return True

@app.route('/toki/<word>', methods=['GET'])
def query(word: str):
    if not check(word):
        return jsonify({
            "query": word,
            "success": False,
        })

    k1 = safe_request("k1", 10)
    k2 = safe_request("k2", 10)
    k3 = safe_request("k3", 10)

    return jsonify({
        "query": word,
        "success": True,
        "top_k": top_k(word, k1) if k1 > 0 else [],
        "top_k_pairs": top_k_pairs(word, k2) if k2 > 0 else [],
        "composition": composition(word, k3) if k3 > 0 else [],
    })

@app.route('/like/<word>', methods=['POST'])
def like(word: str):
    task_id = request.args.get("task_id", 0, type=int)
    answer = request.args.get("answer", "")
    like = True
    if not check_feedback_sanity(word, task_id, answer, like):
        return jsonify({
            "success": False,
        })
    record_feedback(word, task_id, answer, like)
    return jsonify({
        "success": True,
    })

@app.route('/dislike/<word>', methods=['POST'])
def dislike(word: str):
    task_id = request.args.get("task_id", 0, type=int)
    answer = request.args.get("answer", "")
    like = False
    if not check_feedback_sanity(word, task_id, answer, like):
        return jsonify({
            "success": False,
        })
    record_feedback(word, task_id, answer, like)
    return jsonify({
        "success": True,
    })

if __name__ == "__main__":
    with open("config.txt") as f:
        cert_file, key_file, hostname = f.read().splitlines()
    context = (cert_file, key_file)
    app.run(host=hostname, port=443, ssl_context=context)
