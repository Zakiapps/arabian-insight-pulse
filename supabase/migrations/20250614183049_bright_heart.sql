/*
  # Seed Data

  1. New Data
    - Default subscription plans
    - Admin user
    - Sample posts for demo

  2. Security
    - Secure password for admin user
    - Appropriate data for demonstration
*/

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, is_active)
VALUES
  ('free', 'Free tier with basic features', 0, 0, '["100 posts per month", "Basic sentiment analysis", "Jordanian dialect detection", "Basic reports"]', TRUE),
  ('basic', 'Basic tier with more features', 1900, 19900, '["1,000 posts per month", "Advanced sentiment analysis", "Dialect detection", "Email alerts", "Standard reports"]', TRUE),
  ('premium', 'Premium tier with advanced features', 4900, 49900, '["10,000 posts per month", "Advanced sentiment analysis", "All dialect detection", "Real-time alerts", "Advanced reports", "Priority support"]', TRUE),
  ('enterprise', 'Enterprise tier with all features', 9900, 99900, '["Unlimited posts", "All features", "Custom integrations", "Dedicated support", "API access"]', TRUE);

-- Create admin user if it doesn't exist
DO $$
DECLARE
  admin_exists BOOLEAN;
  admin_user_id UUID;
BEGIN
  -- Check if admin user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@arabinsights.com'
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Create admin user in auth.users
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data
    )
    VALUES (
      'admin@arabinsights.com',
      crypt('password', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin User"}'
    )
    RETURNING id INTO admin_user_id;
    
    -- Create admin profile
    INSERT INTO profiles (id, full_name, role)
    VALUES (admin_user_id, 'Admin User', 'admin');
  END IF;
END
$$;

-- Insert sample posts for demo
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@arabinsights.com';
  
  -- Insert sample posts
  INSERT INTO analyzed_posts (user_id, content, sentiment, sentiment_score, is_jordanian_dialect, source, engagement_count)
  VALUES
    (admin_user_id, 'هذا المنتج رائع جداً، أنصح الجميع بتجربته!', 'positive', 0.92, TRUE, 'twitter', 150),
    (admin_user_id, 'لم أكن راضياً عن الخدمة المقدمة، كانت بطيئة جداً.', 'negative', 0.85, TRUE, 'facebook', 75),
    (admin_user_id, 'المنتج جيد ولكن السعر مرتفع قليلاً.', 'neutral', 0.65, TRUE, 'instagram', 42),
    (admin_user_id, 'الخدمة ممتازة والموظفين محترمين جداً.', 'positive', 0.88, TRUE, 'twitter', 120),
    (admin_user_id, 'تجربة سيئة جداً، لن أعود مرة أخرى.', 'negative', 0.91, FALSE, 'facebook', 200),
    (admin_user_id, 'يلا يا زلمة الوضع تمام والجو حلو.', 'positive', 0.78, TRUE, 'twitter', 65),
    (admin_user_id, 'الاقتصاد في تحسن مستمر وفقاً للمؤشرات الأخيرة.', 'positive', 0.72, FALSE, 'news', 310),
    (admin_user_id, 'أسعار النفط في انخفاض مستمر مما يؤثر على الميزانية.', 'negative', 0.68, FALSE, 'news', 280),
    (admin_user_id, 'فريق كرة القدم حقق فوزاً كبيراً في المباراة الأخيرة.', 'positive', 0.95, TRUE, 'sports', 520),
    (admin_user_id, 'التعليم عن بعد يواجه تحديات كبيرة في المناطق النائية.', 'negative', 0.62, FALSE, 'education', 175);
END
$$;

-- Insert sample notifications
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@arabinsights.com';
  
  -- Insert sample notifications
  INSERT INTO notifications (user_id, title, message, type, is_read)
  VALUES
    (admin_user_id, 'مرحباً بك في المنصة', 'شكراً لاستخدامك منصة رؤى عربية للتحليل', 'info', TRUE),
    (admin_user_id, 'تم تحليل 10 منشورات', 'اكتملت عملية تحليل المنشورات بنجاح', 'success', FALSE),
    (admin_user_id, 'تنبيه: ارتفاع في المشاعر السلبية', 'تم رصد ارتفاع في المشاعر السلبية حول الموضوع المحدد', 'warning', FALSE);
END
$$;

-- Insert sample user preferences
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@arabinsights.com';
  
  -- Insert sample preferences
  INSERT INTO user_preferences (user_id, dashboard_layout, notification_settings, analysis_preferences)
  VALUES
    (admin_user_id, 
     '{"theme": "default", "language": "ar"}', 
     '{"email": true, "push": true, "in_app": true}', 
     '{"auto_save": true, "real_time": false}');
END
$$;

-- Insert sample analysis settings
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@arabinsights.com';
  
  -- Insert sample analysis settings
  INSERT INTO analysis_settings (user_id, accuracy_level, dialect_detection_enabled, auto_categorization, sentiment_threshold)
  VALUES
    (admin_user_id, 'advanced', TRUE, TRUE, 0.7);
END
$$;