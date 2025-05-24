
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import preloadSounds from './utils/preloadSounds.ts'

// Only add RTL to the root element, don't set it on document.documentElement
// This prevents conflicts with Three.js which expects LTR for 3D rendering
const rootElement = document.getElementById("root")!;
rootElement.dir = "rtl";

// Reset default direction for document to avoid conflicts with Three.js
document.documentElement.dir = "";

// Preload sound effects
preloadSounds();

createRoot(rootElement).render(<App />);
