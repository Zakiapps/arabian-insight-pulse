
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import preloadSounds from './utils/preloadSounds.ts'

// Create root element
const rootElement = document.getElementById("root")!;

// For RTL content, set language attribute instead of direction
// This approach is more compatible with Three.js
rootElement.lang = "ar";

// Make sure document direction is not set to avoid Three.js issues
document.documentElement.dir = "";

// Preload sound effects
preloadSounds();

// Render the app
createRoot(rootElement).render(<App />);
