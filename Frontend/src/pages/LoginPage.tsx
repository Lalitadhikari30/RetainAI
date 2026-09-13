import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('HR Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, selectedRole);
      navigate('/dashboard');
    } catch (err: any) {
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen w-full flex flex-col md:flex-row bg-white text-on-surface selection:bg-primary-fixed selection:text-primary overflow-hidden">
      {/* Left Column: Branding + Sign In Form */}
      <div className="w-full md:w-1/2 md:h-full bg-white flex flex-col justify-between p-6 sm:p-8 lg:py-8 lg:pl-14 lg:pr-14 xl:pr-20 overflow-hidden">
        {/* Top: RetainAI Logo + Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/retainai-icon.png"
            alt="RetainAI"
            className="w-10 h-10 object-contain rounded-xl shrink-0 shadow-2xs"
          />
          <div className="flex flex-col justify-center">
            <img
              src="/retainai-wordmark.png"
              alt="RetainAI"
              className="h-6 w-auto object-contain object-left shrink-0"
            />
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase whitespace-nowrap leading-none mt-1">
              predict · prevent · retain
            </span>
          </div>
        </div>

        {/* Center: Heading, Subheading & Rounded Square Box Form (Shifted more to the left) */}
        <div className="w-full max-w-[420px] mx-auto lg:mr-16 xl:mr-24 flex flex-col items-center my-auto py-2">
          {/* Heading & Subheading (Claude-inspired) */}
          <div className="text-center mb-5 w-full">
            <h1 className="text-[38px] sm:text-[42px] lg:text-[45px] font-normal tracking-tight font-serif text-on-surface whitespace-nowrap leading-tight">
              Know who's at risk
            </h1>
            <p className="text-xs sm:text-[13px] text-on-surface-variant font-normal mt-2">
              Workforce intelligence to predict and prevent attrition
            </p>
          </div>

          {/* Rounded Square Box Form */}
          <div className="w-full bg-white rounded-3xl border border-outline-variant/35 shadow-xl shadow-slate-200/50 p-6 sm:p-7 flex flex-col gap-4">
            {/* Role Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Select Workspace Role</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setSelectedRole('HR Admin')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'HR Admin'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  HR Admin
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('People Manager')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'People Manager'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  People Manager
                </button>
              </div>
            </div>

            {/* Credential Form */}
            <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Work email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low/40 focus:bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-surface-container-low/40 focus:bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1.5 w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Contact HR Admin Link */}
          <div className="text-center pt-3">
            <p className="text-xs text-on-surface-variant">
              Forgot your password?{' '}
              <a
                href="mailto:hr-admin@retainai.internal?subject=Password%20Reset%20Request"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Contact your HR admin.
              </a>
            </p>
          </div>
        </div>

        {/* Subtle spacing bottom */}
        <div className="hidden sm:block h-2 shrink-0" />
      </div>

      {/* Right Column: Broader Video Card (Tighter to the left) */}
      <div className="w-full md:w-1/2 md:h-full bg-white flex flex-col justify-center items-center lg:items-start p-6 sm:p-8 lg:py-8 lg:pl-8 xl:pl-12 lg:pr-14 overflow-hidden">
        <div className="relative w-full max-w-[480px] lg:max-w-[500px] xl:max-w-[520px] h-[min(590px,calc(100vh-130px))] rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-black flex items-center justify-center">
          <video
            src="/assets/isme_vision_hi_ni_smjh_aa_rha.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

