import time
import threading
from .room import Room
import json


class RoomManager:
    def __init__(self, redis_client):
        self.redis_client = redis_client  # Redis client for storing rooms
        self.inactive_threshold = 60 * 5  # 5 minutes in seconds
        self.cleanup_interval = 60  # Check every minute
        threading.Thread(target=self.cleanup_task, daemon=True).start()

    def save_room_to_redis(self, room):
        room_key = f"room:{room.name}"  # Redis key for the room
        self.redis_client.set(room_key, json.dumps(room.to_dict()))

    def create_room(self, name, user, socketio):
        new_room = Room(name, user, self.redis_client)
        room_data = new_room.to_dict()  # Convert the room to a dictionary
        self.redis_client.set(f"room:{name}", json.dumps(
            room_data))  # Store in Redis
        return new_room

    def get_room_by_name(self, name):
        room_data = self.redis_client.get(f"room:{name}")
        if room_data:
            room_data = json.loads(room_data)
            room = Room(room_data['name'], room_data['owner'], self.redis_client, room_data)

            return room
        return None

    def get_all_room_names(self):
        # Assumes room keys are prefixed with "room:"
        keys = self.redis_client.scan_iter("room:*")
        room_names = [key.decode('utf-8').split(':', 1)[1]
                      for key in keys]  # Decode and extract name
        return room_names

    def remove_empty_rooms(self):
        # Iterate over all room keys
        for room_key in self.redis_client.scan_iter("room:*"):
            # Decode the key from bytes to string
            room_key = room_key.decode('utf-8')
            room_data = self.redis_client.get(room_key)
            if room_data:
                try:
                    # Parse the room data
                    room = json.loads(room_data)
                    # Check if the room has no members
                    if not room.get('members'):  # Empty or missing 'members' list
                        print(f"Removing empty room: {room_key}")
                        self.redis_client.delete(room_key)
                except json.JSONDecodeError:
                    print(f"Failed to decode room data for key: {room_key}")

    def cleanup_task(self):
        """
        Periodically checks for inactive rooms and deletes them from Redis
        if they have been inactive for more than `inactive_threshold` seconds.
        """
        while True:
            time.sleep(self.cleanup_interval)
            current_time = time.time()

            # Check for inactive rooms
            for room_name in self.redis_client.scan_iter("room:*"):
                room_data = self.redis_client.get(room_name)
                if room_data:
                    room = json.loads(room_data)
                    if current_time - room['last_updated'] > self.inactive_threshold:
                        print(
                            f"Room '{room_name}' is inactive and has been deleted.")
                        self.redis_client.delete(room_name)
