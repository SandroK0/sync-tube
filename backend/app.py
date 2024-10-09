from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from models.room_manager import RoomManager
from routes.main_routes import create_main_blueprint
from events.socket_events import register_socket_events

app = Flask(__name__)
app.config.from_object(Config)

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

room_manager = RoomManager()

main_bp = create_main_blueprint(room_manager, socketio)
app.register_blueprint(main_bp)
register_socket_events(socketio, room_manager)

def create_app():
    return app

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)