import React, { useState } from 'react';
import { Mail, Linkedin, Send, CheckCircle2, AlertCircle, Loader2, Copy, Check, MessageSquare } from 'lucide-react';
import { submitContact } from '../services/api';
import { Profile } from '../types';

interface ContactSectionProps {
  profile: Profile | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const contactEmail = profile?.email || 'snvsbharath@rediffmail.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submitContact({
        name,
        email,
        company,
        subject,
        message
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setCompany('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch contact request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="petalyx-scope relative py-20 md:py-24 border-b border-[#eef0ea] bg-white overflow-x-clip"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-40 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Outreach & Context (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 petalyx-pill mb-3">
                <Mail className="w-3.5 h-3.5 text-[#4d6a10]" />
                <span>Executive Inquiries &amp; Advisory</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.15]">
                Let's talk <span className="text-[#4d6a10] italic">technology &amp; impact.</span>
              </h2>
            </div>

            <p className="text-sm text-[#121410]/70 leading-relaxed">
              For product leadership, enterprise ERP and cloud modernization programs, or institutional advisory, reach out directly by email or via LinkedIn.
            </p>

            <div className="p-5 rounded-[22px] border border-[#eef0ea] bg-[#fafcf7] shadow-xs space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                Direct Contact Points
              </span>

              {/* Email Pill */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-[14px] bg-white border border-[#eef0ea]">
                <div className="flex items-center gap-2 text-xs font-mono min-w-0">
                  <Mail className="w-4 h-4 text-[#4d6a10] shrink-0" />
                  <span className="text-[#121410] select-all font-semibold truncate">{contactEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="px-3 py-1 rounded-full bg-[#e7efcf] text-[#4d6a10] hover:bg-[#b4cd52] hover:text-[#121410] text-xs font-mono font-semibold transition-colors flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3 h-3 text-[#4d6a10]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* LinkedIn Button */}
              <a
                href="https://www.linkedin.com/in/snvsbharath/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-[14px] border border-[#eef0ea] bg-white text-xs font-semibold text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] hover:bg-[#e7efcf]/30 transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <Linkedin className="w-4 h-4 text-[#4d6a10]" />
                <span>Message on LinkedIn</span>
              </a>
            </div>

            <div className="p-5 rounded-[22px] border border-[#eef0ea] bg-[#e7efcf]/40 text-xs text-[#121410]/75 space-y-1.5">
              <span className="font-bold block text-[#4d6a10] font-mono uppercase text-[11px] tracking-wider">
                Creative &amp; Personal Interests
              </span>
              <p className="leading-relaxed">
                Outside work, I write stories, scripts, and immerse myself in cinematic heritage and global film curation.
              </p>
            </div>
          </div>

          {/* Right Column: FastAPI-Powered Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-[24px] border border-[#eef0ea] bg-[#fafcf7] shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#eef0ea]">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-[#e7efcf]">
                    <MessageSquare className="w-4 h-4 text-[#4d6a10]" />
                  </span>
                  <h3 className="font-display font-bold text-base text-[#121410]">
                    Send a Direct Message
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#4d6a10] bg-[#e7efcf] border border-[#4d6a10]/15 px-2.5 py-0.5 rounded-full font-semibold">
                  FastAPI &middot; SQLite/Postgres
                </span>
              </div>

              {success && (
                <div className="p-4 rounded-[14px] bg-[#e7efcf] border border-[#4d6a10]/25 text-[#4d6a10] text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <strong>Message sent successfully!</strong> Thank you for reaching out. The FastAPI backend has registered your inquiry and dispatched an executive notification.
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[#121410]/70 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anand Sharma"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#eef0ea] bg-white text-[#121410] placeholder:text-[#121410]/35 focus:outline-none focus:border-[#4d6a10] focus:ring-2 focus:ring-[#4d6a10]/15 font-sans transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[#121410]/70 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anand@example.com"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#eef0ea] bg-white text-[#121410] placeholder:text-[#121410]/35 focus:outline-none focus:border-[#4d6a10] focus:ring-2 focus:ring-[#4d6a10]/15 font-sans transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[#121410]/70 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Institution or Firm"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#eef0ea] bg-white text-[#121410] placeholder:text-[#121410]/35 focus:outline-none focus:border-[#4d6a10] focus:ring-2 focus:ring-[#4d6a10]/15 font-sans transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[#121410]/70 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Product Leadership / Advisory Inquiry"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#eef0ea] bg-white text-[#121410] placeholder:text-[#121410]/35 focus:outline-none focus:border-[#4d6a10] focus:ring-2 focus:ring-[#4d6a10]/15 font-sans transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[#121410]/70 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your initiative, mandate, or questions..."
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#eef0ea] bg-white text-[#121410] placeholder:text-[#121410]/35 focus:outline-none focus:border-[#4d6a10] focus:ring-2 focus:ring-[#4d6a10]/15 font-sans transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="petalyx-btn w-full sm:w-auto justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                  <span>{loading ? 'Submitting Message...' : 'Submit Message'}</span>
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
