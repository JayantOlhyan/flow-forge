import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error("Please fill in all fields"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created!");
      navigate("/onboarding");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex" data-testid="register-page">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 items-center justify-center p-16">
        <div className="max-w-md">
          <div className="w-12 h-12 bg-[#0066FF] rounded-xl flex items-center justify-center mb-8">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Manrope' }}>
            Start automating today
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Join thousands of professionals who've reclaimed their time with Flow-Forge. Your first automation is 60 seconds away.
          </p>
          <div className="mt-10 p-5 rounded-xl border border-slate-200 bg-white">
            <p className="text-sm text-slate-600 italic">"Flow-Forge saved our 3-person agency 15 hours a week. That's $30K/year in productivity."</p>
            <p className="text-xs text-slate-400 mt-3">— Sarah K., Agency Owner</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg" style={{ fontFamily: 'Manrope' }}>Flow-Forge</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }} data-testid="register-heading">Create your account</h1>
          <p className="text-sm text-slate-500 mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            <div>
              <Label htmlFor="name" className="text-sm text-slate-700 mb-1.5 block">Full name</Label>
              <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" className="h-10" data-testid="register-name-input" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm text-slate-700 mb-1.5 block">Work email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="h-10" data-testid="register-email-input" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm text-slate-700 mb-1.5 block">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-10" data-testid="register-password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-10 bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm rounded-md" data-testid="register-submit-btn">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0066FF] hover:underline font-medium" data-testid="register-to-login-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
