from flask import Flask, jsonify
from flask_cors import CORS

from database.db import init_db
from routes.medicine_routes import medicine_routes
from routes.delivery_routes import delivery_routes


app = Flask(__name__)
CORS(app)

init_db()

app.register_blueprint(medicine_routes)
app.register_blueprint(delivery_routes)


@app.route("/")
def home():
    return jsonify({
        "app": "MediFlow SaaS",
        "status": "running",
        "message": "Backend API is working"
    })


@app.route("/api/health")
def health_check():
    return jsonify({
        "status": "ok",
        "service": "mediflow-backend"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)