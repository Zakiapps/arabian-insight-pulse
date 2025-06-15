
-- Add missing columns to text_analyses table
ALTER TABLE public.text_analyses 
ADD COLUMN IF NOT EXISTS emotion text,
ADD COLUMN IF NOT EXISTS dialect_indicators text[],
ADD COLUMN IF NOT EXISTS emotional_markers text[];

-- Add missing columns to scraped_news table  
ALTER TABLE public.scraped_news
ADD COLUMN IF NOT EXISTS emotion text,
ADD COLUMN IF NOT EXISTS dialect text,
ADD COLUMN IF NOT EXISTS dialect_confidence numeric,
ADD COLUMN IF NOT EXISTS dialect_indicators text[],
ADD COLUMN IF NOT EXISTS emotional_markers text[];

-- Update existing records to have default values for new columns
UPDATE public.text_analyses 
SET 
  emotion = 'محايد',
  dialect_indicators = ARRAY[]::text[],
  emotional_markers = ARRAY[]::text[]
WHERE emotion IS NULL;

UPDATE public.scraped_news 
SET 
  emotion = 'محايد',
  dialect = 'other',
  dialect_confidence = 0,
  dialect_indicators = ARRAY[]::text[],
  emotional_markers = ARRAY[]::text[]
WHERE emotion IS NULL;
