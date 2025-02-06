import { io } from "socket.io-client";

export const API_URL: string = process.env.REACT_APP_API_URL || '';


export const socket = io(`${API_URL}`, { autoConnect: false });
