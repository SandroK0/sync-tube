from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '!secret123'

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)


class Room:
    def __init__(self, name, nickname):
        self.owner = nickname
        self.name = name
        self.members = [nickname]
        self.is_paused = True
        self.video_id = ""
        self.messages = []
        self.current_time = 0

    def add_member(self, nickname):
        if nickname not in self.members:
            self.members.append(nickname)
            socketio.emit('new_member', {'nickname': nickname}, to=self.name)

    def remove_member(self, nickname):
        if nickname in self.members:
            socketio.emit('member_left', {'nickname': nickname}, to=self.name)
            self.members.remove(nickname)

        if self.owner == nickname:
            if self.members:
                self.owner = self.members[0]
                socketio.emit("owner_change", {
                              'newOwner': self.owner}, to=self.name)

    def play_video(self):
        self.is_paused = False
        socketio.emit('play', to=self.name)

    def pause_video(self):
        self.is_paused = True
        socketio.emit('pause', to=self.name)

    def change_video(self, video_id):
        self.video_id = video_id
        socketio.emit('change_video', {'videoId': video_id}, to=self.name)

    def send_message(self, message, author):
        self.messages.append({
            'message': message, 'author': author})
        socketio.emit('message_recived', {
                      'message': message, 'author': author}, to=self.name)

    def seek_to(self, time):
        socketio.emit('seekTo', {'time': time}, to=self.name)

    def skip_forward(self):
        socketio.emit('+10', to=self.name)

    def skip_backward(self):
        socketio.emit('-10', to=self.name)

    def update_time(self, new_time):
        self.current_time = new_time


class RoomManager:
    def __init__(self):
        self.rooms = []

    def create_room(self, name, user):
        new_room = Room(name, user)
        self.rooms.append(new_room)
        return new_room

    def get_room_by_name(self, name):
        for room in self.rooms:
            if room.name == name:
                return room
        return None

    def remove_empty_rooms(self):
        self.rooms = [room for room in self.rooms if room.members != []]


room_manager = RoomManager()


@app.route('/')
def index():
    rooms_data = {}
    for room in room_manager.rooms:
        rooms_data[room.name] = {
            'owner': room.owner,
            'name': room.name,
            'isPaused': room.is_paused,
            'videoId': room.video_id,
            'members': room.members,
            'messages': room.messages
        }
    return jsonify(rooms_data)


import logging

@app.route("/join_room", methods=["POST"])
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

        room: Room | None = room_manager.get_room_by_name(room_name)

        if not room:
            room = room_manager.create_room(room_name, username)
            logging.info(f"New room created: {room_name}")
            response_data = {"message": "Room Created!"}
            return jsonify(response_data), 201

        if username in room.members:
            logging.warning(f"Username '{username}' already taken in room '{room_name}'")
            response_data = {"error": "Nickname taken in that room!"}
            return jsonify(response_data), 409

        room.send_message("Joined Room!", username)
        room.add_member(username)
        logging.info(f"User '{username}' joined room '{room_name}'")
        response_data = {"message": "Joining!"}
        return jsonify(response_data), 202

    except Exception as e:
        logging.error(f"Unexpected error in create_room: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/get_room", methods=["GET"])
def get_room_state():
    room_name = request.args.get("room")
    room: Room | None = room_manager.get_room_by_name(room_name)
    if room:
        response_data = {
            'owner': room.owner,
            'name': room.name,
            'isPaused': room.is_paused,
            'videoId': room.video_id,
            'members': room.members,
            'messages': room.messages,
            'current_time': room.current_time,
        }
        return jsonify(response_data), 200
    else:
        return jsonify("Room not found"), 404


@socketio.on('leave_room')
def handle_leave(data):

    room_name = data['room_name']
    user = data['user']

    room: Room | None = room_manager.get_room_by_name(room_name)
    if room:
        room.send_message("Left Room!", user)
        room.remove_member(user)
        leave_room(room_name)

    room_manager.remove_empty_rooms()


@socketio.on('message')
def handle_message(data):
    room_name = data['roomName']
    room: Room | None = room_manager.get_room_by_name(room_name)
    if room:
        join_room(room_name)
        if data.get('event'):
            if data['event'] == 'change_video':
                video_id = data['videoId']
                room.change_video(video_id)
            elif data['event'] == 'new_message':
                room.send_message(
                    data['message']['message'], data['message']['author'])
            elif data['event'] == 'hand_shake':
                pass


@socketio.on("playerEvent")
def handle_player_event(data):
    room_name = data['roomName']
    room: Room | None = room_manager.get_room_by_name(room_name)
    if room:
        join_room(room_name)
        if data.get('event'):
            if data['event'] == 'play':
                room.play_video()
            elif data['event'] == 'pause':
                room.pause_video()
            elif data['event'] == '+10':
                room.skip_forward()
            elif data['event'] == '-10':
                room.skip_backward()
            elif data['event'] == 'seekTo':
                time = data.get('currentTime')
                room.seek_to(time)
            elif data['event'] == 'updateTime':
                room.update_time(data['new_time'])



def create_app():
    return app

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)

