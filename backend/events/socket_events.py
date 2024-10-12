from flask_socketio import join_room, leave_room


def register_socket_events(socketio, room_manager):
    @socketio.on('leave_room')
    def handle_leave(data):
        room_name = data.get('room_name')
        user = data.get('user')

        if room_name and user:

            room = room_manager.get_room_by_name(room_name)
            if room:
                room.send_message("Left Room!", user)
                room.remove_member(user)
                leave_room(room_name)

            room_manager.remove_empty_rooms()

    @socketio.on('join_room')
    def handle_join(data):
        room_name = data.get('room_name')

        if room_name:
            join_room(room_name)

    @socketio.on('message')
    def handle_message(data):
        room_name = data.get('room_name')
        if room_name:
            room = room_manager.get_room_by_name(room_name)
            if room:
                join_room(room_name)
                event = data.get("event")
                if event:
                    if event == 'change_video':
                        video_id = data['videoId']
                        room.change_video(video_id)
                    elif event == 'new_message':
                        room.send_message(
                            data['message']['message'], data['message']['author'])

    @socketio.on("player_event")
    def handle_player_event(data):

        room_name = data.get('room_name')
        if room_name:
            room = room_manager.get_room_by_name(room_name)
            if room:
                join_room(room_name)
                event = data.get('event')
                if event:
                    if event == 'play':
                        room.play_video()
                    elif event == 'pause':
                        room.pause_video()
                    elif event == '+10':
                        room.skip_forward()
                    elif event == '-10':
                        room.skip_backward()
                    elif event == 'seek_to':
                        time = data.get('current_time')
                        room.seek_to(time)
                    elif event == 'update_time':
                        room.update_time(data['new_time'])
