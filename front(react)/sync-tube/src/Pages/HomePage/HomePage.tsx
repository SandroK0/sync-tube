import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import axios from "axios";
import { useRoom } from "../../components/RoomManager";

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
        .post("joinRoom", {
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
    if (e.key == "Enter") {
      handleJoin();
    }
  });

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
