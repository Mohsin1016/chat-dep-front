import React, { useContext } from "react";
import { Routes as ReactRoutes, Route, Navigate } from "react-router-dom";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import { UserContext } from "./UserContext";
import Chat from "./Chat";
import VerifyEmail from "./verifyEmail";

export default function Routes() {
  const { username } = useContext(UserContext);

  return (
    <ReactRoutes>
      {/* Protected route for Chat */}
      {username ? (
        <Route path="/" element={<Chat />} />
      ) : (
        <Route path="/" element={<RegisterAndLoginForm />} />
      )}

      {/* Route for Email Verification */}
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </ReactRoutes>
  );
}
