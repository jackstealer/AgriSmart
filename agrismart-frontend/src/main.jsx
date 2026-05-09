import { createRoot } from "react-dom/client";
import "./i18n/index.js";
import App from "./app/App";
import "./styles/index.css";
createRoot(document.getElementById("root")).render(<App />);
