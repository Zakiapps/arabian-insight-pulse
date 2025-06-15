
-- Create table for storing Hugging Face configuration. Only admins should have access.
CREATE TABLE public.huggingface_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arabert_url TEXT,
  arabert_token TEXT,
  mt5_url TEXT,
  mt5_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for the table
ALTER TABLE public.huggingface_configs ENABLE ROW LEVEL SECURITY;

-- Allow only admins to SELECT, INSERT, UPDATE, DELETE on huggingface_configs
CREATE POLICY "Admins can manage huggingface_configs" ON public.huggingface_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

