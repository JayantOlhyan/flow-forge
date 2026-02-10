import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Zap, Search, Plus, Clock, BarChart3, Activity, Settings,
  ChevronRight, LogOut, Sparkles, Loader2, ArrowRight,
  FileText, Mail, Users, Package, Target, CreditCard,
  Share2, Clipboard, Calendar, MessageSquare, Trash2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";

const ICON_MAP = {
  "mail": Mail, "file-text": FileText, "users": Users, "bar-chart": BarChart3,
  "package": Package, "message-square": MessageSquare, "credit-card": CreditCard,
  "share-2": Share2, "clipboard": Clipboard, "calendar": Calendar, "target": Target,
  "clock": Clock,
};

const STATUS_STYLES = {
  active: { dot: "bg-emerald-500", label: "Running" },
  paused: { dot: "bg-slate-300", label: "Paused" },
  error: { dot: "bg-red-500", label: "Needs attention" },
};

export default function DashboardPage() {
  const { user, token, logout, API } = useAuth();
  const navigate = useNavigate();
  const [automations, setAutomations] = useState([]);
  const [stats, setStats] = useState({ active_automations: 0, total_automations: 0, tasks_run: 0, hours_saved: 0, productivity_value: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = useCallback(async () => {
    try {
      const [autosRes, statsRes] = await Promise.all([
        axios.get(`${API}/automations`, { headers: headers() }),
        axios.get(`${API}/dashboard/stats`, { headers: headers() }),
      ]);
      setAutomations(autosRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API, headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAutomation = async (id) => {
    try {
      const res = await axios.put(`${API}/automations/${id}/toggle`, {}, { headers: headers() });
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: res.data.status } : a));
      toast.success(`Automation ${res.data.status}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to toggle automation");
    }
  };

  const deleteAutomation = async (id) => {
    try {
      await axios.delete(`${API}/automations/${id}`, { headers: headers() });
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast.success("Automation deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleAiSuggest = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await axios.post(`${API}/ai/suggest`, { message: aiQuery }, { headers: headers() });
      const s = res.data.suggestion;
      // Auto-create the automation
      await axios.post(`${API}/automations`, {
        name: s.name, description: s.description, trigger: s.trigger,
        action: s.action, category: s.category,
      }, { headers: headers() });
      toast.success(s.suggestion || "Automation created from your description!");
      setAiQuery("");
      fetchData();
    } catch (err) {
      toast.error("AI suggestion failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = automations.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-white" data-testid="dashboard-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-7 h-7 bg-[#0066FF] rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight" style={{ fontFamily: 'Manrope' }}>Flow-Forge</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" className="text-sm text-slate-900 font-medium h-8 px-3" onClick={() => navigate("/dashboard")} data-testid="nav-dashboard">Dashboard</Button>
              <Button variant="ghost" className="text-sm text-slate-500 h-8 px-3" onClick={() => navigate("/builder")} data-testid="nav-builder">Builder</Button>
              <Button variant="ghost" className="text-sm text-slate-500 h-8 px-3" onClick={() => navigate("/activity")} data-testid="nav-activity">Activity</Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors" data-testid="user-menu-trigger">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")} data-testid="menu-settings"><Settings className="w-3.5 h-3.5 mr-2" /> Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/activity")} data-testid="menu-activity"><Activity className="w-3.5 h-3.5 mr-2" /> Activity</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600" data-testid="menu-logout"><LogOut className="w-3.5 h-3.5 mr-2" /> Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8" data-testid="dashboard-welcome">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {stats.hours_saved > 0
              ? `You've saved ${stats.hours_saved} hours so far. Keep it up.`
              : "Let's set up your first automation."}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-in" data-testid="dashboard-stats">
          <div className="p-5 border border-slate-200 bg-white rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#0066FF]" />
              </div>
              <span className="text-xs text-slate-400 font-medium">Active Flows</span>
            </div>
            <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }} data-testid="stat-active-flows">{stats.active_automations}</p>
            <p className="text-xs text-slate-400 mt-1">of {stats.total_automations} total</p>
          </div>
          <div className="p-5 border border-slate-200 bg-white rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-400 font-medium">Tasks Run</span>
            </div>
            <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }} data-testid="stat-tasks-run">{stats.tasks_run}</p>
            <p className="text-xs text-slate-400 mt-1">this month</p>
          </div>
          <div className="p-5 border border-slate-200 bg-white rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs text-slate-400 font-medium">Time Saved</span>
            </div>
            <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }} data-testid="stat-time-saved">{stats.hours_saved}h</p>
            <p className="text-xs text-slate-400 mt-1">${stats.productivity_value} in value</p>
          </div>
        </div>

        {/* AI Assistant Input */}
        <div className="mb-8 p-5 border border-slate-200 bg-slate-50/50 rounded-xl" data-testid="ai-assistant-panel">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#0066FF]" />
            <span className="text-sm font-medium text-slate-900" style={{ fontFamily: 'Manrope' }}>AI Assistant</span>
            <span className="text-xs text-slate-400">Describe what you want to automate</span>
          </div>
          <div className="flex gap-3">
            <Input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiSuggest()}
              placeholder="e.g., Every Monday, send last week's sales data to my boss on Slack"
              className="flex-1 h-10 bg-white"
              data-testid="ai-input"
            />
            <Button onClick={handleAiSuggest} disabled={aiLoading || !aiQuery.trim()} className="bg-[#0066FF] hover:bg-[#0052CC] text-white h-10 px-5 text-sm rounded-md" data-testid="ai-submit-btn">
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Create</>}
            </Button>
          </div>
        </div>

        {/* Automations list */}
        <div data-testid="automations-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>Your Automations</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search flows..."
                  className="pl-9 h-8 text-sm w-48 bg-white"
                  data-testid="search-automations-input"
                />
              </div>
              <Button onClick={() => navigate("/builder")} className="bg-[#0066FF] hover:bg-[#0052CC] text-white h-8 px-4 text-xs rounded-md" data-testid="new-automation-btn">
                <Plus className="w-3.5 h-3.5 mr-1" /> New
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-xl" data-testid="empty-automations">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-sm font-medium text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }}>No automations yet</h3>
              <p className="text-xs text-slate-400 mb-4">Create your first one in under 60 seconds.</p>
              <Button onClick={() => navigate("/builder")} className="bg-[#0066FF] hover:bg-[#0052CC] text-white h-9 px-5 text-sm rounded-md" data-testid="empty-create-btn">
                Create your first automation <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2 stagger-in" data-testid="automations-list">
              {filtered.map(a => {
                const statusStyle = STATUS_STYLES[a.status] || STATUS_STYLES.active;
                const IconComp = ICON_MAP[a.icon] || Zap;
                return (
                  <div key={a.id} className="group flex items-center gap-4 p-4 border border-slate-200 bg-white rounded-xl hover:border-blue-100 transition-colors" data-testid={`automation-item-${a.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <IconComp className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 truncate">{a.name}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span className="text-xs text-slate-400">{statusStyle.label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{a.trigger} → {a.action}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 uppercase font-medium hidden sm:inline">{a.category}</span>
                      <Switch
                        checked={a.status === "active"}
                        onCheckedChange={() => toggleAutomation(a.id)}
                        className="data-[state=checked]:bg-[#0066FF]"
                        data-testid={`toggle-${a.id}`}
                      />
                      <button onClick={() => deleteAutomation(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 transition-opacity" data-testid={`delete-${a.id}`}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
