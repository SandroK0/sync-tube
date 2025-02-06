import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import axios from "axios";
import { useRoom } from "../../components/RoomManager";
import { API_URL } from "../../config";
import { useIsMobile } from "../../useIsMobile";

export default function HomePage() {
  const navigate = useNavigate();

  const userInput = useRef<HTMLInputElement>(null);
  const roomInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const RoomManager = useRoom();

  useEffect(() => {
    if (RoomManager.room) {
      navigate("/room");
    }
  }, [RoomManager.room]);

  const handleJoin = async () => {
    if (userInput.current?.value && roomInput.current?.value) {
      let room = roomInput.current.value;
      let user = userInput.current.value;
      axios
        .post(`${API_URL}/join_room`, {
          room,
          user,
        })
        .then((resp) => {
          RoomManager.join(room, user);
        })
        .catch((error) => {
          setError(error.response.data.error);
        });
    } else {
      setError("all fields are required!");
    }
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  });

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1>Mobile Version Not Available</h1>
        <p>
          Our application is currently not optimized for mobile devices. Please
          access the site from a desktop or laptop for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h1>Welcome to syncTube</h1>
        <p className={styles.slogan}>
          Watch Together with Friends and Family, Anytime, Anywhere
        </p>
        <div className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Your Nickname*"
            ref={userInput}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Room Name*"
            ref={roomInput}
          />

          {error ? <h4 style={{ color: "red" }}>{error}*</h4> : undefined}

          <button onClick={handleJoin} className={styles.btn}>
            Create/Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
