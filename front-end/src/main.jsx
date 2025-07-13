import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App.jsx";
import Server from "./Pages/Server.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/room/:roomId",
    element: <Server />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
