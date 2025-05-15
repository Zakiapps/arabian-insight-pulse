
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add dir="rtl" to the root element for RTL support
const rootElement = document.getElementById("root")!;
rootElement.dir = "rtl"; // Set RTL direction by default

createRoot(rootElement).render(<App />);
