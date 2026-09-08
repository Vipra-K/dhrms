import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import "./index.css";
import "./public.css";
import "./public-fixes.css";
import "./worker.css";
import "./worker-overrides.css";
import "./worker-polish.css";
import "./worker-superdesign.css";
import "./worker-ux-v2.css";
import "./dark-theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
