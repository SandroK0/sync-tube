export interface RoomData {
  nickname: string;
  roomName: string;
}

export interface MessageData {
  author: string;
  message: string;
}


export interface RoomState{
  isPaused:boolean,
  members:string [],
  videoId:string,
}