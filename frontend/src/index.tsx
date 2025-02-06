import React from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import RoomManager from "./components/RoomManager";
import RoomPage from "./Pages/Room/RoomPage";
import ProtectedRoute from "./components/ProtectedRoutes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<HomePage />}></Route>
      <Route
        path="/room"
        element={
          <ProtectedRoute>
            <RoomPage />
          </ProtectedRoute>
        }
      ></Route>
    </Route>
  )
);

root.render(
  <RoomManager>
    <RouterProvider router={router} />
  </RoomManager>
);
