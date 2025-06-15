
-- Drop NewsAPI configuration table (removes all NewsAPI configs)
DROP TABLE IF EXISTS public.news_configs CASCADE;

-- Optionally drop uploads created by NewsAPI scraper
-- Commented out for safety, uncomment if you want to delete ALL uploads created by NewsAPI:
-- DELETE FROM uploads WHERE source = 'newsapi';
