from flask_socketio import SocketIO


class Room:
    def __init__(self, name, nickname, socketio):
        self.owner = nickname
        self.name = name
        self.members = [nickname]
        self.is_paused = True
        self.video_id = "jTJvyKZDFsY"
        self.messages = []
        self.current_time = 0
        self.socketio = socketio

    def add_member(self, nickname):
        if nickname not in self.members:
            self.members.append(nickname)
            self.socketio.emit(
                'new_member', {'nickname': nickname}, to=self.name)

    def remove_member(self, nickname):
        if nickname in self.members:
            self.socketio.emit(
                'member_left', {'nickname': nickname}, to=self.name)
            self.members.remove(nickname)

        if self.owner == nickname:
            if self.members:
                self.owner = self.members[0]
                self.socketio.emit(
                    "owner_change", {'newOwner': self.owner}, to=self.name)

    def play_video(self):
        self.is_paused = False
        self.socketio.emit('play', to=self.name)

    def pause_video(self):
        self.is_paused = True
        self.socketio.emit('pause', to=self.name)

    def change_video(self, video_id):
        self.video_id = video_id
        self.socketio.emit('change_video', {'videoId': video_id}, to=self.name)

    def send_message(self, message, author):
        self.messages.append({'message': message, 'author': author})
        self.socketio.emit('message_recived', {
                           'message': message, 'author': author}, to=self.name)

    def seek_to(self, time):
        self.socketio.emit('seek_to', {'time': time}, to=self.name)

    def skip_forward(self):
        self.socketio.emit('+10', to=self.name)

    def skip_backward(self):
        self.socketio.emit('-10', to=self.name)

    def update_time(self, new_time):
        self.current_time = new_time

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
