import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap, ArrowLeft, ArrowRight, Plus, Search, Sparkles,
  Mail, FileText, Users, BarChart3, Package, MessageSquare,
  CreditCard, Share2, Clipboard, Calendar, Target, Clock,
  ChevronDown, GripVertical, Trash2, Check, Loader2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const ICON_MAP = {
  "mail": Mail, "file-text": FileText, "users": Users, "bar-chart": BarChart3,
  "package": Package, "message-square": MessageSquare, "credit-card": CreditCard,
  "share-2": Share2, "clipboard": Clipboard, "calendar": Calendar,
  "target": Target, "clock": Clock,
};

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "sales", label: "Sales" },
  { id: "finance", label: "Finance" },
  { id: "hr", label: "HR" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operations" },
];

const TRIGGER_OPTIONS = [
  "New email received", "File uploaded to Drive", "New form submission",
  "Scheduled (daily/weekly)", "Webhook triggered", "New row in spreadsheet",
  "Calendar event created", "Slack message received",
];

const ACTION_OPTIONS = [
  "Send email notification", "Create spreadsheet row", "Post to Slack channel",
  "Update CRM record", "Generate report", "Create task in project tool",
  "Upload file to Drive", "Send SMS notification",
];

export default function BuilderPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { token, API } = useAuth();
  const [activeTab, setActiveTab] = useState(templateId ? "guided" : "templates");
  const [templates, setTemplates] = useState([]);
  const [filterCat, setFilterCat] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Guided builder state
  const [flowName, setFlowName] = useState("");
  const [flowNodes, setFlowNodes] = useState([
    { id: 1, type: "trigger", label: "When this happens...", value: "" },
    { id: 2, type: "action", label: "Do this...", value: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    axios.get(`${API}/templates`).then(res => {
      setTemplates(res.data);
      if (templateId) {
        const t = res.data.find(t => t.id === templateId);
        if (t) {
          setFlowName(t.name);
          setFlowNodes([
            { id: 1, type: "trigger", label: "When this happens...", value: t.trigger },
            { id: 2, type: "action", label: "Do this...", value: t.action },
          ]);
          setActiveTab("guided");
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [API, templateId]);

  const filteredTemplates = templates.filter(t => {
    const catMatch = filterCat === "all" || t.category === filterCat;
    const searchMatch = !searchQ || t.name.toLowerCase().includes(searchQ.toLowerCase());
    return catMatch && searchMatch;
  });

  const activateTemplate = async (template) => {
    try {
      await axios.post(`${API}/automations`, {
        name: template.name, description: template.description,
        template_id: template.id, category: template.category,
        trigger: template.trigger, action: template.action,
      }, { headers: headers() });
      toast.success(`"${template.name}" activated!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to activate template");
    }
  };

  const addNode = () => {
    const newId = Math.max(...flowNodes.map(n => n.id)) + 1;
    setFlowNodes(prev => [...prev, { id: newId, type: "action", label: "Then do this...", value: "" }]);
  };

  const removeNode = (id) => {
    if (flowNodes.length <= 2) return;
    setFlowNodes(prev => prev.filter(n => n.id !== id));
  };

  const updateNode = (id, value) => {
    setFlowNodes(prev => prev.map(n => n.id === id ? { ...n, value } : n));
  };

  const saveFlow = async () => {
    if (!flowName.trim()) { toast.error("Please name your automation"); return; }
    const trigger = flowNodes.find(n => n.type === "trigger")?.value;
    const actions = flowNodes.filter(n => n.type === "action").map(n => n.value).filter(Boolean);
    if (!trigger) { toast.error("Please set a trigger"); return; }
    if (actions.length === 0) { toast.error("Please add at least one action"); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/automations`, {
        name: flowName, description: `${trigger} → ${actions.join(' → ')}`,
        trigger, action: actions.join(', '), category: "custom",
        nodes: flowNodes.map(n => ({ type: n.type, value: n.value })),
      }, { headers: headers() });
      toast.success("Automation created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to save automation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="builder-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors" data-testid="builder-back-btn">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <span className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>Automation Builder</span>
          </div>
          {activeTab === "guided" && (
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-8 px-4 text-xs border-slate-200" data-testid="builder-test-btn">Test</Button>
              <Button onClick={saveFlow} disabled={saving} className="h-8 px-4 text-xs bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md" data-testid="builder-save-btn">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3 h-3 mr-1" /> Save & Activate</>}
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-50 border border-slate-200 mb-8" data-testid="builder-tabs">
            <TabsTrigger value="templates" className="text-xs data-[state=active]:bg-white" data-testid="tab-templates">Quick Start Templates</TabsTrigger>
            <TabsTrigger value="guided" className="text-xs data-[state=active]:bg-white" data-testid="tab-guided">Guided Builder</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" data-testid="templates-tab-content">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setFilterCat(c.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filterCat === c.id ? 'bg-[#0066FF] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                    data-testid={`filter-${c.id}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search templates..." className="pl-9 h-8 text-sm w-56" data-testid="template-search-input" />
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in" data-testid="template-grid">
                {filteredTemplates.map(t => {
                  const IconComp = ICON_MAP[t.icon] || Zap;
                  return (
                    <div key={t.id} className="group p-5 border border-slate-200 bg-white rounded-xl hover:border-blue-200 transition-colors" data-testid={`template-card-${t.id}`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                          <IconComp className="w-4 h-4 text-slate-500 group-hover:text-[#0066FF] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-[#0066FF] uppercase tracking-wide">{t.category}</span>
                          <h3 className="text-sm font-medium text-slate-900 mt-0.5 truncate" style={{ fontFamily: 'Manrope' }}>{t.name}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{t.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400"><Clock className="w-3 h-3 inline mr-1" />Saves ~{t.time_saved}min/week</span>
                        <Button size="sm" onClick={() => useTemplate(t)} className="h-7 px-3 text-xs bg-[#0066FF] hover:bg-[#0052CC] text-white rounded" data-testid={`use-template-${t.id}`}>
                          Use this <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Guided Builder Tab */}
          <TabsContent value="guided" data-testid="guided-tab-content">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <label className="text-xs text-slate-500 font-medium mb-2 block">Automation Name</label>
                <Input
                  value={flowName}
                  onChange={e => setFlowName(e.target.value)}
                  placeholder="e.g., Weekly Sales Report to Slack"
                  className="h-10 text-sm"
                  data-testid="flow-name-input"
                />
              </div>

              {/* Visual Flow */}
              <div className="relative" data-testid="flow-canvas">
                {flowNodes.map((node, idx) => (
                  <div key={node.id}>
                    <div className="node-card flex items-center gap-3 p-4 border border-slate-200 bg-white rounded-lg" data-testid={`flow-node-${node.id}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        node.type === 'trigger' ? 'bg-amber-50' : 'bg-blue-50'
                      }`}>
                        {node.type === 'trigger' ? <Zap className="w-4 h-4 text-amber-600" /> : <ArrowRight className="w-4 h-4 text-[#0066FF]" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                          {node.type === 'trigger' ? 'When' : `Then (Step ${idx})`}
                        </span>
                        <select
                          value={node.value}
                          onChange={e => updateNode(node.id, e.target.value)}
                          className="w-full mt-1 text-sm text-slate-900 bg-transparent border-none outline-none cursor-pointer p-0"
                          data-testid={`node-select-${node.id}`}
                        >
                          <option value="">{node.label}</option>
                          {(node.type === 'trigger' ? TRIGGER_OPTIONS : ACTION_OPTIONS).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      {flowNodes.length > 2 && node.type !== 'trigger' && (
                        <button onClick={() => removeNode(node.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" data-testid={`remove-node-${node.id}`}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                    {idx < flowNodes.length - 1 && (
                      <div className="connector-line" />
                    )}
                  </div>
                ))}

                {/* Add step button */}
                <div className="connector-line" />
                <button
                  onClick={addNode}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 hover:text-[#0066FF] hover:border-blue-200 transition-colors w-full justify-center"
                  data-testid="add-step-btn"
                >
                  <Plus className="w-3.5 h-3.5" /> Add another step
                </button>
              </div>

              {/* Save button at bottom */}
              <div className="mt-8 flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="h-10 px-6 text-sm border-slate-200" data-testid="builder-cancel-btn">Cancel</Button>
                <Button onClick={saveFlow} disabled={saving} className="h-10 px-6 text-sm bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md" data-testid="builder-save-bottom-btn">
                  {saving ? "Saving..." : "Save & Activate"} <Check className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
