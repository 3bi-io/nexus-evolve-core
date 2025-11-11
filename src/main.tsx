import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service worker auto-registration is handled by vite-plugin-pwa with injectRegister: 'auto'
// Check console for SW registration status

createRoot(document.getElementById("root")!).render(<App />);
