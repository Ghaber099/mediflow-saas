from database.db import get_db_connection


def create_delivery(delivery_info, items):
    conn = get_db_connection()
    cursor = conn.cursor()

    total_items = len(items)
    total_quantity = sum(int(item.get("quantity", 0)) for item in items)
    total_cost = sum(
        float(item.get("cost_price", 0)) * int(item.get("quantity", 0))
        for item in items
    )

    cursor.execute("""
        INSERT INTO deliveries (
            invoice_number,
            supplier,
            agency,
            company,
            delivery_date,
            notes,
            total_items,
            total_quantity,
            total_cost
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        delivery_info.get("invoice"),
        delivery_info.get("supplier"),
        delivery_info.get("agency"),
        delivery_info.get("company"),
        delivery_info.get("delivery_date"),
        delivery_info.get("notes"),
        total_items,
        total_quantity,
        total_cost
    ))

    delivery_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return delivery_id


def create_delivery_item(delivery_id, medicine_id, item):
    conn = get_db_connection()

    conn.execute("""
        INSERT INTO delivery_items (
            delivery_id,
            medicine_id,
            medicine_name,
            barcode,
            batch,
            quantity,
            expiry_date,
            cost_price,
            selling_price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        delivery_id,
        medicine_id,
        item.get("name"),
        item.get("barcode"),
        item.get("batch"),
        item.get("quantity", 0),
        item.get("expiry"),
        item.get("cost_price", 0),
        item.get("selling_price", 0)
    ))

    conn.commit()
    conn.close()


def get_all_deliveries():
    conn = get_db_connection()

    deliveries = conn.execute("""
        SELECT *
        FROM deliveries
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    return [dict(delivery) for delivery in deliveries]


def get_delivery_items(delivery_id):
    conn = get_db_connection()

    items = conn.execute("""
        SELECT *
        FROM delivery_items
        WHERE delivery_id = ?
        ORDER BY id DESC
    """, (delivery_id,)).fetchall()

    conn.close()

    return [dict(item) for item in items]