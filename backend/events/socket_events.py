from flask import request
from flask_socketio import join_room, leave_room
from models.room import Room
from models.room_manager import RoomManager

def register_socket_events(socketio, room_manager: RoomManager):
    @socketio.on('leave_room')
    def handle_leave(data):
        room_name = data.get('room_name')
        user = data.get('user')

        if room_name and user:
            room: Room = room_manager.get_room_by_name(room_name)
            if room:
                room.send_message("Left Room!", user, socketio)
                room.remove_member(user, socketio)
                leave_room(room_name)
                # Save room state to Redis after member leaves
                room_manager.save_room_to_redis(room)
                room_manager.remove_empty_rooms()  # Clean up any empty rooms

    @socketio.on('join_room')
    def handle_join(data):
        room_name = data.get('room_name')
        if room_name:
            room: Room = room_manager.get_room_by_name(room_name)
            if room:
                join_room(room_name)
                print(f"User {data.get('user')} joined room {room_name}")
                room.send_message("Joined Room!", data.get('user'), socketio)
                # Save room state to Redis after member joins
                room_manager.save_room_to_redis(room)

    @socketio.on('message')
    def handle_message(data):
        room_name: str = data.get('room_name')
        if room_name:
            room: Room = room_manager.get_room_by_name(room_name)
            if room:
                event = data.get("event")
                if event:
                    if event == 'change_video':
                        video_id = data['videoId']
                        room.change_video(video_id, socketio)
                    elif event == 'new_message':
                        room.send_message(
                            data['message']['message'], data['message']['author'], socketio)
                    # Save room state to Redis after message or video change
                    room_manager.save_room_to_redis(room)

    @socketio.on("player_event")
    def handle_player_event(data):
        room_name: str = data.get('room_name')
        if room_name:
            room: Room = room_manager.get_room_by_name(room_name)
            if room:
                event = data.get('event')
                if event:
                    if event == 'play':
                        room.play_video(socketio)
                    elif event == 'pause':
                        room.pause_video(socketio)
                    elif event == '+10':
                        room.skip_forward(socketio)
                    elif event == '-10':
                        room.skip_backward(socketio)
                    elif event == 'seek_to':
                        time = data.get('current_time')
                        room.seek_to(time, socketio)
                    elif event == 'update_time':
                        room.update_time(data['new_time'])
                    # Save room state to Redis after player-related events
                    room_manager.save_room_to_redis(room)
