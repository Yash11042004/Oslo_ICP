import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider, extendTheme, ColorModeScript } from "@chakra-ui/react";
import App from "./App";
import "./index.css";

import ProtectedRoute from "./components/ProtectedRoute";
import ProspectDetail from "./pages/ProspectDetail";
import Uploads from "./pages/Uploads";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Prospects from "./pages/Prospects";
import Home from "./pages/Home";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
            path="/prospects"
            element={
              <ProtectedRoute>
                <Prospects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prospects/:id"
            element={
              <ProtectedRoute>
                <ProspectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uploads"
            element={
              <ProtectedRoute>
                <Uploads />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
