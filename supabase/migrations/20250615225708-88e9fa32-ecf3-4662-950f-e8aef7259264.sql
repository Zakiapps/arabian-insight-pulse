
-- Fix numeric field overflow issues by adjusting column types
-- Update text_analyses table to handle larger numeric ranges
ALTER TABLE public.text_analyses 
ALTER COLUMN sentiment_score TYPE numeric(5,4),
ALTER COLUMN dialect_confidence TYPE numeric(5,2);

-- Update scraped_news table to handle larger numeric ranges  
ALTER TABLE public.scraped_news
ALTER COLUMN dialect_confidence TYPE numeric(5,2);

-- Add constraints to prevent overflow
ALTER TABLE public.text_analyses 
ADD CONSTRAINT sentiment_score_range CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
ADD CONSTRAINT dialect_confidence_range CHECK (dialect_confidence >= 0 AND dialect_confidence <= 100);

ALTER TABLE public.scraped_news
ADD CONSTRAINT dialect_confidence_range CHECK (dialect_confidence >= 0 AND dialect_confidence <= 100);
