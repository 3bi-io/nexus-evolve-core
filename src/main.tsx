import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPWA } from "./lib/pwa-lifecycle";

// Initialize PWA with explicit lifecycle management
initPWA();

createRoot(document.getElementById("root")!).render(<App />);
