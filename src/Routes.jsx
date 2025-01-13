import React, { useContext } from "react";
import { Routes as ReactRoutes, Route, Navigate } from "react-router-dom";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import { UserContext } from "./UserContext";
import Chat from "./Chat";
import VerifyEmail from "./verifyEmail";

export default function Routes() {
  let { username } = useContext(UserContext);

  console.log("user: 🚢🚢" + username);

  return (
    <ReactRoutes>
      {username ? (
        <Route path="/" element={<Chat />} />
      ) : (
        <Route path="/" element={<RegisterAndLoginForm />} />
      )}
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<Navigate to="/" />} />
    </ReactRoutes>
  );
}
