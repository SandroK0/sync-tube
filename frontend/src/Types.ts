export interface Room {
  owner: string;
  user: string;
  name: string;
  isPaused: boolean;
  members: string[];
  messages: Message[];
  videoId: string;
  current_time: number;
}

export interface Message {
  author: string;
  message: string;
}
