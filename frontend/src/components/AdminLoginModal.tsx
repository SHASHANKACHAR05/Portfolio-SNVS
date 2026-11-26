import React, { useState } from 'react';
import { X, Lock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { adminLogin } from '../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, userName: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('admin@portfolio.local');
  const [password, setPassword] = useState('Admin@Bharath2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await adminLogin(email, password);
      onSuccess(res.access_token, res.full_name);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#121410]/55 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className="bg-white text-[#121410] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/25 shadow-2xl p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/70 hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-[#e7efcf] border border-[#4d6a10]/25 text-[#4d6a10]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-[#121410]">
              Admin Control Center
            </h3>
            <p className="text-[11px] font-mono text-[#4d6a10] font-semibold">
              FastAPI JWT Authentication
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-mono text-[10px] font-bold text-[#4d6a10] mb-1 uppercase tracking-wider">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold text-[#4d6a10] mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#fafcf7] border border-[#4d6a10]/20 text-[11px] text-[#121410]/70 space-y-1">
            <span className="font-semibold block text-[#121410] font-mono">
              Pre-configured Admin Credentials:
            </span>
            <div className="font-mono text-[11px]">
              Email: <span className="text-[#4d6a10] font-bold">admin@portfolio.local</span><br />
              Password: <span className="text-[#4d6a10] font-bold">Admin@Bharath2026</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-[#4d6a10] hover:bg-[#3f590d] text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>Sign In to Admin Portal</span>
          </button>
        </form>
      </div>
    </div>
  );
};
