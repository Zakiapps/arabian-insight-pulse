
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type LogEntry = {
  id: number;
  created_at: string;
  model?: string;
  url: string;
  ok: boolean;
  message?: string;
  status?: number;
  error?: string;
};

const fetchLogs = async (): Promise<LogEntry[]> => {
  try {
    const res = await fetch("/rest/v1/huggingface_connection_logs?order=created_at.desc&limit=50", {
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "", "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to fetch logs");
    return await res.json();
  } catch (err) {
    return [];
  }
};

const HuggingFaceLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Hugging Face Connection Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left">Time</th>
                  <th className="py-2 px-3 text-left">URL</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Message/Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted-foreground">No logs yet.</td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className={log.ok ? "bg-green-50" : "bg-red-50"}>
                    <td className="py-2 px-3">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs break-all">{log.url}</td>
                    <td className="py-2 px-3">
                      {log.ok ? (
                        <span className="text-green-600 font-semibold">Success</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Fail</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs">{log.message || log.error || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HuggingFaceLogs;
