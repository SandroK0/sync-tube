from .room import Room


class RoomManager:
    def __init__(self):
        self.rooms = []

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
