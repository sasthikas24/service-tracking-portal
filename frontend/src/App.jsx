import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSession } from "./utils/storage";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import RaiseComplaint from "./pages/RaiseComplaint.jsx";
import TrackComplaint from "./pages/TrackComplaint.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminTicketDetail from "./pages/AdminTicketDetail.jsx";
import Landing from "./pages/Landing.jsx";
import NotFound from "./pages/NotFound.jsx";

function ProtectedRoute({ children, allowedRole }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && session.role !== allowedRole) {
    return (
      <Navigate
        to={session.role === "user" ? "/user/dashboard" : "/admin/dashboard"}
        replace
      />
    );
  }

  return children;
}

function App() {
  const session = getSession();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate
                to={session.role === "user" ? "/user/dashboard" : "/admin/dashboard"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            session ? (
              <Navigate
                to={session.role === "user" ? "/user/dashboard" : "/admin/dashboard"}
                replace
              />
            ) : (
              <Register />
            )
          }
        />


        {/* User */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/raise"
          element={
            <ProtectedRoute allowedRole="user">
              <RaiseComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/track"
          element={
            <ProtectedRoute allowedRole="user">
              <TrackComplaint />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ticket/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminTicketDetail />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate
                to={session.role === "user" ? "/user/dashboard" : "/admin/dashboard"}
                replace
              />
            ) : (
              <Landing />
            )
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
