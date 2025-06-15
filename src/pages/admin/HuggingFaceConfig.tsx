
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const apiKeysTable = "huggingface_configs";

export default function HuggingFaceConfig() {
  const { isRTL, t } = useLanguage();
  const [arabertUrl, setArabertUrl] = useState("");
  const [arabertToken, setArabertToken] = useState("");
  const [mt5Url, setMt5Url] = useState("");
  const [mt5Token, setMt5Token] = useState("");
  const [loading, setLoading] = useState(false);

  // Load initial config
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from(apiKeysTable).select("*").maybeSingle();
      if (data) {
        setArabertUrl(data.arabert_url || "");
        setArabertToken(data.arabert_token || "");
        setMt5Url(data.mt5_url || "");
        setMt5Token(data.mt5_token || "");
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Upsert config
    const config = {
      arabert_url: arabertUrl,
      arabert_token: arabertToken,
      mt5_url: mt5Url,
      mt5_token: mt5Token,
    };
    const { error } = await supabase
      .from(apiKeysTable)
      .upsert([config], { onConflict: "id" });

    if (error) {
      toast.error(isRTL ? "خطأ في حفظ الإعدادات" : "Error saving settings");
    } else {
      toast.success(isRTL ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-14 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {isRTL ? "إعدادات واجهة Hugging Face" : "Hugging Face Endpoint Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="font-semibold">{isRTL ? "رابط Arabert" : "Arabert Endpoint URL"}</label>
              <Input
                value={arabertUrl}
                onChange={e => setArabertUrl(e.target.value)}
                placeholder={isRTL ? "أدخل رابط arabert..." : "Enter arabert endpoint URL..."}
              />
            </div>
            <div>
              <label className="font-semibold">{isRTL ? "توكن Arabert" : "Arabert Token"}</label>
              <Input
                value={arabertToken}
                onChange={e => setArabertToken(e.target.value)}
                placeholder={isRTL ? "أدخل توكن arabert..." : "Enter arabert token..."}
              />
            </div>
            <div>
              <label className="font-semibold">{isRTL ? "رابط MT5" : "MT5 Endpoint URL"}</label>
              <Input
                value={mt5Url}
                onChange={e => setMt5Url(e.target.value)}
                placeholder={isRTL ? "أدخل رابط MT5..." : "Enter MT5 endpoint URL..."}
              />
            </div>
            <div>
              <label className="font-semibold">{isRTL ? "توكن MT5" : "MT5 Token"}</label>
              <Input
                value={mt5Token}
                onChange={e => setMt5Token(e.target.value)}
                placeholder={isRTL ? "أدخل توكن MT5..." : "Enter MT5 token..."}
              />
            </div>
            <Button type="submit" className="w-full py-3 font-semibold" disabled={loading}>
              {loading ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ الإعدادات" : "Save Settings")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground text-center">
        {isRTL
          ? "ادخل نقاط النهاية (Endpoints) و التوكنز لموديلات Arabert و MT5 ليتم استخدامها في التحليل."
          : "Enter the endpoint URLs and tokens for Arabert and MT5 models to be used for all AI analysis."}
      </p>
    </div>
  );
}
