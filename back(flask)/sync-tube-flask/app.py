from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '!secret123'
app.config['DEBUG'] = True

socketio = SocketIO(app, cors_allowed_origins="*")

CORS(app)


ROOMS = dict()


@app.route('/')
def index():
    if ROOMS:
        return ROOMS
    else:
        return jsonify('No Rooms Yet!')


@app.route("/getRoom", methods=["GET"])
def get_room_state():

    room = request.args.get("roomName")

    if room in ROOMS:
        response_data = ROOMS[room]
        status_code = 200
        return jsonify(response_data), status_code
    else:
        status_code = 404  # not found
        return status_code


@app.route("/leave", methods=["DELETE"])
def handle_leave():

    room = request.args.get("roomName")
    nickname = request.args.get("nickName")

    ROOMS[room]['members'].remove(nickname)

    socketio.emit('message_recived', {
        'message': "Left Room!", 'author': nickname}, to=room)

    if not ROOMS[room]['members']:
        ROOMS.pop(room)

    return 'done'


@app.route("/createRoom", methods=["POST", "GET"])
def create_room():

    data = request.json
    room = data['roomName']
    nickname = data['nickName']

    if room not in ROOMS:
        ROOMS[room] = {"isPaused": False,
                       "videoId": "", "members": [nickname]}
        response_data = {"message": "Room Created!"}
        status_code = 201  # created
    else:

        if nickname in ROOMS[room]['members']:
            response_data = {"error": "Nickname taken in that room!"}
            status_code = 409  # conflict
        else:
            ROOMS[room]['members'].append(nickname)
            response_data = {"message": "Joining!"}
            status_code = 202  # accepted

    return jsonify(response_data), status_code


@socketio.on('message')
def handle_message(data):

    print(data)
    room = data['roomName']

    join_room(room)
    if data.get('event'):
        if data['event'] == 'play':
            ROOMS[room]['isPaused'] = False
            emit('play', to=room)
        elif data['event'] == 'pause':
            ROOMS[room]['isPaused'] = True
            emit('pause', to=room)
        elif data['event'] == '+10':
            emit('+10', to=room)
        elif data['event'] == '-10':
            emit('-10', to=room)
        elif data['event'] == 'change_video':
            videoId = data['videoId']
            ROOMS[room]['videoId'] = videoId
            emit('change_video', {'videoId': videoId}, to=room)
        elif data['event'] == 'new_message':
            emit('message_recived', {
                'message': data['message']['message'], 'author': data['message']['author']}, to=room)
        elif data['event'] == 'seekTo':
            emit('seekTo', {'time': data['currentTime']}, to=room)
        elif data['event'] == 'new_member':
            emit('message_recived', {
                'message': "Joined Room!", 'author': data["nickName"]}, to=room)



if __name__ == '__main__':
    socketio.run(app, port=8000)
