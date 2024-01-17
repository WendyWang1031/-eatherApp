import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import WeatherApp  from "./WeatherApp";

import './styles.css';

function App() {
  return <WeatherApp />;
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
