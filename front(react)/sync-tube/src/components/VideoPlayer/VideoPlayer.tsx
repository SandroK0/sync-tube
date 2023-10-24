import React, { useEffect, useRef, useState } from "react";
import YouTube, {
  YouTubeProps,
} from "react-youtube";
import { RoomData, RoomState } from "../../Types";
import { socket } from "../../socket";
import styles from "./VideoPlayer.module.css";
import ProgressBar from "./ProgressBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function VideoPlayer(props: {
  videoId: string;
  roomData: RoomData;
  setVideoId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const playerRef = useRef<YouTube>(null);
  const navigate = useNavigate();
  const [muted, setMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(`getRoom?roomName=${props.roomData.roomName}`)
      .then((resp) => {
        console.log(resp);

        const data: RoomState = resp.data;

        props.setVideoId(data.videoId);
        setIsPaused(data.isPaused);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  socket.on("play", () => {
    if (playerRef.current) {
      let player = playerRef.current.internalPlayer;
      player.playVideo();
      setIsPaused(false);
    }
  });

  socket.on("pause", () => {
    if (playerRef.current) {
      let player = playerRef.current.internalPlayer;
      player.pauseVideo();
      setIsPaused(true);
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
    socket.send({ event: "pause", roomName: props.roomData.roomName });
  };

  const handlePlay = () => {
    socket.send({ event: "play", roomName: props.roomData.roomName });
  };

  const handlePlus10 = () => {
    socket.send({ event: "+10", roomName: props.roomData.roomName });
  };

  const handleMinus10 = () => {
    socket.send({ event: "-10", roomName: props.roomData.roomName });
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
        <YouTube
          className={styles.Player}
          videoId={props.videoId}
          opts={opts}
          ref={playerRef}
          onReady={(e) => {
            setDuration(e.target.getDuration());
          }}
          onPlay={(e) => {
            if (isPaused) {
              e.target.pauseVideo();
            }
          }}
        />
      </div>
      {playerRef.current ? (
        <ProgressBar
          duration={duration}
          player={playerRef.current.internalPlayer}
          isPaused={isPaused}
        ></ProgressBar>
      ) : undefined}

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
          Mute
        </button>
        <button
          className={styles.btn}
          style={{ backgroundColor: "red" }}
          onClick={() => {
            navigate("/");
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
}

export default VideoPlayer;
