
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserSession = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Generate a unique session ID
    const sessionId = `${user.id}-${Date.now()}`;

    // Update online status when user becomes active
    const updateOnlineStatus = async (isOnline: boolean = true) => {
      try {
        await supabase.rpc('update_user_session_status', {
          session_id_param: sessionId,
          is_online_param: isOnline
        });
        console.log(`Updated session status: ${isOnline ? 'online' : 'offline'}`);
      } catch (error) {
        console.error('Error updating session status:', error);
      }
    };

    // Set user as online when component mounts
    updateOnlineStatus(true);

    // Set up heartbeat to keep user online
    const heartbeatInterval = setInterval(() => {
      updateOnlineStatus(true);
    }, 30000); // Update every 30 seconds

    // Set user as offline when page is unloaded
    const handleBeforeUnload = () => {
      updateOnlineStatus(false);
    };

    // Set user as offline when page becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateOnlineStatus(false);
      } else {
        updateOnlineStatus(true);
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Set user as offline when component unmounts
      updateOnlineStatus(false);
    };
  }, [user]);
};
