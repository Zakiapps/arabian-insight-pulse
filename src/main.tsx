
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import preloadSounds from './utils/preloadSounds.ts'

// Add dir="rtl" to the root element for RTL support by default
const rootElement = document.getElementById("root")!;
rootElement.dir = "rtl"; // Set RTL direction by default for Arabic

// Preload sound effects
preloadSounds();

createRoot(rootElement).render(<App />);
