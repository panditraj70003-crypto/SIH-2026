import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NotifyProvider } from "./context/NotifyContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotifyProvider>
        <App />
      </NotifyProvider>
    </ThemeProvider>
  </React.StrictMode>
);
