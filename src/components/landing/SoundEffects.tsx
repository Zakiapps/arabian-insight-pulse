
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
  
  // Initialize audio with better error handling
  useEffect(() => {
    try {
      // Create ambient background sound
      ambientSoundRef.current = new Audio('https://cdn.freesound.org/previews/573/573660_5674468-lq.mp3');
      if (ambientSoundRef.current) {
        ambientSoundRef.current.loop = true;
        ambientSoundRef.current.volume = 0.2;
      }
    
      // Create interaction sound for button clicks
      interactionSoundRef.current = new Audio('https://cdn.freesound.org/previews/242/242501_4284968-lq.mp3');
      if (interactionSoundRef.current) {
        interactionSoundRef.current.volume = 0.3;
      }
      
      setAudioInitialized(true);
    } catch (error) {
      console.error("Error initializing audio:", error);
      setAudioInitialized(false);
    }
    
    // Clean up function
    return () => {
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause();
        ambientSoundRef.current = null;
      }
      if (interactionSoundRef.current) {
        interactionSoundRef.current = null;
      }
      setAudioInitialized(false);
    };
  }, []);
  
  // Handle audio playback based on muted state
  useEffect(() => {
    if (!audioInitialized) return;
    
    // Start playing only if autoplay is enabled and not muted
    if (!muted && autoplay && ambientSoundRef.current) {
      ambientSoundRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
        setMuted(true); // Set to muted if autoplay fails
      });
    }
    
    // Add click sound to all buttons on the page
    const playInteractionSound = () => {
      if (!muted && interactionSoundRef.current && audioInitialized) {
        try {
          // Clone the audio to allow multiple sounds playing at once
          const sound = interactionSoundRef.current.cloneNode() as HTMLAudioElement;
          sound.volume = 0.2;
          sound.play().catch(err => console.log('Interaction sound prevented:', err));
        } catch (error) {
          console.error("Error playing interaction sound:", error);
        }
      }
    };
    
    // Use event delegation for better performance
    document.body.addEventListener('click', (e) => {
      if (e.target instanceof HTMLElement && 
          (e.target.tagName === 'BUTTON' || 
           e.target.tagName === 'A' || 
           e.target.closest('button') || 
           e.target.closest('a'))) {
        playInteractionSound();
      }
    });
    
    return () => {
      document.body.removeEventListener('click', playInteractionSound);
    };
  }, [muted, autoplay, audioInitialized]);
  
  // Handle mute/unmute
  useEffect(() => {
    if (ambientSoundRef.current && audioInitialized) {
      if (muted) {
        ambientSoundRef.current.pause();
      } else {
        ambientSoundRef.current.play().catch(err => {
          console.log('Audio play prevented:', err);
          setMuted(true); // Set to muted if play fails
        });
      }
    }
  }, [muted, audioInitialized]);
  
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
