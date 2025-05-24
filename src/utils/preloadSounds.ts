
/**
 * Utility to preload audio files for better user experience
 */

export const preloadSounds = () => {
  const soundUrls = [
    'https://cdn.freesound.org/previews/573/573660_5674468-lq.mp3', // Ambient background
    'https://cdn.freesound.org/previews/242/242501_4284968-lq.mp3'  // Button click
  ];
  
  soundUrls.forEach(url => {
    const audio = new Audio();
    audio.src = url;
    // Just start loading, don't actually play
    audio.load();
  });
};

export default preloadSounds;
