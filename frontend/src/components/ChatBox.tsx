import React, { useEffect, useRef } from "react";
import { Message } from "../Types";
import styles from "./ChatBox.module.css";

interface ChatBoxProps {
  messages: Message[];
  sendMessages: (message: string) => void;
}

export default function ChatBox(props: ChatBoxProps) {
  const messageInput = useRef<null | HTMLInputElement>(null);
  const messageBox = useRef<null | HTMLDivElement>(null);

  const sendMessage = () => {
    if (messageInput.current?.value) {
      let message = messageInput.current.value;
      props.sendMessages(message);
      messageInput.current.value = "";
    }
  };

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTo({
        top: messageBox.current.scrollHeight,
      });
    }
  });

  return (
    <div className={styles.chatBox}>
      <div className={styles.messageBox} ref={messageBox}>
        {props.messages.map((element, index) => (
          <div className={styles.message} key={index}>
            <div>
              <span style={{ color: "blue" }}>{element.author}</span>:{" "}
              {element.message}
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
              sendMessage();
            }
          }}
        />
        <button type="submit" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
