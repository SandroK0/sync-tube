import { useContext, useState, createContext } from "react";
import { Message, Room } from "../Types";
import axios from "axios";
import { socket } from "../config";

import { API_URL } from "../config";

interface RoomContextType {
  join: (room: string, user: string) => void;
  leave: () => void;
  changeVideo: (videoId: string) => void;
  sendMessage: (message: string) => void;
  seekTo: (seekTime: number) => void;
  handlePlay: () => void;
  handlePause: () => void;
  handlePlus10: () => void;
  handleMinus10: () => void;
  setRoom: (room: Room) => void;
  updateTime: (new_time: number) => void;
  room: Room | null;
}

const RoomContext = createContext<RoomContextType>({
  join: () => {},
  leave: () => {},
  changeVideo: () => {},
  sendMessage: () => {},
  seekTo: () => {},
  handlePlay: () => {},
  handlePause: () => {},
  handlePlus10: () => {},
  handleMinus10: () => {},
  updateTime: () => {},
  setRoom() {},
  room: null,
});

export default function RoomManager({ children }: any) {
  const [room, setRoom] = useState<Room | null>(null);

  const join = (room: string, user: string) => {
    axios
      .get(`${API_URL}/get_room_state?room=${room}`)
      .then((resp) => {
        let room = { ...resp.data, user };
        setRoom(room);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const leave = () => {
    if (room) {
      socket.emit("leave_room", { room_name: room.name, user: room.user });
      setRoom(null);
    }
  };

  const changeVideo = (videoId: string) => {
    if (room) {
      socket.send({
        room_name: room.name,
        event: "change_video",
        videoId,
      });
    }
  };

  const sendMessage = (message: string) => {
    if (room) {
      socket.send({
        event: "new_message",
        room_name: room.name,
        message: {
          author: room.user,
          message: message,
        },
      });
    }
  };

  const updateTime = (new_time: number) => {
    if (room) {
      socket.emit("player_event", {
        event: "update_time",
        room_name: room.name,
        new_time,
      });
    }
  };

  const seekTo = (seekTime: number) => {
    if (room) {
      socket.emit("player_event", {
        event: "seek_to",
        room_name: room.name,
        current_time: seekTime,
      });
    }
  };

  const handlePause = () => {
    if (room) {
      socket.emit("player_event", {
        event: "pause",
        room_name: room.name,
      });
    }
  };

  const handlePlay = () => {
    if (room) {
      socket.emit("player_event", {
        event: "play",
        room_name: room.name,
      });
    }
  };

  const handlePlus10 = () => {
    if (room) {
      socket.emit("player_event", {
        event: "+10",
        room_name: room.name,
      });
    }
  };

  const handleMinus10 = () => {
    if (room) {
      socket.emit("player_event", {
        event: "-10",
        room_name: room.name,
      });
    }
  };

  socket.on("change_video", (data: { videoId: string }) => {
    let videoId = data.videoId;
    if (room) {
      setRoom({ ...room, videoId });
    }
  });

  socket.on("message_recived", (data: Message) => {
    if (room) {
      setRoom({ ...room, messages: [...room.messages, data] });
    }
  });

  socket.on("new_member", (data: { nickname: string }) => {
    if (room) {
      setRoom({ ...room, members: [...room.members, data.nickname] });
    }
  });

  socket.on("member_left", (data: { nickname: string }) => {
    if (room) {
      let newMembers = room.members;
      let elementIndex = newMembers.indexOf(data.nickname);

      if (elementIndex !== -1) {
        newMembers.splice(elementIndex, 1);
      }
      setRoom({ ...room, members: newMembers });
    }
  });

  socket.on("owner_change", (data: { newOwner: string }) => {
    if (room) {
      setRoom({ ...room, owner: data.newOwner });
    }
  });

  return (
    <RoomContext.Provider
      value={{
        updateTime,
        join,
        leave,
        room,
        setRoom,
        changeVideo,
        sendMessage,
        seekTo,
        handleMinus10,
        handlePlus10,
        handlePause,
        handlePlay,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  return useContext(RoomContext);
};
