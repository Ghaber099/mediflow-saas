from flask import Blueprint, request, jsonify

from models.medicine_model import (
    get_all_medicines,
    get_medicine_by_id,
    get_medicine_by_barcode,
    create_medicine,
    update_medicine,
    update_medicine_stock,
    delete_medicine
)

from models.delivery_model import (
    create_delivery,
    create_delivery_item
)


medicine_routes = Blueprint("medicine_routes", __name__)


@medicine_routes.route("/api/medicines", methods=["GET"])
def medicines_list():
    medicines = get_all_medicines()

    return jsonify({
        "success": True,
        "data": medicines
    })


@medicine_routes.route("/api/medicines/<int:medicine_id>", methods=["GET"])
def medicines_get_one(medicine_id):
    medicine = get_medicine_by_id(medicine_id)

    if not medicine:
        return jsonify({
            "success": False,
            "message": "Medicine not found"
        }), 404

    return jsonify({
        "success": True,
        "data": medicine
    })


@medicine_routes.route("/api/medicines", methods=["POST"])
def medicines_create():
    data = request.get_json()

    required_fields = ["name", "category", "batch", "expiry_date"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"{field} is required"
            }), 400

    medicine_id = create_medicine(data)

    return jsonify({
        "success": True,
        "message": "Medicine created successfully",
        "medicine_id": medicine_id
    }), 201


@medicine_routes.route("/api/medicines/<int:medicine_id>", methods=["PUT"])
def medicines_update(medicine_id):
    data = request.get_json()

    existing = get_medicine_by_id(medicine_id)

    if not existing:
        return jsonify({
            "success": False,
            "message": "Medicine not found"
        }), 404

    required_fields = ["name", "category", "batch", "expiry_date"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"{field} is required"
            }), 400

    update_medicine(medicine_id, data)

    return jsonify({
        "success": True,
        "message": "Medicine updated successfully"
    })


@medicine_routes.route("/api/medicines/barcode/<barcode>", methods=["GET"])
def medicines_barcode(barcode):
    medicine = get_medicine_by_barcode(barcode)

    if not medicine:
        return jsonify({
            "success": False,
            "message": "Medicine not found"
        }), 404

    return jsonify({
        "success": True,
        "data": medicine
    })


@medicine_routes.route("/api/medicines/<int:medicine_id>/stock", methods=["PATCH"])
def medicines_update_stock(medicine_id):
    data = request.get_json()
    quantity = data.get("quantity", 0)

    update_medicine_stock(medicine_id, quantity)

    return jsonify({
        "success": True,
        "message": "Stock updated successfully"
    })


@medicine_routes.route("/api/medicines/<int:medicine_id>", methods=["DELETE"])
def medicines_delete(medicine_id):
    existing = get_medicine_by_id(medicine_id)

    if not existing:
        return jsonify({
            "success": False,
            "message": "Medicine not found"
        }), 404

    delete_medicine(medicine_id)

    return jsonify({
        "success": True,
        "message": "Medicine deleted successfully"
    })


@medicine_routes.route("/api/medicines/bulk-delivery", methods=["POST"])
def medicines_bulk_delivery():
    data = request.get_json()

    delivery_info = data.get("delivery_info", {})
    items = data.get("items", [])

    if not items:
        return jsonify({
            "success": False,
            "message": "No delivery items provided"
        }), 400

    delivery_id = create_delivery(delivery_info, items)

    created_items = []

    for item in items:
        medicine_data = {
            "name": item.get("name"),
            "barcode": item.get("barcode"),
            "category": item.get("category", "Other"),
            "batch": item.get("batch"),
            "stock": item.get("quantity", 0),
            "reorder_level": item.get("reorder_level", 20),
            "expiry_date": item.get("expiry"),
            "supplier": delivery_info.get("supplier"),
            "agency": delivery_info.get("agency"),
            "company": delivery_info.get("company"),
            "cost_price": item.get("cost_price", 0),
            "selling_price": item.get("selling_price", 0)
        }

        medicine_id = create_medicine(medicine_data)

        create_delivery_item(delivery_id, medicine_id, item)

        created_items.append({
            "medicine_id": medicine_id,
            "name": item.get("name")
        })

    return jsonify({
        "success": True,
        "message": "Bulk delivery saved successfully",
        "delivery_id": delivery_id,
        "created_items": created_items
    }), 201