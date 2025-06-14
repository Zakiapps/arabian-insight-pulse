/*
  # User Functions

  1. New Functions
    - `create_notification` - Create a notification for a user
    - `mark_notification_read` - Mark a notification as read
    - `update_user_session_status` - Update user online status
    - `clear_user_posts` - Clear all posts for current user
    - `clear_all_posts` - Clear all posts (admin only)
    - `clear_dummy_data` - Clear dummy data (admin only)
    - `cleanup_old_notifications` - Cleanup old notifications

  2. Security
    - Functions are secured with appropriate permissions
    - Admin-only functions check for admin role
*/

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param UUID,
  title_param TEXT,
  message_param TEXT,
  type_param TEXT DEFAULT 'info',
  action_url_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    action_url
  )
  VALUES (
    user_id_param,
    title_param,
    message_param,
    type_param,
    action_url_param
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE
  WHERE id = notification_id_param
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user session status
CREATE OR REPLACE FUNCTION update_user_session_status(
  session_id_param TEXT,
  is_online_param BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Update or insert session
  INSERT INTO user_sessions (
    user_id,
    session_id,
    is_online,
    last_seen
  )
  VALUES (
    current_user_id,
    session_id_param,
    is_online_param,
    NOW()
  )
  ON CONFLICT (session_id)
  DO UPDATE SET
    is_online = is_online_param,
    last_seen = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear all posts for current user
CREATE OR REPLACE FUNCTION clear_user_posts()
RETURNS VOID AS $$
BEGIN
  DELETE FROM analyzed_posts
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear all posts (admin only)
CREATE OR REPLACE FUNCTION clear_all_posts()
RETURNS VOID AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can clear all posts';
  END IF;

  DELETE FROM analyzed_posts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear dummy data (admin only)
CREATE OR REPLACE FUNCTION clear_dummy_data()
RETURNS VOID AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can clear dummy data';
  END IF;

  -- Clear dummy data from all tables
  DELETE FROM analyzed_posts;
  DELETE FROM predictions;
  DELETE FROM user_alerts;
  DELETE FROM notifications;
  DELETE FROM task_history;
  DELETE FROM user_reports;
  DELETE FROM notification_history;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
  -- Delete notifications older than 30 days
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete read notifications older than 7 days
  DELETE FROM notifications
  WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;