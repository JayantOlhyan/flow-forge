import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Briefcase, Building2, Check, Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const JOB_TITLES = [
  { id: "sales", label: "Sales & Business Dev", icon: "target" },
  { id: "finance", label: "Finance & Accounting", icon: "credit-card" },
  { id: "hr", label: "HR & People Ops", icon: "users" },
  { id: "marketing", label: "Marketing & Growth", icon: "bar-chart" },
  { id: "operations", label: "Operations & Admin", icon: "settings" },
  { id: "engineering", label: "Engineering & Dev", icon: "code" },
  { id: "founder", label: "Founder & Executive", icon: "briefcase" },
  { id: "other", label: "Other", icon: "plus" },
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Retail", "Education",
  "Marketing Agency", "Consulting", "Real Estate", "Manufacturing", "Other"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, token, updateUser, API } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!jobTitle || !industry) { toast.error("Please select both"); return; }
    setSaving(true);
    try {
      await axios.put(`${API}/auth/onboard`, { job_title: jobTitle, industry }, { headers: { Authorization: `Bearer ${token}` } });
      updateUser({ job_title: jobTitle, industry, onboarded: true });
      setStep(2);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8" data-testid="onboarding-success">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>You're all set!</h1>
          <p className="text-sm text-slate-500 mb-2">Welcome, {user?.name}. You're ready to automate.</p>
          <p className="text-xs text-slate-400 mb-8">We've tailored templates for {jobTitle} in {industry}.</p>
          <Button onClick={() => navigate("/dashboard")} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md px-8 h-11 text-sm" data-testid="onboarding-go-dashboard-btn">
            Go to Command Center <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8" data-testid="onboarding-page">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ fontFamily: 'Manrope' }}>Flow-Forge</span>
          </div>
          <div className="flex-1" />
          <span className="text-xs text-slate-400">Step {step + 1} of 2</span>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full ${step >= 0 ? 'bg-[#0066FF]' : 'bg-slate-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#0066FF]' : 'bg-slate-200'}`} />
        </div>

        {step === 0 && (
          <div className="stagger-in" data-testid="onboarding-step-role">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-[#0066FF]" />
              <span className="text-xs font-medium text-[#0066FF] uppercase tracking-wide">Your role</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }}>What do you do?</h1>
            <p className="text-sm text-slate-500 mb-8">This helps us recommend the right automations.</p>
            <div className="grid grid-cols-2 gap-3">
              {JOB_TITLES.map(j => (
                <button
                  key={j.id}
                  onClick={() => { setJobTitle(j.label); setStep(1); }}
                  className={`p-4 rounded-xl border text-left transition-colors hover:border-blue-200 ${
                    jobTitle === j.label ? 'border-[#0066FF] bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                  data-testid={`onboarding-role-${j.id}`}
                >
                  <span className="text-sm font-medium text-slate-900">{j.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="stagger-in" data-testid="onboarding-step-industry">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-[#0066FF]" />
              <span className="text-xs font-medium text-[#0066FF] uppercase tracking-wide">Your industry</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }}>Which industry?</h1>
            <p className="text-sm text-slate-500 mb-8">We'll customize templates for your workflow.</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`p-4 rounded-xl border text-left transition-colors hover:border-blue-200 ${
                    industry === ind ? 'border-[#0066FF] bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                  data-testid={`onboarding-industry-${ind.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="text-sm font-medium text-slate-900">{ind}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="h-10 px-6 text-sm border-slate-200" data-testid="onboarding-back-btn">Back</Button>
              <Button onClick={handleComplete} disabled={!industry || saving} className="flex-1 h-10 bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm rounded-md" data-testid="onboarding-complete-btn">
                {saving ? "Setting up..." : "Complete setup"} <Sparkles className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
