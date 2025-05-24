
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundEffectsProps {
  autoplay?: boolean;
}

const SoundEffects: React.FC<SoundEffectsProps> = ({ autoplay = false }) => {
  const [muted, setMuted] = useState(!autoplay);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);
  const interactionSoundRef = useRef<HTMLAudioElement | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  // Lazy initialize audio
  useEffect(() => {
    // Ignore audio initialization on environments that don't support it well
    if (typeof window === 'undefined') return;

    const initAudio = () => {
      try {
        // Create ambient background sound - ensure we have a valid audio context
        const ambient = new Audio();
        ambient.src = 'https://cdn.freesound.org/previews/573/573660_5674468-lq.mp3';
        ambient.loop = true;
        ambient.volume = 0.2;
        ambient.preload = 'none'; // Only load when needed
        ambientSoundRef.current = ambient;
      
        // Create interaction sound for button clicks
        const interaction = new Audio();
        interaction.src = 'https://cdn.freesound.org/previews/242/242501_4284968-lq.mp3';
        interaction.volume = 0.3;
        interaction.preload = 'none'; // Only load when needed
        interactionSoundRef.current = interaction;
        
        setAudioInitialized(true);
      } catch (error) {
        console.error("Error initializing audio:", error);
        setAudioError(true);
        setAudioInitialized(false);
      }
    };
    
    // Only initialize on user interaction to avoid autoplay restrictions
    const handleFirstInteraction = () => {
      if (!audioInitialized && !audioError) {
        initAudio();
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    
    // Clean up function
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause();
        ambientSoundRef.current = null;
      }
      if (interactionSoundRef.current) {
        interactionSoundRef.current = null;
      }
      setAudioInitialized(false);
    };
  }, [audioInitialized, audioError]);
  
  // Handle audio playback based on muted state - with robust error handling
  useEffect(() => {
    if (!audioInitialized || audioError) return;
    
    // Add click sound to all buttons on the page
    const playInteractionSound = () => {
      if (!muted && interactionSoundRef.current && audioInitialized) {
        try {
          // Clone the audio to allow multiple sounds playing at once
          const sound = interactionSoundRef.current.cloneNode() as HTMLAudioElement;
          sound.volume = 0.2;
          sound.play().catch(err => {
            console.log('Interaction sound prevented:', err);
            // Don't set muted here - just fail silently
          });
        } catch (error) {
          console.error("Error playing interaction sound:", error);
        }
      }
    };
    
    // Use event delegation for better performance
    const handleClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && 
          (e.target.tagName === 'BUTTON' || 
           e.target.tagName === 'A' || 
           e.target.closest('button') || 
           e.target.closest('a'))) {
        playInteractionSound();
      }
    };
    
    document.body.addEventListener('click', handleClick);
    
    return () => {
      document.body.removeEventListener('click', handleClick);
    };
  }, [muted, audioInitialized, audioError]);
  
  // Handle mute/unmute with better error handling
  useEffect(() => {
    if (!ambientSoundRef.current || !audioInitialized || audioError) return;
    
    try {
      if (muted) {
        ambientSoundRef.current.pause();
      } else {
        // Start loading only when unmuted
        if (ambientSoundRef.current.preload === 'none') {
          ambientSoundRef.current.preload = 'auto';
        }
        
        ambientSoundRef.current.play().catch(err => {
          console.log('Audio play prevented:', err);
          setMuted(true); // Set to muted if play fails
        });
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
      setMuted(true); // Default to muted on error
    }
  }, [muted, audioInitialized, audioError]);
  
  // Don't render anything if there are audio errors
  if (audioError) return null;
  
  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 z-50 bg-background/50 backdrop-blur-sm"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
    >
      {muted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
};

export default SoundEffects;
