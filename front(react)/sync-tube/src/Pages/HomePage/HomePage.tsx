import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import axios from "axios";

export default function HomePage() {
  const navigate = useNavigate();

  const nickname = useRef<HTMLInputElement>(null);
  const roomName = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handleJoin = async () => {
    if (nickname.current?.value && roomName.current?.value) {
      axios
        .post("createRoom", {
          roomName: roomName.current.value,
          nickName: nickname.current.value,
        })
        .then((resp) => {
          navigate("/room", {
            state: {
              nickname: nickname.current?.value,
              roomName: roomName.current?.value,
            },
          });
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
            ref={nickname}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Room Name*"
            ref={roomName}
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
