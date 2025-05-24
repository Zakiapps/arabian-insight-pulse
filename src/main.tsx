
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import preloadSounds from './utils/preloadSounds.ts'

// Add dir="rtl" to the root element for RTL support by default
const rootElement = document.getElementById("root")!;
// Set RTL direction only for the root element, not for all elements
// This prevents conflicts with Three.js which expects LTR for 3D rendering
document.documentElement.dir = "rtl";

// Preload sound effects
preloadSounds();

createRoot(rootElement).render(<App />);
