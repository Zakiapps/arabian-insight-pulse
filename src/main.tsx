
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import preloadSounds from './utils/preloadSounds.ts'

// Create root element
const rootElement = document.getElementById("root")!;

// Use HTML lang attribute for language
document.documentElement.lang = "ar";

// Clear any direction settings that might conflict with Three.js
document.documentElement.dir = "";

// Preload sound effects
preloadSounds();

// Render the app
createRoot(rootElement).render(<App />);
