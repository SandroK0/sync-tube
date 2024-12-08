import time
import threading
from .room import Room


class RoomManager:
    def __init__(self):
        self.rooms = []
        self.inactive_threshold = 60 * 5  # 5 minutes in seconds
        self.cleanup_interval = 60  # Check every minute
        threading.Thread(target=self.cleanup_task, daemon=True).start()

    def create_room(self, name, user, socketio):
        new_room = Room(name, user, socketio)
        self.rooms.append(new_room)
        return new_room

    def get_room_by_name(self, name):
        for room in self.rooms:
            if room.name == name:
                return room
        return None

    def remove_empty_rooms(self):
        self.rooms = [room for room in self.rooms if room.members != []]

    def cleanup_task(self):
        """
        Periodically checks for inactive rooms and deletes them from the rooms list
        if they have been inactive for more than `inactive_threshold` seconds.
        """
        while True:
            time.sleep(self.cleanup_interval)
            current_time = time.time()

            # Remove inactive rooms
            active_rooms = []
            for room in self.rooms:
                if current_time - room.last_updated > self.inactive_threshold:
                    print(
                        f"Room '{room.name}' is inactive and has been deleted.")
                else:
                    active_rooms.append(room)
            self.rooms = active_rooms
