// import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import HandsContainer from "./components/Hands";
import FaceMeshContainer from "./components/FaceMesh";

const router = createBrowserRouter([
  {
    path: "/",
    element: <h1>Welcome Page</h1>,
  },
  {
    path: "/hands",
    element: <HandsContainer />,
  },
  {
    path: "/face-mesh",
    element: <FaceMeshContainer />,
  },
  {
    path: "/about",
    element: <h1>About Page</h1>,
  },
]);

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <>
    <RouterProvider router={router}></RouterProvider>
  </>
);
