import { createContext, useEffect, useRef, useState } from "react";
import { Navigate, useLocation} from "react-router-dom";
import { MessageData, RoomData } from "../../Types";
import { socket } from "../../socket";
import styles from "./Room.module.css";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import axios from "axios";

export const MyContext = createContext<RoomData | null>(null);

export default function Room() {
  const inputRef = useRef<HTMLInputElement>(null);
  const messageInput = useRef<null | HTMLInputElement>(null);
  const [Messages, setMessages] = useState<MessageData[] | []>([]);
  const [videoId, setVideoId] = useState<string>("");

  //"dVuGRMrxhM8"

  const DATA = useLocation();
  const roomData: RoomData | null = DATA.state;

  useEffect(() => {
    if (roomData) {
      socket.connect();
      socket.send({
        event: "new_member",
        roomName: roomData.roomName,
        nickName: roomData.nickname,
      });
    }

    const confirmLeave = async () => {
      await axios.delete(
        `leave?roomName=${roomData?.roomName}&nickName=${roomData?.nickname}`
      );
    };

    window.addEventListener("beforeunload", confirmLeave);

    return () => {
      confirmLeave();
      window.removeEventListener("beforeunload", confirmLeave);
      socket.disconnect();
    };
  }, []);

  const changeVideo = () => {
    if (inputRef.current && roomData) {
      let url = inputRef.current?.value;
      let videoId = getYouTubeVideoId(url);
      socket.send({
        roomName: roomData.roomName,
        event: "change_video",
        videoId,
      });
      inputRef.current.value = "";
    }
  };

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

  socket.on("change_video", (data: { videoId: string }) => {
    setVideoId(data.videoId);
  });

  socket.on("message_recived", (data: MessageData) => {
    setMessages([...Messages, data]);
  });

  const send_message = () => {
    if (messageInput.current?.value && roomData) {
      socket.send({
        event: "new_message",
        roomName: roomData.roomName,
        message: {
          author: roomData.nickname,
          message: messageInput.current.value,
        },
      });
      messageInput.current.value = "";
    }
  };

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
          <button onClick={changeVideo} className={styles.btn}>
            Submit
          </button>
        </div>
        <p>Your Room:{roomData?.roomName}</p>
        <div className={styles.roomContent}>
          {!roomData ? (
            <Navigate to="/"></Navigate>
          ) : (
            <MyContext.Provider value={roomData}>
              <VideoPlayer
                videoId={videoId}
                roomData={roomData}
                setVideoId={setVideoId}
              ></VideoPlayer>
            </MyContext.Provider>
          )}
          <div className={styles.chatBox}>
            <div className={styles.messageBox}>
              {Messages?.map((element) => (
                <div className={styles.message}>
                  <div>
                    <span style={{ color: "rgb(0 ,162, 255)" }}>
                      {element.author}
                    </span>
                    : {element.message}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.inputBox}>
              <input
                type="text"
                placeholder="chat..."
                ref={messageInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    send_message();
                  }
                }}
              />
              <button type="submit" onClick={send_message}>
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
