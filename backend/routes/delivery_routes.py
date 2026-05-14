from flask import Blueprint, jsonify
from models.delivery_model import (
    get_all_deliveries,
    get_delivery_items
)

delivery_routes = Blueprint("delivery_routes", __name__)


@delivery_routes.route("/api/deliveries", methods=["GET"])
def deliveries_list():
    deliveries = get_all_deliveries()

    return jsonify({
        "success": True,
        "data": deliveries
    })


@delivery_routes.route("/api/deliveries/<int:delivery_id>/items", methods=["GET"])
def deliveries_items(delivery_id):
    items = get_delivery_items(delivery_id)

    return jsonify({
        "success": True,
        "data": items
    })