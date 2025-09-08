import { Navigate } from "react-router-dom";
import { getAccess } from "../auth";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const isAuthed = !!getAccess();
  return isAuthed ? children : <Navigate to="/login" replace />;
}
