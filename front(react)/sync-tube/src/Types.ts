export interface Room {
  user: string;
  name: string;
  isPaused: boolean;
  members: string[];
  messages: Message[];
  videoId: string;
}

export interface Message {
  author: string;
  message: string;
}
