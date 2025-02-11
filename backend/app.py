from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from models.room_manager import RoomManager
from routes.main_routes import create_main_blueprint
from events.socket_events import register_socket_events
import redis  # Redis client

app = Flask(__name__)
app.config.from_object(Config)

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Initialize Redis client with a specific database (e.g., database index 1)
redis_client = redis.StrictRedis(host='redis', port=6379, db=1)

try:
    redis_client.ping()
    print("Connected to Redis on database 1!")
except redis.ConnectionError as e:
    print(f"Redis connection failed: {e}")


# Pass the Redis client to the RoomManager
room_manager = RoomManager(redis_client)

# Create and register blueprints and events
main_bp = create_main_blueprint(room_manager, socketio)
app.register_blueprint(main_bp)
register_socket_events(socketio, room_manager)


def create_app():
    return app


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
