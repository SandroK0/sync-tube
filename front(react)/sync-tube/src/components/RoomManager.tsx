import React, { useContext, useState, createContext, useEffect } from "react";
import { Message, Room } from "../Types";
import axios from "axios";
import { socket } from "../socket";

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
  join: () => { },
  leave: () => { },
  changeVideo: () => { },
  sendMessage: () => { },
  seekTo: () => { },
  handlePlay: () => { },
  handlePause: () => { },
  handlePlus10: () => { },
  handleMinus10: () => { },
  updateTime: () => { },
  setRoom() {},
  room: null,
});

export default function RoomManager({ children }: any) {
  const [room, setRoom] = useState<Room | null>(null);

  const join = (room: string, user: string) => {
    axios
      .get(`getRoom?room=${room}`)
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
      console.log("Leave!");
      socket.emit("leave_room", { room_name: room.name, user: room.user });
      setRoom(null);
    }
  };

  const changeVideo = (videoId: string) => {
    if (room) {
      socket.send({
        roomName: room.name,
        event: "change_video",
        videoId,
      });
    }
  };

  const sendMessage = (message: string) => {
    if (room) {
      socket.send({
        event: "new_message",
        roomName: room.name,
        message: {
          author: room.user,
          message: message,
        },
      });
    }
  };

  const updateTime = (new_time: number) => {
    if (room) {
      socket.emit("playerEvent", {
        event: "updateTime",
        roomName: room.name,
        new_time,
      });
    }
  };

  const seekTo = (seekTime: number) => {
    if (room) {
      socket.emit("playerEvent", {
        event: "seekTo",
        roomName: room.name,
        currentTime: seekTime,
      });
    }
  };

  const handlePause = () => {
    if (room) {
      socket.emit("playerEvent", {
        event: "pause",
        roomName: room.name,
      });
    }
  };

  const handlePlay = () => {
    if (room) {
      socket.emit("playerEvent", {
        event: "play",
        roomName: room.name,
      });
    }
  };

  const handlePlus10 = () => {
    if (room) {
      socket.emit("playerEvent", {
        event: "+10",
        roomName: room.name,
      });
    }
  };

  const handleMinus10 = () => {
    if (room) {
      socket.emit("playerEvent", {
        event: "-10",
        roomName: room.name,
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
