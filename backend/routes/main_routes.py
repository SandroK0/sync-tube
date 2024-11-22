from flask import Blueprint, jsonify, request


def create_main_blueprint(room_manager, socketio):
    main_bp = Blueprint('main', __name__)

    @main_bp.route('/')
    def index():
        # rooms_data = {}
        # for room in room_manager.rooms:
        #     rooms_data[room.name] = room.to_dict()
        # return jsonify(rooms_data)
        return "This is a backend server for SyncTube."

    @main_bp.route("/join_room", methods=["POST"])
    def create_room():
        try:
            data = request.json

            if not data:
                return jsonify({"error": "No data provided"}), 400

            room_name = data.get('room')
            username = data.get('user')

            if not room_name or not username:
                return jsonify({"error": "Missing 'room' or 'user' parameter"}), 400

            if not isinstance(room_name, str) or not isinstance(username, str):
                return jsonify({"error": "Room name and username must be strings"}), 400

            if len(room_name) > 50 or len(username) > 30:
                return jsonify({"error": "Room name or username too long"}), 400

            room = room_manager.get_room_by_name(room_name)

            if not room:
                room = room_manager.create_room(room_name, username, socketio)
                response_data = {"message": "Room Created!"}
                return jsonify(response_data), 201

            if username in room.members:
                response_data = {"error": "Nickname taken in that room!"}
                return jsonify(response_data), 409

            room.send_message("Joined Room!", username)
            room.add_member(username)
            response_data = {"message": "Joining!"}
            return jsonify(response_data), 202

        except Exception as e:
            return jsonify({"error": "An unexpected error occurred"}), 500

    @main_bp.route("/get_room_state", methods=["GET"])
    def get_room_state():
        room_name = request.args.get("room")
        room = room_manager.get_room_by_name(room_name)
        if room:
            response_data = room.to_dict()
            return jsonify(response_data), 200
        else:
            return jsonify("Room not found"), 404

    return main_bp
