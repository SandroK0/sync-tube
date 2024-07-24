import { useState, useEffect, useContext } from "react";
import { YouTubePlayer } from "react-youtube";
import styles from "./ProgressBar.module.css";
import { useRoom } from "../RoomManager";

const ProgressBar = (props: { duration: number; player: YouTubePlayer }) => {
  let { duration, player } = props;

  const [currentTime, setCurrentTime] = useState<number>(0);
  const { seekTo, room, updateTime } = useRoom();

  useEffect(() => {
    const handleProgress = async () => {
      if (room && !room.isPaused) {
        let current = await player.getCurrentTime();
        setCurrentTime(current);
        if (room.user === room.owner) {
          updateTime(current);
        }
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
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    setCurrentTime(seekTime);
    seekTo(seekTime);
  };

  return (
    <div className={styles.progressBar} onClick={handleSeek}>
      <div
        className={styles.progressBarFill}
        style={{ width: `${(currentTime / duration) * 100}%` }}
      >
        <div className={styles.point}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
