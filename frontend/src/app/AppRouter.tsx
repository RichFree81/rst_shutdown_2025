import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy } from "react";
import { useAuth } from "./providers/AuthProvider";
import AppShell from "./AppShell";
import ProtectedRoute from "./ProtectedRoute";
import DomainOutlet from "./shell/DomainOutlet";
import "./shell/domains";

const SignIn = lazy(() => import("../domains/auth/pages/SignIn"));
const AcceptInvite = lazy(() => import("../domains/auth/pages/AcceptInvite"));
const RequestReset = lazy(() => import("../domains/auth/pages/RequestReset"));
const ResetPassword = lazy(() => import("../domains/auth/pages/ResetPassword"));

const router = createBrowserRouter([
  // App area (wrapped with AppShell)
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <ProtectedRoute><Navigate to="/d/home" replace /></ProtectedRoute> },
      // New domain route
      { path: "/d/:domainId/*", element: <ProtectedRoute><DomainOutlet /></ProtectedRoute> },
    ],
  },
  // Auth area (no AppShell — minimal layout)
  { path: "/signin", element: <SignIn /> },
  { path: "/accept-invite", element: <AcceptInvite /> },
  { path: "/request-reset", element: <RequestReset /> },
  { path: "/reset-password", element: <ResetPassword /> },
]);
export default function AppRouter() { return <RouterProvider router={router} />; }
