import React from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import Room from "./Pages/Room/Room";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<HomePage />}></Route>
      <Route path="/room" element={<Room />}></Route>
    </Route>
  )
);

root.render(<RouterProvider router={router} />);
