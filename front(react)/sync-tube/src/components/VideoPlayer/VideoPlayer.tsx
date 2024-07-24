import React, { useRef, useState } from "react";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { socket } from "../../socket";
import styles from "./VideoPlayer.module.css";
import ProgressBar from "./ProgressBar";
import { useRoom } from "../RoomManager";

function VideoPlayer() {
  const playerRef = useRef<YouTube>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const RoomManager = useRoom();

  socket.on("play", () => {
    if (playerRef.current) {
      let player = playerRef.current.internalPlayer;
      player.playVideo();
      if (RoomManager.room) {
        RoomManager.setRoom({ ...RoomManager.room, isPaused: false });
      }
    }
  });

  socket.on("pause", () => {
    if (playerRef.current) {
      let player = playerRef.current.internalPlayer;
      player.pauseVideo();
      if (RoomManager.room) {
        RoomManager.setRoom({ ...RoomManager.room, isPaused: true });
      }
    }
  });

  socket.on("+10", async () => {
    if (playerRef.current) {
      let player = playerRef.current.internalPlayer;

      const currentTime = await player.getCurrentTime();

      player.seekTo(currentTime + 10);
    }
  });

  socket.on("-10", async () => {
    if (playerRef.current) {
      let player = playerRef.current.internalPlayer;
      const currentTime = await player.getCurrentTime();
      player.seekTo(currentTime - 10);
    }
  });

  socket.on("seekTo", async (data: { time: Number }) => {
    if (playerRef.current) {
      let player = await playerRef.current.getInternalPlayer();
      player.seekTo(data.time);
    }
  });

  const handlePause = () => {
    RoomManager.handlePause();
  };

  const handlePlay = () => {
    RoomManager.handlePlay();
  };

  const handlePlus10 = () => {
    RoomManager.handlePlus10();
  };

  const handleMinus10 = () => {
    RoomManager.handleMinus10();
  };

  const handleMute = () => {
    if (playerRef.current) {
      let player = playerRef.current.internalPlayer;
      if (muted) {
        player.unMute();
        setMuted(false);
      } else {
        player.mute();
        setMuted(true);
      }
    }
  };

  const opts: YouTubeProps["opts"] = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      disablekb: 1,
      iv_load_policy: 0,
    },
  };

  return (
    <div className={styles.playerBox}>
      <div className={styles.unclickable}>
        {RoomManager.room?.videoId ? (
          <YouTube
            className={styles.Player}
            videoId={RoomManager.room?.videoId}
            opts={opts}
            ref={playerRef}
            onReady={(e: YouTubeEvent) => {
              setDuration(e.target.getDuration());

              if (playerRef.current && RoomManager.room) {
                let player = playerRef.current.internalPlayer;
                player.seekTo(RoomManager.room.current_time)
                if (RoomManager.room.isPaused) {
                  player.pauseVideo();
                }
              }
            }}
          />
        ) : (
          <h1>Submit a video first!</h1>
        )}
      </div>
      {playerRef.current && (
        <ProgressBar
          duration={duration}
          player={playerRef.current.internalPlayer}
        ></ProgressBar>
      )}

      <div className={styles.controlBox}>
        <button className={styles.btn} onClick={handleMinus10}>
          - 10 SEC
        </button>
        <button className={styles.btn} onClick={handlePlay}>
          Play
        </button>
        <button className={styles.btn} onClick={handlePause}>
          Pause
        </button>
        <button className={styles.btn} onClick={handlePlus10}>
          + 10 SEC
        </button>
        <button className={styles.btn} onClick={handleMute}>
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          className={styles.btnRed}
          onClick={() => {
            RoomManager.leave();
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
}

export default VideoPlayer;
