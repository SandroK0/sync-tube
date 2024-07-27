import { useEffect, useRef } from "react";
import { socket } from "../../socket";
import styles from "./Room.module.css";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import { useRoom } from "../../components/RoomManager";
import ChatBox from "../../components/ChatBox";

export default function RoomPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { changeVideo, leave, room, sendMessage } = useRoom();

  useEffect(() => {
    socket.connect();
    socket.send({ event: "hand_shake", roomName: room?.name });

    const handleReload = () => {
      leave();
    };

    window.addEventListener("beforeunload", handleReload);

    return () => {
      window.removeEventListener("beforeunload", handleReload);
      socket.disconnect();
    };
  }, []);

  const handleChangeVideo = () => {
    if (inputRef.current) {
      let url = inputRef.current?.value;
      let videoId = getYouTubeVideoId(url);
      if (videoId) {
        changeVideo(videoId);
      }
      inputRef.current.value = "";
    }
  };

  if (!room) {
    return <h1>No Room</h1>;
  }
  return (
    <div className={styles.body}>
      <main className={styles.main}>
        <div className={styles.videoInput}>
          <input
            type="text"
            ref={inputRef}
            placeholder="Youtube Video URL"
            className={styles.smallInput}
          />
          <button onClick={handleChangeVideo} className={styles.btn}>
            Submit
          </button>
        </div>
        <div className={styles.roomInfo}>
          <div>Your room name: {room.name}</div>
          <div className={styles.memberList}>
            {room.members.map((member, index) => (
              <div key={index}>
                {member === room.owner && `Owner: `}
                {member}
                {member === room.user && "(You)"}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.roomContent}>
          <VideoPlayer></VideoPlayer>
          <ChatBox
            messages={room.messages}
            sendMessages={sendMessage}
          ></ChatBox>
        </div>
      </main>
    </div>
  );
}

function getYouTubeVideoId(url: string) {
  // The regular expression to match YouTube video URLs
  var regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

  // Try to match the URL using the regular expression
  var match = url.match(regExp);

  // If a match is found, return the video ID; otherwise, return null
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}
