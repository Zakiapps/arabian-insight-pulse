
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import preloadSounds from './utils/preloadSounds.ts'

// Create root element
const rootElement = document.getElementById("root")!;

// Apply RTL only to the root container, not to document.documentElement
// This prevents conflicts with Three.js which expects LTR for rendering
rootElement.dir = "rtl";

// Make sure document direction is not set, which could interfere with Three.js
document.documentElement.dir = "";

// Preload sound effects
preloadSounds();

// Render the app
createRoot(rootElement).render(<App />);
