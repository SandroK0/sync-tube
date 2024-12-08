from flask_socketio import SocketIO
import time


class Room:
    def __init__(self, name, nickname, socketio):
        self.owner = nickname
        self.name = name
        self.members = [nickname]
        self.is_paused = True
        self.video_id = ""
        self.messages = []
        self.current_time = 0
        self.socketio = socketio
        self.last_updated = time.time()  # Track the last update time

    def update_last_activity(self):
        self.last_updated = time.time()

    def add_member(self, nickname):
        if nickname not in self.members:
            self.members.append(nickname)
            self.update_last_activity()
            self.socketio.emit(
                'new_member', {'nickname': nickname}, to=self.name)

    def remove_member(self, nickname):
        if nickname in self.members:
            self.socketio.emit(
                'member_left', {'nickname': nickname}, to=self.name)
            self.members.remove(nickname)
            self.update_last_activity()

        if self.owner == nickname:
            if self.members:
                self.owner = self.members[0]
                self.socketio.emit(
                    "owner_change", {'newOwner': self.owner}, to=self.name)

    def play_video(self):
        self.is_paused = False
        self.update_last_activity()
        self.socketio.emit('play', to=self.name)

    def pause_video(self):
        self.is_paused = True
        self.update_last_activity()
        self.socketio.emit('pause', to=self.name)

    def change_video(self, video_id):
        self.video_id = video_id
        self.update_last_activity()
        self.socketio.emit('change_video', {'videoId': video_id}, to=self.name)

    def send_message(self, message, author):
        self.messages.append({'message': message, 'author': author})
        self.socketio.emit('message_received', {
            'message': message, 'author': author}, to=self.name)
        self.update_last_activity()

    def seek_to(self, time):
        self.update_last_activity()
        self.socketio.emit('seek_to', {'time': time}, to=self.name)

    def skip_forward(self):
        self.update_last_activity()
        self.socketio.emit('+10', to=self.name)

    def skip_backward(self):
        self.update_last_activity()
        self.socketio.emit('-10', to=self.name)

    def update_time(self, new_time):
        self.current_time = new_time
        self.update_last_activity()

    def to_dict(self):
        return {
            'owner': self.owner,
            'name': self.name,
            'isPaused': self.is_paused,
            'videoId': self.video_id,
            'members': self.members,
            'messages': self.messages,
            "current_time": self.current_time
        }
