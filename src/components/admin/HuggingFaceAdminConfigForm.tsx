
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHuggingFaceConfig } from "@/hooks/useHuggingFaceConfig";
import { ShieldCheck, ShieldAlert } from "lucide-react";

const testHuggingFaceConnection = async ({
  url,
  token,
}: { url: string, token: string }) => {
  try {
    const res = await fetch("/functions/v1/test-huggingface-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, token }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, message: "Request failed" };
  }
};

const HuggingFaceAdminConfigForm: React.FC = () => {
  const { isRTL } = useLanguage();
  const { config, loading, error, upsertConfig } = useHuggingFaceConfig();
  const [arabertUrl, setArabertUrl] = useState("");
  const [arabertToken, setArabertToken] = useState("");
  const [mt5Url, setMt5Url] = useState("");
  const [mt5Token, setMt5Token] = useState("");
  const [dirty, setDirty] = useState(false);

  // New: Connection test status state
  const [arabertStatus, setArabertStatus] = useState<null | "ok" | "fail" | "loading">(null);
  const [mt5Status, setMt5Status] = useState<null | "ok" | "fail" | "loading">(null);
  const [arabertMsg, setArabertMsg] = useState<string>("");
  const [mt5Msg, setMt5Msg] = useState<string>("");

  useEffect(() => {
    setArabertUrl(config?.arabert_url || "");
    setArabertToken(config?.arabert_token || "");
    setMt5Url(config?.mt5_url || "");
    setMt5Token(config?.mt5_token || "");
    setDirty(false);
    setArabertStatus(null);
    setMt5Status(null);
    setArabertMsg("");
    setMt5Msg("");
  }, [config]);

  useEffect(() => {
    setDirty(
      arabertUrl !== (config?.arabert_url || "") ||
      arabertToken !== (config?.arabert_token || "") ||
      mt5Url !== (config?.mt5_url || "") ||
      mt5Token !== (config?.mt5_token || "")
    );
  }, [arabertUrl, arabertToken, mt5Url, mt5Token, config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertConfig({
        arabert_url: arabertUrl,
        arabert_token: arabertToken,
        mt5_url: mt5Url,
        mt5_token: mt5Token,
      });
      toast.success(isRTL ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully!");
    } catch (err) {
      toast.error(isRTL ? "حدث خطأ أثناء الحفظ." : "Error while saving.");
    }
  };

  // New: Handlers for test connection
  const checkArabert = async () => {
    setArabertStatus("loading");
    setArabertMsg("");
    const res = await testHuggingFaceConnection({ url: arabertUrl, token: arabertToken });
    if (res.ok) {
      setArabertStatus("ok");
      setArabertMsg(isRTL ? "اتصال ناجح!" : "Connection successful!");
    } else {
      setArabertStatus("fail");
      setArabertMsg(res.message || (isRTL ? "فشل الاتصال!" : "Connection failed!"));
    }
  };
  const checkMt5 = async () => {
    setMt5Status("loading");
    setMt5Msg("");
    const res = await testHuggingFaceConnection({ url: mt5Url, token: mt5Token });
    if (res.ok) {
      setMt5Status("ok");
      setMt5Msg(isRTL ? "اتصال ناجح!" : "Connection successful!");
    } else {
      setMt5Status("fail");
      setMt5Msg(res.message || (isRTL ? "فشل الاتصال!" : "Connection failed!"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {isRTL ? "إعدادات واجهة Hugging Face" : "Hugging Face Endpoint Settings"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-semibold">{isRTL ? "رابط Arabert" : "Arabert Endpoint URL"}</label>
            <div className="flex gap-2 items-center">
              <Input
                value={arabertUrl}
                onChange={e => setArabertUrl(e.target.value)}
                placeholder={isRTL ? "أدخل رابط arabert..." : "Enter arabert endpoint URL..."}
                disabled={loading}
                className="flex-1"
              />
              <Button type="button" variant="secondary" disabled={!arabertUrl || loading} onClick={checkArabert}>
                {arabertStatus === "loading"
                  ? (isRTL ? "جارٍ الفحص..." : "Testing...")
                  : (isRTL ? "اختبار" : "Test")}
              </Button>
              {arabertStatus === "ok" && <ShieldCheck className="text-green-600 ml-1" />}
              {arabertStatus === "fail" && <ShieldAlert className="text-red-500 ml-1" />}
            </div>
            {arabertMsg && <div className={arabertStatus === "ok" ? "text-green-600" : "text-red-600"}>{arabertMsg}</div>}
          </div>
          <div>
            <label className="font-semibold">{isRTL ? "توكن Arabert" : "Arabert Token"}</label>
            <Input
              value={arabertToken}
              onChange={e => setArabertToken(e.target.value)}
              placeholder={isRTL ? "أدخل توكن arabert..." : "Enter arabert token..."}
              disabled={loading}
            />
          </div>
          <div>
            <label className="font-semibold">{isRTL ? "رابط MT5" : "MT5 Endpoint URL"}</label>
            <div className="flex gap-2 items-center">
              <Input
                value={mt5Url}
                onChange={e => setMt5Url(e.target.value)}
                placeholder={isRTL ? "أدخل رابط MT5..." : "Enter MT5 endpoint URL..."}
                disabled={loading}
                className="flex-1"
              />
              <Button type="button" variant="secondary" disabled={!mt5Url || loading} onClick={checkMt5}>
                {mt5Status === "loading"
                  ? (isRTL ? "جارٍ الفحص..." : "Testing...")
                  : (isRTL ? "اختبار" : "Test")}
              </Button>
              {mt5Status === "ok" && <ShieldCheck className="text-green-600 ml-1" />}
              {mt5Status === "fail" && <ShieldAlert className="text-red-500 ml-1" />}
            </div>
            {mt5Msg && <div className={mt5Status === "ok" ? "text-green-600" : "text-red-600"}>{mt5Msg}</div>}
          </div>
          <div>
            <label className="font-semibold">{isRTL ? "توكن MT5" : "MT5 Token"}</label>
            <Input
              value={mt5Token}
              onChange={e => setMt5Token(e.target.value)}
              placeholder={isRTL ? "أدخل توكن MT5..." : "Enter mt5 token..."}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full py-3 font-semibold" disabled={loading || !dirty}>
            {loading ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ الإعدادات" : "Save Settings")}
          </Button>
        </form>
        {error && <div className="text-center text-red-500 mt-6">{error}</div>}
        {!config && !loading && !error && (
          <div className="text-center text-muted-foreground mt-6">
            {isRTL
              ? "لم يتم إعداد أي نقاط نهاية بعد. يرجى تعبئة الإعدادات وحفظها."
              : "No Hugging Face endpoints are set yet. Please fill the configuration and save."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HuggingFaceAdminConfigForm;
