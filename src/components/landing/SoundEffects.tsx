
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
  
  useEffect(() => {
    // Create ambient background sound - use a subtle ambient track
    ambientSoundRef.current = new Audio('https://cdn.freesound.org/previews/573/573660_5674468-lq.mp3');
    ambientSoundRef.current.loop = true;
    ambientSoundRef.current.volume = 0.2;
    
    // Create interaction sound for button clicks
    interactionSoundRef.current = new Audio('https://cdn.freesound.org/previews/242/242501_4284968-lq.mp3');
    interactionSoundRef.current.volume = 0.3;
    
    // Start playing if autoplay is enabled
    if (!muted) {
      ambientSoundRef.current.play().catch(err => console.log('Audio autoplay prevented:', err));
    }
    
    // Add click sound to all buttons on the page
    const buttons = document.querySelectorAll('button, a');
    const playInteractionSound = () => {
      if (!muted && interactionSoundRef.current) {
        // Clone the audio to allow multiple sounds playing at once
        const sound = interactionSoundRef.current.cloneNode() as HTMLAudioElement;
        sound.volume = 0.2;
        sound.play().catch(err => console.log('Interaction sound prevented:', err));
      }
    };
    
    buttons.forEach(button => {
      button.addEventListener('click', playInteractionSound);
    });
    
    return () => {
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause();
        ambientSoundRef.current = null;
      }
      if (interactionSoundRef.current) {
        interactionSoundRef.current = null;
      }
      buttons.forEach(button => {
        button.removeEventListener('click', playInteractionSound);
      });
    };
  }, []);
  
  useEffect(() => {
    if (ambientSoundRef.current) {
      if (muted) {
        ambientSoundRef.current.pause();
      } else {
        ambientSoundRef.current.play().catch(err => console.log('Audio play prevented:', err));
      }
    }
  }, [muted]);
  
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
