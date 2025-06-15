
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HuggingFaceConfig {
  id?: string;
  arabert_url?: string;
  arabert_token?: string;
  mt5_url?: string;
  mt5_token?: string;
  created_at?: string;
  updated_at?: string;
}

export function useHuggingFaceConfig() {
  const [config, setConfig] = useState<HuggingFaceConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from("huggingface_configs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (dbError) {
      setError("Error loading Hugging Face configuration.");
      setConfig(null);
    } else if (data) {
      setConfig(data);
    } else {
      setConfig(null);
    }
    setLoading(false);
  }, []);

  const upsertConfig = useCallback(async (newConfig: Partial<HuggingFaceConfig>) => {
    setLoading(true);
    setError(null);
    let result;
    if (config?.id) {
      // Update the existing config
      result = await supabase
        .from("huggingface_configs")
        .update({ ...newConfig, updated_at: new Date().toISOString() })
        .eq("id", config.id)
        .select()
        .maybeSingle();
    } else {
      // Insert a new config
      result = await supabase
        .from("huggingface_configs")
        .insert([{ ...newConfig, created_at: new Date().toISOString() }])
        .select()
        .maybeSingle();
    }

    if (result.error) {
      setError("Error saving Hugging Face configuration.");
      setLoading(false);
      throw result.error;
    }
    // Refresh config after update/insert
    await fetchConfig();
    setLoading(false);
    return result.data;
  }, [config, fetchConfig]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, fetchConfig, upsertConfig };
}
