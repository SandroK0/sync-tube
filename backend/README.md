# SyncTube Flask Backend
## API Endpoints
### Get All Rooms

- URL: /

- Method: GET

- Response:

json

    {
      "room_name": {
        "owner": "owner_name",
        "name": "room_name",
        "isPaused": true,
        "videoId": "",
        "members": ["member1", "member2"],
        "messages": [{"message": "Hello", "author": "user1"}]
      }
    }

### Create or Join a Room

- URL: /join_room

- Method: POST

- Request Body:

json
    
    {
      "room": "room_name",
      "user": "username"
    }

## Responses:

    201 Created: Room created.
    202 Accepted: Joined existing room.
    400 Bad Request: Missing 'room' or 'user' parameter.
    409 Conflict: Nickname taken in that room.

### Get Room State

- URL: /get_room

- Method: GET

Query Parameters:

    room: The name of the room.

- Response:

json

    {
      "owner": "owner_name",
      "name": "room_name",
      "isPaused": true,
      "videoId": "",
      "members": ["member1", "member2"],
      "messages": [{"message": "Hello", "author": "user1"}],
      "current_time": 0
    }

404 Not Found: Room not found.

## WebSocket Events
### Join Room

- Event: join_room

- Data:

json

    {
      "room_name": "room_name",
      "user": "username"
    }

### Leave Room

- Event: leave_room

- Data:

json

    {
      "room_name": "room_name",
      "user": "username"
    }

### Send Message

- Event: message

- Data:

json
  
    {
      "roomName": "room_name",
      "message": {
        "message": "Hello",
        "author": "username"
      },
      "event": "new_message"
    }

## Video Control Events

### Play:

json

    {
      "roomName": "room_name",
      "event": "play"
    }

### Pause:

json

    {
      "roomName": "room_name",
      "event": "pause"
    }

### Seek:

json

    {
      "roomName": "room_name",
      "event": "seekTo",
      "currentTime": 30
    }

### Skip Forward:

json

    {
      "roomName": "room_name",
      "event": "+10"
    }

### Skip Backward:

json

    {
      "roomName": "room_name",
      "event": "-10"
    }

## Room Management

### Create Room

To create a room, use the /joinRoom endpoint with the room name and user name. If the room does not exist, it will be created.

### Add Member

To add a member, use the same /joinRoom endpoint. If the room exists, the member will be added.

### Remove Member

To remove a member, handle the leave_room event. If the room becomes empty, it will be deleted automatically.
