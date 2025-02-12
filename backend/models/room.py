import time
import json


class Room:
    def __init__(self, name, nickname, redis_client, data=None):

        self.owner = nickname
        self.name = name
        self.redis_client = redis_client
        self.last_updated = time.time()

        if data:
            self.reconstrunct_room(data)
        else:
            self.members = [nickname]
            self.is_paused = True
            self.video_id = ""
            self.current_time = 0

        self.save_room_to_redis()

    def update_last_activity(self):
        self.last_updated = time.time()

        self.save_room_to_redis()

    def add_member(self, nickname, socketio):
        if nickname not in self.members:
            self.members.append(nickname)
            self.update_last_activity()
            socketio.emit(
                'new_member', {'nickname': nickname}, to=self.name)

        self.save_room_to_redis()

    def remove_member(self, nickname, socketio):

        if nickname in self.members:
            socketio.emit(
                'member_left', {'nickname': nickname}, to=self.name)
            self.members.remove(nickname)
            self.update_last_activity()

        if self.owner == nickname:
            if self.members:
                self.owner = self.members[0]
                socketio.emit(
                    "owner_change", {'newOwner': self.owner}, to=self.name)

        self.save_room_to_redis()

    def play_video(self, socketio):
        self.is_paused = False
        self.update_last_activity()
        socketio.emit('play', to=self.name)

        self.save_room_to_redis()

    def pause_video(self, socketio):
        self.is_paused = True
        self.update_last_activity()
        socketio.emit('pause', to=self.name)

        self.save_room_to_redis()

    def change_video(self, video_id, socketio):
        self.video_id = video_id
        self.update_last_activity()
        socketio.emit('change_video', {'videoId': video_id}, to=self.name)

        self.save_room_to_redis()

    def send_message(self, message, author, socketio):
        socketio.emit('message_received', {
            'message': message, 'author': author}, to=self.name)
        self.update_last_activity()

        self.save_room_to_redis()

    def seek_to(self, time, socketio):
        self.update_last_activity()
        socketio.emit('seek_to', {'time': time}, to=self.name)

        self.save_room_to_redis()

    def skip_forward(self, socketio):
        self.update_last_activity()
        socketio.emit('+10', to=self.name)

        self.save_room_to_redis()

    def skip_backward(self, socketio):
        self.update_last_activity()
        socketio.emit('-10', to=self.name)

        self.save_room_to_redis()

    def update_time(self, new_time):
        self.current_time = new_time
        self.update_last_activity()

        self.save_room_to_redis()

    def save_room_to_redis(self):
        room_key = f"room:{self.name}"
        self.redis_client.set(room_key, json.dumps(self.to_dict()))


    def reconstrunct_room(self, data):
        self.members = data['members']
        self.is_paused = data['isPaused']
        self.video_id = data['videoId']
        self.current_time = data['current_time']

    def to_dict(self):
        return {
            'owner': self.owner,
            'name': self.name,
            'isPaused': self.is_paused,
            'videoId': self.video_id,
            'members': self.members,
            'current_time': self.current_time,
            'last_updated': self.last_updated
        }
