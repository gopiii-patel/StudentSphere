import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { useEffect } from "react";

import ProtectedRoute from "./components/ProtectedRoute";

import Notifications from "./components/Notifications";

import GlobalSocketListener from "./components/GlobalSocketListener";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/profile";
import Chat from "./pages/Chat";
import ProductDetails from "./pages/ProductDetails";
import Notes from "./pages/Notes";
import UploadNote from "./pages/UploadNote";

import VerifyOtp from "./pages/VerifyOtp";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";



function App() {
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <BrowserRouter>

      <GlobalSocketListener />

      <Notifications />

      <Routes>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={<Messages />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOtp />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/notes"
          element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
          }
        />

        <Route
          path="/notes/upload"
          element={
          <ProtectedRoute>
            <UploadNote />
          </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;