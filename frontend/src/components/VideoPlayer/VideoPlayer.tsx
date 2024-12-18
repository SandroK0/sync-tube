import React, { useRef, useState } from "react";
import { SlSizeFullscreen } from "react-icons/sl";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { socket } from "../../config";
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

  socket.on("seek_to", async (data: { time: Number }) => {
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

  const handleFullScreen = async () => {
    if (playerRef.current) {
      const player = await playerRef.current.getInternalPlayer();

      // Use YouTube's native fullscreen method
      player.getIframe().then((iframe: any) => {
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        } else if ((iframe as any).webkitRequestFullscreen) {
          (iframe as any).webkitRequestFullscreen(); // Safari
        } else if ((iframe as any).msRequestFullscreen) {
          (iframe as any).msRequestFullscreen(); // IE/Edge
        } else {
          console.error("Fullscreen API is not supported on this browser.");
        }
      });
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
                player.seekTo(RoomManager.room.current_time);
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
        <button
          className={styles.btn}
          onClick={handleMinus10}
          disabled={!playerRef.current}
        >
          - 10 SEC
        </button>
        <button
          className={styles.btn}
          onClick={handlePlay}
          disabled={!playerRef.current}
        >
          Play
        </button>
        <button
          className={styles.btn}
          onClick={handlePause}
          disabled={!playerRef.current}
        >
          Pause
        </button>
        <button
          className={styles.btn}
          onClick={handlePlus10}
          disabled={!playerRef.current}
        >
          + 10 SEC
        </button>
        <button
          className={styles.btn}
          onClick={handleMute}
          disabled={!playerRef.current}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          className={styles.btn}
          onClick={handleFullScreen}
          disabled={!playerRef.current}
        >
          <SlSizeFullscreen />
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
