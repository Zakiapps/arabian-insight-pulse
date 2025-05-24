
/**
 * Utility to preload audio files for better user experience
 * with improved performance and lazy loading
 */

export const preloadSounds = () => {
  // Preload only when user interacts with the page
  const handleFirstInteraction = () => {
    const soundUrls = [
      'https://cdn.freesound.org/previews/573/573660_5674468-lq.mp3', // Ambient background
      'https://cdn.freesound.org/previews/242/242501_4284968-lq.mp3'  // Button click
    ];
    
    soundUrls.forEach(url => {
      try {
        const audio = new Audio();
        audio.preload = 'metadata'; // Only load metadata first, not full file
        audio.src = url;
        
        // Remove preload event listener after first interaction
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      } catch (error) {
        console.error(`Failed to preload audio: ${url}`, error);
      }
    });
  };

  // Add event listeners for common user interactions
  document.addEventListener('click', handleFirstInteraction, { once: true });
  document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  document.addEventListener('keydown', handleFirstInteraction, { once: true });
};

export default preloadSounds;
