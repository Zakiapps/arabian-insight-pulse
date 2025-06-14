/*
  # Seed Data

  1. New Data
    - Admin user
    - Sample projects
    - Sample configurations
    - Sample uploads and analyses

  2. Security
    - Secure password for admin user
    - Appropriate data for demonstration
*/

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
    
    -- Create sample project for admin
    INSERT INTO projects (user_id, name, description)
    VALUES (admin_user_id, 'Demo Project', 'A demonstration project with sample data');
  END IF;
END
$$;

-- Insert sample data if admin exists
DO $$
DECLARE
  admin_user_id UUID;
  demo_project_id UUID;
  upload_id UUID;
  analysis_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@arabinsights.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Get or create demo project
    SELECT id INTO demo_project_id
    FROM projects
    WHERE user_id = admin_user_id AND name = 'Demo Project';
    
    IF demo_project_id IS NULL THEN
      INSERT INTO projects (user_id, name, description)
      VALUES (admin_user_id, 'Demo Project', 'A demonstration project with sample data')
      RETURNING id INTO demo_project_id;
    END IF;
    
    -- Insert sample BrightData config if not exists
    IF NOT EXISTS (SELECT 1 FROM brightdata_configs WHERE project_id = demo_project_id) THEN
      INSERT INTO brightdata_configs (project_id, token, rules)
      VALUES (
        demo_project_id,
        'sample_token_123',
        '{
          "platforms": ["twitter", "facebook"],
          "keywords": ["الأردن", "عمان", "الاقتصاد"],
          "limit": 100
        }'
      );
    END IF;
    
    -- Insert sample NewsAPI config if not exists
    IF NOT EXISTS (SELECT 1 FROM news_configs WHERE project_id = demo_project_id) THEN
      INSERT INTO news_configs (project_id, api_key, sources, keywords)
      VALUES (
        demo_project_id,
        '482cb9523dff462ebd58db6177d3af91',
        ARRAY['aljazeera', 'bbc-arabic', 'cnn-arabic'],
        ARRAY['الأردن', 'عمان', 'الاقتصاد']
      );
    END IF;
    
    -- Insert sample uploads and analyses
    IF NOT EXISTS (SELECT 1 FROM uploads WHERE project_id = demo_project_id) THEN
      -- Sample upload 1
      INSERT INTO uploads (project_id, source, raw_text, metadata)
      VALUES (
        demo_project_id,
        'twitter',
        'هذا المنتج رائع جداً، أنصح الجميع بتجربته!',
        '{"author": "user123", "location": "Amman, Jordan", "timestamp": "2025-06-01T12:00:00Z"}'
      )
      RETURNING id INTO upload_id;
      
      -- Analysis for upload 1
      INSERT INTO analyses (upload_id, sentiment, sentiment_score, dialect, dialect_confidence, model_response)
      VALUES (
        upload_id,
        'positive',
        0.92,
        'jordanian',
        0.85,
        '{"positive": 0.92, "negative": 0.08, "dialect_details": {"jordanian": 0.85, "egyptian": 0.10, "levantine": 0.05}}'
      )
      RETURNING id INTO analysis_id;
      
      -- Summary for analysis 1
      INSERT INTO summaries (analysis_id, summary_text, model_used)
      VALUES (
        analysis_id,
        'تعليق إيجابي للغاية حول منتج ما، مع توصية قوية للآخرين بتجربته.',
        'mT5_multilingual_XLSum'
      );
      
      -- Forecast for analysis 1
      INSERT INTO forecasts (analysis_id, forecast_json, forecast_period)
      VALUES (
        analysis_id,
        '{
          "dates": ["2025-06-01", "2025-06-02", "2025-06-03"],
          "values": [0.92, 0.93, 0.94],
          "confidence_intervals": [[0.85, 0.98], [0.86, 0.99], [0.87, 1.0]]
        }',
        'daily'
      );
      
      -- Sample upload 2
      INSERT INTO uploads (project_id, source, raw_text, metadata)
      VALUES (
        demo_project_id,
        'newsapi',
        'أظهرت المؤشرات الاقتصادية الأخيرة تراجعاً في معدلات النمو في الأردن خلال الربع الأول من العام الحالي.',
        '{"source": "aljazeera", "author": "Economic Reporter", "published_at": "2025-06-02T10:30:00Z"}'
      )
      RETURNING id INTO upload_id;
      
      -- Analysis for upload 2
      INSERT INTO analyses (upload_id, sentiment, sentiment_score, dialect, dialect_confidence, model_response)
      VALUES (
        upload_id,
        'negative',
        0.78,
        'standard_arabic',
        0.92,
        '{"positive": 0.22, "negative": 0.78, "dialect_details": {"standard_arabic": 0.92, "jordanian": 0.05, "levantine": 0.03}}'
      )
      RETURNING id INTO analysis_id;
      
      -- Summary for analysis 2
      INSERT INTO summaries (analysis_id, summary_text, model_used)
      VALUES (
        analysis_id,
        'تقرير اقتصادي يشير إلى تراجع في معدلات النمو الاقتصادي في الأردن خلال الربع الأول من العام.',
        'mT5_multilingual_XLSum'
      );
      
      -- Forecast for analysis 2
      INSERT INTO forecasts (analysis_id, forecast_json, forecast_period)
      VALUES (
        analysis_id,
        '{
          "dates": ["2025-06-02", "2025-06-03", "2025-06-04"],
          "values": [0.78, 0.75, 0.72],
          "confidence_intervals": [[0.70, 0.85], [0.68, 0.82], [0.65, 0.80]]
        }',
        'daily'
      );
    END IF;
    
    -- Insert sample function logs
    IF NOT EXISTS (SELECT 1 FROM function_logs LIMIT 1) THEN
      INSERT INTO function_logs (function_name, status, execution_time, request_payload, response_payload)
      VALUES
        ('analyze-text', 'success', 245.6, '{"text": "هذا المنتج رائع جداً"}', '{"sentiment": "positive", "score": 0.92}'),
        ('scrape-twitter', 'success', 1250.3, '{"keywords": ["الأردن", "عمان"]}', '{"count": 50, "status": "completed"}'),
        ('generate-summary', 'success', 320.1, '{"text": "أظهرت المؤشرات الاقتصادية..."}', '{"summary": "تقرير اقتصادي يشير إلى تراجع..."}'),
        ('forecast-sentiment', 'error', 150.2, '{"project_id": "123"}', NULL),
        ('scrape-news', 'success', 890.5, '{"sources": ["aljazeera"]}', '{"count": 25, "status": "completed"}');
    END IF;
    
    -- Insert user preferences for admin
    IF NOT EXISTS (SELECT 1 FROM user_preferences WHERE user_id = admin_user_id) THEN
      INSERT INTO user_preferences (user_id, language, theme, notification_settings, dashboard_layout)
      VALUES (
        admin_user_id,
        'ar',
        'light',
        '{"email": true, "in_app": true}',
        '{
          "widgets": [
            {"id": "sentiment_chart", "position": {"x": 0, "y": 0, "w": 6, "h": 4}},
            {"id": "recent_uploads", "position": {"x": 6, "y": 0, "w": 6, "h": 4}},
            {"id": "dialect_distribution", "position": {"x": 0, "y": 4, "w": 6, "h": 4}},
            {"id": "forecast_chart", "position": {"x": 6, "y": 4, "w": 6, "h": 4}}
          ]
        }'
      );
    END IF;
  END IF;
END
$$;