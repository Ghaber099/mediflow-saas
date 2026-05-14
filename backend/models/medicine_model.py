from database.db import get_db_connection


def get_all_medicines():
    conn = get_db_connection()

    medicines = conn.execute("""
        SELECT *
        FROM medicines
        ORDER BY id DESC
    """).fetchall()

    conn.close()
    return [dict(medicine) for medicine in medicines]


def get_medicine_by_id(medicine_id):
    conn = get_db_connection()

    medicine = conn.execute("""
        SELECT *
        FROM medicines
        WHERE id = ?
    """, (medicine_id,)).fetchone()

    conn.close()
    return dict(medicine) if medicine else None


def get_medicine_by_barcode(barcode):
    conn = get_db_connection()

    medicine = conn.execute("""
        SELECT *
        FROM medicines
        WHERE barcode = ?
    """, (barcode,)).fetchone()

    conn.close()
    return dict(medicine) if medicine else None


def create_medicine(data):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO medicines (
            name,
            barcode,
            category,
            batch,
            stock,
            reorder_level,
            expiry_date,
            supplier,
            agency,
            company,
            cost_price,
            selling_price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("name"),
        data.get("barcode"),
        data.get("category"),
        data.get("batch"),
        data.get("stock", 0),
        data.get("reorder_level", 20),
        data.get("expiry_date"),
        data.get("supplier"),
        data.get("agency"),
        data.get("company"),
        data.get("cost_price", 0),
        data.get("selling_price", 0)
    ))

    conn.commit()
    medicine_id = cursor.lastrowid
    conn.close()

    return medicine_id


def update_medicine(medicine_id, data):
    conn = get_db_connection()

    conn.execute("""
        UPDATE medicines
        SET
            name = ?,
            barcode = ?,
            category = ?,
            batch = ?,
            stock = ?,
            reorder_level = ?,
            expiry_date = ?,
            supplier = ?,
            agency = ?,
            company = ?,
            cost_price = ?,
            selling_price = ?
        WHERE id = ?
    """, (
        data.get("name"),
        data.get("barcode"),
        data.get("category"),
        data.get("batch"),
        data.get("stock", 0),
        data.get("reorder_level", 20),
        data.get("expiry_date"),
        data.get("supplier"),
        data.get("agency"),
        data.get("company"),
        data.get("cost_price", 0),
        data.get("selling_price", 0),
        medicine_id
    ))

    conn.commit()
    conn.close()


def update_medicine_stock(medicine_id, quantity):
    conn = get_db_connection()

    conn.execute("""
        UPDATE medicines
        SET stock = stock + ?
        WHERE id = ?
    """, (quantity, medicine_id))

    conn.commit()
    conn.close()


def delete_medicine(medicine_id):
    conn = get_db_connection()

    conn.execute("""
        DELETE FROM medicines
        WHERE id = ?
    """, (medicine_id,))

    conn.commit()
    conn.close()