import { useState, useEffect, useContext } from "react";
import { YouTubePlayer } from "react-youtube";
import styles from "./ProgressBar.module.css";
import { socket } from "../../socket";
import { MyContext } from "../../Pages/Room/Room";

const ProgressBar = (props: {
  duration: number;
  player: YouTubePlayer;
  isPaused: boolean;
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const roomData = useContext(MyContext);

  useEffect(() => {
    const handleProgress = async () => {
      if (!props.isPaused) {
        let current = await props.player.getCurrentTime();
        setCurrentTime(current);
      }
    };

    const interval = setInterval(() => {
      handleProgress();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  const handleSeek = (e: any) => {
    const seekTime =
      (e.nativeEvent.offsetX / e.target.clientWidth) * props.duration;
    setCurrentTime(seekTime);
    socket.send({
      event: "seekTo",
      roomName: roomData?.roomName,
      currentTime: seekTime,
    });
  };

  return (
    <div className={styles.progressBar} onClick={handleSeek}>
      <div
        className={styles.progressBarFill}
        style={{ width: `${(currentTime / props.duration) * 100}%` }}
      >
        <div className={styles.point}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
