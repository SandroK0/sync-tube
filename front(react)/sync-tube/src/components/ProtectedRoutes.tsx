import React from "react";
import { Navigate } from "react-router-dom";
import { useRoom } from "./RoomManager";

export default function ProtectedRoute({ children }: any) {
  const { room } = useRoom();
  if (room) {
    return children;
  } else {
    return <Navigate to="/" replace></Navigate>;
  }
}
