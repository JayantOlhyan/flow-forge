import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success("Welcome back!");
      navigate(data.user.onboarded ? "/dashboard" : "/onboarding");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex" data-testid="login-page">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 items-center justify-center p-16">
        <div className="max-w-md">
          <div className="w-12 h-12 bg-[#0066FF] rounded-xl flex items-center justify-center mb-8">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Manrope' }}>
            Automate the boring stuff
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Flow-Forge connects your tools and eliminates repetitive work. If you can write an email, you can build an automation.
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-[#0066FF]" /></div>
              Setup in 60 seconds
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-[#0066FF]" /></div>
              No coding required
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-[#0066FF]" /></div>
              Cancel anytime
            </div>
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

          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Manrope' }} data-testid="login-heading">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">Log in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="email" className="text-sm text-slate-700 mb-1.5 block">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="h-10" data-testid="login-email-input" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm text-slate-700 mb-1.5 block">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="h-10" data-testid="login-password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-10 bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm rounded-md" data-testid="login-submit-btn">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#0066FF] hover:underline font-medium" data-testid="login-to-register-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
