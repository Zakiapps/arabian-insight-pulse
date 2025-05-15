
import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Set initial value
    updateMatches();
    
    // Setup the listener
    media.addEventListener("change", updateMatches);
    
    // Cleanup
    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}
