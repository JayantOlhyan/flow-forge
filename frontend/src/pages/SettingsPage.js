import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Settings, User, Shield, Bell, Zap } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" data-testid="settings-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors" data-testid="settings-back-btn">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0066FF]" />
            <span className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <section className="mb-10" data-testid="profile-section">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#0066FF]" />
            <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>Profile</h2>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-lg font-semibold text-slate-600" style={{ fontFamily: 'Manrope' }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                {user?.job_title && <p className="text-xs text-slate-400 mt-0.5">{user.job_title} · {user.industry}</p>}
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block">Full Name</Label>
                <Input value={user?.name || ""} disabled className="h-9 text-sm bg-slate-50" data-testid="settings-name-input" />
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block">Email</Label>
                <Input value={user?.email || ""} disabled className="h-9 text-sm bg-slate-50" data-testid="settings-email-input" />
              </div>
            </div>
          </div>
        </section>

        {/* Plan Section */}
        <section className="mb-10" data-testid="plan-section">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#0066FF]" />
            <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>Plan</h2>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">Starter (Free)</span>
                  <span className="text-xs bg-blue-50 text-[#0066FF] font-medium px-2 py-0.5 rounded-full">Current</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">5 automations · 100 tasks/month</p>
              </div>
              <Button variant="outline" className="h-8 px-4 text-xs border-slate-200" data-testid="upgrade-plan-btn">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="mb-10" data-testid="security-section">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#0066FF]" />
            <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>Security</h2>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-900">AES-256 Encryption</p>
                <p className="text-xs text-slate-400">All data encrypted at rest and in transit</p>
              </div>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-900">SOC 2 Compliance</p>
                <p className="text-xs text-slate-400">Enterprise-grade security standards</p>
              </div>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Compliant</span>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section data-testid="danger-section">
          <Button onClick={logout} variant="outline" className="h-9 px-5 text-sm text-red-600 border-red-200 hover:bg-red-50" data-testid="logout-btn">
            Log out
          </Button>
        </section>
      </main>
    </div>
  );
}
