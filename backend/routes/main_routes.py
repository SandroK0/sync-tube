from flask import Blueprint, jsonify, request


def create_main_blueprint(room_manager, socketio):
    main_bp = Blueprint('main', __name__)

    # FOR TESTING
    @main_bp.route('/')
    def index():
        return "This is a backend server for SyncTube."

    @main_bp.route('/rooms', methods=["GET"])
    def list_rooms():
        try:
            # Fetch room names from Redis
            room_names = room_manager.get_all_room_names()

            if not room_names:
                return jsonify({"message": "No rooms available"}), 200

            # Fetch data for each room
            rooms_data = {}
            for room_name in room_names:
                room_data = room_manager.get_room_by_name(room_name)
                if room_data:
                    rooms_data[room_name] = room_data.to_dict()

            return jsonify(rooms_data), 200

        except Exception as e:
            return jsonify({"error": "An unexpected error occurred"}), 500

    @main_bp.route("/join_room", methods=["POST"])
    def join_room_route():
        try:
            data = request.json

            if not data:
                return jsonify({"error": "No data provided"}), 400

            room_name = data.get('room', '').strip()
            username = data.get('user', '').strip()

            # Validate input
            if not room_name or not username:
                return jsonify({"error": "Missing 'room' or 'user' parameter"}), 400

            if not isinstance(room_name, str) or not isinstance(username, str):
                return jsonify({"error": "Room name and username must be strings"}), 400

            if len(room_name) > 50 or len(username) > 30:
                return jsonify({"error": "Room name or username too long"}), 400

            # Check if the room already exists
            room = room_manager.get_room_by_name(room_name)

            if not room:
                # Create a new room if it doesn't exist
                room = room_manager.create_room(room_name, username, socketio)
                return jsonify({"message": "Room Created!"}), 201

            # Check if the username is already taken in the room
            if username in room.members:
                return jsonify({"error": "Nickname taken in that room!"}), 409

            room.add_member(username, socketio)  # Add the user to the room

            return jsonify({"message": "Joining!"}), 202

        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    @main_bp.route("/get_room_state", methods=["GET"])
    def get_room_state():
        try:
            room_name = request.args.get("room", "").strip()
            if not room_name:
                return jsonify({"error": "Room name is required"}), 400

            # Fetch the room from the RoomManager
            room = room_manager.get_room_by_name(room_name)
            if room:
                response_data = room.to_dict()
                return jsonify(response_data), 200

            # Room not found
            return jsonify({"error": "Room not found"}), 404

        except Exception as e:
            # Log exception for debugging (optional)
            print(f"Error in /get_room_state: {e}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    return main_bp
