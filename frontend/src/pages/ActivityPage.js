import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Zap, ArrowLeft, Clock, Activity, Sparkles, Loader2,
  CheckCircle2, AlertCircle, PauseCircle, Trash2, Power
} from "lucide-react";
import axios from "axios";

const ACTION_ICONS = {
  automation_created: { icon: Sparkles, color: "text-[#0066FF]", bg: "bg-blue-50" },
  automation_toggled: { icon: Power, color: "text-amber-600", bg: "bg-amber-50" },
  automation_deleted: { icon: Trash2, color: "text-red-500", bg: "bg-red-50" },
  onboarding_complete: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ai_suggestion: { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
};

export default function ActivityPage() {
  const { token, API } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    axios.get(`${API}/activity`, { headers: headers() })
      .then(res => { setLogs(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [API, headers]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-white" data-testid="activity-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors" data-testid="activity-back-btn">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0066FF]" />
            <span className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>Activity Log</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-sm text-slate-500 mb-8">Every action, timestamped and reversible.</p>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-xl" data-testid="empty-activity">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-5 h-5 text-slate-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }}>No activity yet</h3>
            <p className="text-xs text-slate-400">Actions will appear here as you use Flow-Forge.</p>
          </div>
        ) : (
          <div className="space-y-1 stagger-in" data-testid="activity-list">
            {logs.map(log => {
              const actionStyle = ACTION_ICONS[log.action] || { icon: Activity, color: "text-slate-500", bg: "bg-slate-50" };
              const IconComp = actionStyle.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors" data-testid={`activity-item-${log.id}`}>
                  <div className={`w-8 h-8 rounded-lg ${actionStyle.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <IconComp className={`w-3.5 h-3.5 ${actionStyle.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">{log.detail}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatTime(log.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
