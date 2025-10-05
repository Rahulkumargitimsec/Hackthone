from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# MySQL Database Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",  # Replace with your MySQL username
    "password": "",  # Replace with your MySQL password
    "database": "hackathon"  # Replace with your database name
}

# Test Database Connection
def test_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.close()
        print("Database connection successful!")
    except mysql.connector.Error as err:
        print(f"Error: {err}")

# Test the connection on startup
test_db_connection()

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO signup (name, email, phone, password) VALUES (%s, %s, %s, %s)",
            (name, email, phone, password),
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "User signed up successfully"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "User with this email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, phone FROM login WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({"message": "Login successful", "user": {
                "id": user[0], "name": user[1], "email": user[2], "phone": user[3]
            }}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)