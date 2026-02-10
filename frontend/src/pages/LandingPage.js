import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Zap, ArrowRight, Shield, Clock, Sparkles, ChevronRight,
  BarChart3, Mail, FileText, Users, Package, MessageSquare,
  Play, Check
} from "lucide-react";
import {
  SiSlack, SiGmail, SiGoogledrive, SiDropbox, SiNotion,
  SiSalesforce, SiHubspot, SiTrello
} from "react-icons/si";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const FEATURES = [
  { icon: Zap, title: "Quick Start Templates", desc: "Pre-built automations for Sales, Finance, HR, Marketing & Ops. Click, customize, activate." },
  { icon: Sparkles, title: "AI Assistant", desc: "Describe what you want in plain English. Our AI builds the automation for you." },
  { icon: Shield, title: "Self-Healing Flows", desc: "When something breaks, Flow-Forge suggests fixes and auto-recovers silently." },
];

const STEPS = [
  { num: "01", title: "Describe your task", desc: "Tell us what repetitive work you want eliminated." },
  { num: "02", title: "Pick or build a flow", desc: "Choose a template or let AI create one from scratch." },
  { num: "03", title: "Watch it work", desc: "Activate and see your automation run in real-time." },
];

const INTEGRATIONS = [
  { icon: SiGmail, name: "Gmail" },
  { icon: SiSlack, name: "Slack" },
  { icon: SiGoogledrive, name: "Drive" },
  { icon: SiDropbox, name: "Dropbox" },
  { icon: SiNotion, name: "Notion" },
  { icon: SiSalesforce, name: "Salesforce" },
  { icon: SiHubspot, name: "HubSpot" },
  { icon: SiTrello, name: "Trello" },
];

const PRICING = [
  {
    name: "Starter", price: "Free", period: "", desc: "Feel the magic",
    features: ["5 active automations", "100 tasks/month", "Core integrations", "Community support"],
    cta: "Start Free", highlight: false,
  },
  {
    name: "Pro", price: "$19", period: "/month", desc: "For power users",
    features: ["Unlimited automations", "1,000 tasks/month", "All integrations + APIs", "AI parsing & error handling", "Priority support"],
    cta: "Start Free Trial", highlight: true,
  },
  {
    name: "Team", price: "$49", period: "/user/mo", desc: "For departments",
    features: ["Everything in Pro", "5,000 tasks/user/month", "Shared automation library", "Admin controls & analytics", "Slack/Teams notifications"],
    cta: "Contact Sales", highlight: false,
  },
];

const TEMPLATE_PREVIEWS = [
  { icon: Mail, label: "Auto-sync leads from Gmail", cat: "Sales" },
  { icon: FileText, label: "Extract invoice data from PDFs", cat: "Finance" },
  { icon: Users, label: "New employee onboarding docs", cat: "HR" },
  { icon: BarChart3, label: "Weekly report to Slack", cat: "Marketing" },
  { icon: Package, label: "Sync inventory across platforms", cat: "Ops" },
  { icon: MessageSquare, label: "Auto-respond to queries", cat: "Sales" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToApp = () => {
    if (user) navigate(user.onboarded ? "/dashboard" : "/onboarding");
    else navigate("/register");
  };

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100" data-testid="landing-navbar">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: 'Manrope' }}>Flow-Forge</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md px-5 h-9 text-sm" data-testid="go-to-dashboard-btn">
                Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} className="text-sm text-slate-600 hover:text-slate-900 h-9" data-testid="login-btn">Log in</Button>
                <Button onClick={() => navigate("/register")} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md px-5 h-9 text-sm" data-testid="get-started-btn">
                  Start Free <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6" data-testid="hero-section">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0066FF] rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Now with AI-powered automation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-[1.1]" style={{ fontFamily: 'Manrope' }}>
            Work on work<br />that <span className="text-[#0066FF]">matters</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Automate the boring stuff in 60 seconds. Connect your tools, describe what you want in plain English, and watch it happen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={goToApp} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md px-8 h-11 text-sm font-medium" data-testid="hero-cta-btn">
              Start your free trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md px-8 h-11 text-sm" data-testid="hero-demo-btn">
              <Play className="w-3.5 h-3.5 mr-2" /> See how it works
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-4">No credit card required</p>
        </div>
      </section>

      {/* Social proof / Integrations bar */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-400 mb-8 font-medium">Connects with the tools you already use</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {INTEGRATIONS.map(i => (
              <div key={i.name} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-default">
                <i.icon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">{i.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Previews */}
      <section className="py-20 px-6" data-testid="templates-preview-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>One-click templates</h2>
            <p className="text-sm text-slate-500">Pre-built automations for every team</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATE_PREVIEWS.map((t, i) => (
              <div key={i} className="group p-5 border border-slate-200 bg-white rounded-xl hover:border-blue-200 transition-colors cursor-pointer" onClick={goToApp}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <t.icon className="w-4.5 h-4.5 text-slate-500 group-hover:text-[#0066FF] transition-colors" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#0066FF] uppercase tracking-wide">{t.cat}</span>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{t.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-50/50" data-testid="features-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>Three ways to automate</h2>
            <p className="text-sm text-slate-500">Pick your speed. Templates for everyone, builder for pros.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-8 border border-slate-200 bg-white rounded-xl hover:border-blue-200 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-[#0066FF] transition-colors">
                  <f.icon className="w-5 h-5 text-[#0066FF] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6" data-testid="how-it-works-section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>Useful automation in under 2 minutes</h2>
            <p className="text-sm text-slate-500">Three steps. That's it.</p>
          </div>
          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center flex-shrink-0 text-sm font-bold text-slate-400 group-hover:border-[#0066FF] group-hover:text-[#0066FF] transition-colors" style={{ fontFamily: 'Manrope' }}>
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }}>{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-slate-50/50" data-testid="pricing-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>Simple, honest pricing</h2>
            <p className="text-sm text-slate-500">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((p, i) => (
              <div key={i} className={`p-8 rounded-xl border ${p.highlight ? 'border-[#0066FF] bg-white shadow-md relative' : 'border-slate-200 bg-white'}`} data-testid={`pricing-card-${p.name.toLowerCase()}`}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0066FF] text-white text-xs font-medium px-3 py-0.5 rounded-full">Most popular</div>}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }}>{p.name}</h3>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>{p.price}</span>
                  <span className="text-sm text-slate-400">{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={goToApp}
                  className={`w-full h-10 text-sm rounded-md ${p.highlight ? 'bg-[#0066FF] hover:bg-[#0052CC] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  data-testid={`pricing-cta-${p.name.toLowerCase()}`}
                >
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" data-testid="cta-section">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Manrope' }}>Reclaim your time</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">Join thousands of professionals who've automated the boring stuff. Your first automation is 60 seconds away.</p>
          <Button onClick={goToApp} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-md px-8 h-11 text-sm font-medium" data-testid="cta-start-btn">
            Start automating for free <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6" data-testid="landing-footer">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0066FF] rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-900" style={{ fontFamily: 'Manrope' }}>Flow-Forge</span>
          </div>
          <p className="text-xs text-slate-400">&copy; 2026 Flow-Forge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
