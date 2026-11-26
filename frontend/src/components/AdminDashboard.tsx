import React, { useState, useEffect } from 'react';
import {
  X, Shield, Mail, CheckCircle2, Trash2, Eye, EyeOff, RefreshCw, LayoutDashboard,
  FolderGit2, User, LogOut, Check, FileSpreadsheet, ExternalLink, Link2, UploadCloud, Copy,
  ChevronDown, ChevronUp, Pencil
} from 'lucide-react';
import { AdminSummary, ContactMessageResponse, Project, Profile, PortfolioBundle } from '../types';
import {
  getAdminSummary, getAdminMessages, markAdminMessageRead, deleteAdminMessage, toggleProjectPublishState,
  downloadAdminMessagesExcel, getGoogleSheetConfig, saveGoogleSheetConfig, syncGoogleSheet
} from '../services/api';
import { AdminEditInfoManager, EditSectionKey } from './AdminEditInfoManager';

const APPS_SCRIPT_SNIPPET = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  var headers = ['ID', 'Name', 'Email', 'Company', 'Subject', 'Message', 'Status', 'Received At'];
  if (payload.mode === 'sync_all') {
    sheet.clearContents();
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  (payload.rows || []).forEach(function(r) {
    sheet.appendRow([r.id, r.name, r.email, r.company, r.subject, r.message, r.status, r.received_at]);
  });
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}`;

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  userName: string;
  onLogout: () => void;
  projects: Project[];
  onRefreshData: () => void;
  profile: Profile | null;
  portfolioData: PortfolioBundle | null;
  onLaunchLivePreview: (section: EditSectionKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  token,
  userName,
  onLogout,
  projects,
  onRefreshData,
  profile,
  portfolioData,
  onLaunchLivePreview
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'projects' | 'profile' | 'edit'>('overview');
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Excel & Google Sheets state
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showSheetsPanel, setShowSheetsPanel] = useState(false);
  const [showScriptHelp, setShowScriptHelp] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [googleWebhookUrl, setGoogleWebhookUrl] = useState('');
  const [autoSyncSheet, setAutoSyncSheet] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [savingSheet, setSavingSheet] = useState(false);
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [sheetNotice, setSheetNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile edit form state
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [summaryText, setSummaryText] = useState(profile?.summary || '');
  const [philosophyText, setPhilosophyText] = useState(profile?.philosophy || '');

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline);
      setSummaryText(profile.summary);
      setPhilosophyText(profile.philosophy);
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen && token) {
      loadAdminData();
    }
  }, [isOpen, token]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sumRes, msgRes, sheetCfg] = await Promise.all([
        getAdminSummary(token),
        getAdminMessages(token),
        getGoogleSheetConfig(token).catch(() => null)
      ]);
      setSummary(sumRes);
      setMessages(msgRes);
      if (sheetCfg) {
        setGoogleSheetUrl(sheetCfg.google_sheet_url || '');
        setGoogleWebhookUrl(sheetCfg.google_webhook_url || '');
        setAutoSyncSheet(sheetCfg.auto_sync_google_sheet);
        setLastSyncedAt(sheetCfg.last_synced_at);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    setSheetNotice(null);
    try {
      await downloadAdminMessagesExcel(token);
    } catch (err) {
      setSheetNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to download Excel file.'
      });
    } finally {
      setExportingExcel(false);
    }
  };

  const handleSaveGoogleSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSheet(true);
    setSheetNotice(null);
    try {
      const updated = await saveGoogleSheetConfig(
        {
          google_sheet_url: googleSheetUrl.trim(),
          google_webhook_url: googleWebhookUrl.trim(),
          auto_sync_google_sheet: autoSyncSheet
        },
        token
      );
      setGoogleSheetUrl(updated.google_sheet_url || '');
      setGoogleWebhookUrl(updated.google_webhook_url || '');
      setAutoSyncSheet(updated.auto_sync_google_sheet);
      setLastSyncedAt(updated.last_synced_at);
      setSheetNotice({ type: 'success', text: 'Google Sheet connection saved.' });
    } catch (err) {
      setSheetNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save Google Sheet link.'
      });
    } finally {
      setSavingSheet(false);
    }
  };

  const handleSyncToGoogleSheet = async () => {
    setSyncingSheet(true);
    setSheetNotice(null);
    try {
      const res = await syncGoogleSheet(token);
      setLastSyncedAt(res.last_synced_at);
      setSheetNotice({ type: 'success', text: res.detail });
    } catch (err) {
      setSheetNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to sync to Google Sheets.'
      });
    } finally {
      setSyncingSheet(false);
    }
  };

  const handleCopyForGoogleSheets = async () => {
    const headers = ['ID', 'Name', 'Email', 'Company', 'Subject', 'Message', 'Status', 'Received At'];
    const escapeCell = (val: string) => val.replace(/[\t\r\n]+/g, ' ').trim();
    const rows = messages.map((m) => [
      String(m.id),
      escapeCell(m.name),
      escapeCell(m.email),
      escapeCell(m.company || ''),
      escapeCell(m.subject),
      escapeCell(m.message),
      m.is_read ? 'Read' : 'New',
      new Date(m.created_at).toLocaleString()
    ]);
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedTsv(true);
      setTimeout(() => setCopiedTsv(false), 2500);
      setSheetNotice({
        type: 'success',
        text: 'Copied all inquiries — open your Google Sheet and press Ctrl+V in cell A1.'
      });
    } catch {
      setSheetNotice({ type: 'error', text: 'Clipboard access blocked. Use Download Excel (.xlsx) instead.' });
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markAdminMessageRead(id, token);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
      if (summary) {
        setSummary({
          ...summary,
          messages: { ...summary.messages, unread: Math.max(0, summary.messages.unread - 1) }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteAdminMessage(id, token);
      setMessages(prev => prev.filter(m => m.id !== id));
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await toggleProjectPublishState(id, token);
      onRefreshData();
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          headline,
          summary: summaryText,
          philosophy: philosophyText
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9990] overflow-y-auto bg-[#121410]/55 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className="bg-white text-[#121410] w-full max-w-5xl rounded-[24px] border border-[#4d6a10]/25 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — Petalyx Light Botanical Theme */}
        <div className="px-6 py-4 border-b border-[#4d6a10]/15 flex flex-wrap items-center justify-between gap-3 bg-[#fafcf7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#e7efcf] border border-[#4d6a10]/25 text-[#4d6a10]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-[#121410] flex items-center gap-2 flex-wrap">
                Executive Admin Portal
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20 font-bold">
                  Authenticated
                </span>
              </h2>
              <p className="text-xs font-mono text-[#121410]/65">
                Logged in as: <strong className="text-[#121410]">{userName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLaunchLivePreview('profile')}
              className="px-3.5 py-1.5 rounded-full bg-[#4d6a10] hover:bg-[#3f590d] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Edit the website directly on top of the live preview"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit in Live Preview</span>
            </button>
            <button
              type="button"
              onClick={loadAdminData}
              disabled={loading}
              className="p-2 rounded-full border border-[#4d6a10]/20 bg-white text-[#121410]/70 hover:text-[#4d6a10] hover:border-[#4d6a10] transition-colors cursor-pointer"
              title="Refresh admin telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-mono font-semibold flex items-center gap-1 hover:bg-red-100 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full border border-[#4d6a10]/20 bg-white text-[#121410]/70 hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar — Matched Petalyx Light Olive Styling */}
        <div className="flex border-b border-[#4d6a10]/15 px-6 bg-white text-xs font-mono overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#4d6a10] text-[#4d6a10] font-bold bg-[#fafcf7]'
                : 'border-transparent text-[#121410]/65 hover:text-[#121410]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview Telemetry
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'messages'
                ? 'border-[#4d6a10] text-[#4d6a10] font-bold bg-[#fafcf7]'
                : 'border-transparent text-[#121410]/65 hover:text-[#121410]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Inquiries Inbox
            {summary && summary.messages.unread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#4d6a10] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                {summary.messages.unread}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'projects'
                ? 'border-[#4d6a10] text-[#4d6a10] font-bold bg-[#fafcf7]'
                : 'border-transparent text-[#121410]/65 hover:text-[#121410]'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            Projects &amp; Publishing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#4d6a10] text-[#4d6a10] font-bold bg-[#fafcf7]'
                : 'border-transparent text-[#121410]/65 hover:text-[#121410]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile &amp; Introduction
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'edit'
                ? 'border-[#4d6a10] text-[#4d6a10] font-bold bg-[#e7efcf]/45'
                : 'border-transparent text-[#4d6a10] hover:bg-[#fafcf7] font-semibold'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Info
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7]">
                    <span className="text-[#121410]/60 block font-mono text-[11px] mb-1">Projects Published</span>
                    <span className="text-2xl font-display font-extrabold text-[#4d6a10]">
                      {summary.projects.published} / {summary.projects.total}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7]">
                    <span className="text-[#121410]/60 block font-mono text-[11px] mb-1">Contact Inquiries</span>
                    <span className="text-2xl font-display font-extrabold text-[#121410]">
                      {summary.messages.total}
                      {summary.messages.unread > 0 && (
                        <span className="text-xs font-mono text-[#4d6a10] ml-2">
                          ({summary.messages.unread} new)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7]">
                    <span className="text-[#121410]/60 block font-mono text-[11px] mb-1">Career Milestones</span>
                    <span className="text-2xl font-display font-extrabold text-[#121410]">
                      {summary.experiences_count}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7]">
                    <span className="text-[#121410]/60 block font-mono text-[11px] mb-1">Verified Skills &amp; Tools</span>
                    <span className="text-2xl font-display font-extrabold text-[#121410]">
                      {summary.skills_count}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7] space-y-3">
                <h3 className="font-mono uppercase font-bold text-[#4d6a10] text-[11px]">
                  Backend Runtime Architecture
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="p-3.5 rounded-xl bg-white border border-[#4d6a10]/15">
                    <span className="text-[#121410]/55 block">API Framework:</span>
                    <strong className="text-[#121410]">Python &middot; FastAPI</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#4d6a10]/15">
                    <span className="text-[#121410]/55 block">Database ORM:</span>
                    <strong className="text-[#121410]">SQLAlchemy (SQLite / Postgres)</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#4d6a10]/15">
                    <span className="text-[#121410]/55 block">Auth Mechanism:</span>
                    <strong className="text-[#121410]">JWT (HMAC-SHA256)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              {/* Toolbar Header: Title + Excel Download + Google Sheets Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-mono uppercase font-bold text-[#121410] text-[11px]">
                    Received Contact Form Submissions ({messages.length})
                  </h3>
                  <span className="text-[#121410]/60 font-mono text-[10px]">
                    Real-time database queries through FastAPI
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadExcel}
                    disabled={exportingExcel || messages.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#4d6a10]/30 bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white disabled:opacity-50 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                    title="Download all inquiries as an Excel (.xlsx) workbook"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{exportingExcel ? 'Exporting...' : 'Download Excel (.xlsx)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSheetsPanel((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                      googleSheetUrl
                        ? 'border-[#4d6a10] bg-[#4d6a10] text-white'
                        : 'border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10]'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{googleSheetUrl ? 'Google Sheet Connected' : 'Connect Google Sheet'}</span>
                    {showSheetsPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {googleSheetUrl && (
                    <a
                      href={googleSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#4d6a10]/25 bg-white text-[#4d6a10] hover:bg-[#fafcf7] font-mono text-[11px] font-semibold transition-colors"
                      title="Open connected Google Sheet"
                    >
                      <span>Open Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {sheetNotice && (
                <div
                  className={`px-3.5 py-2.5 rounded-xl border font-mono text-[11px] flex items-center justify-between gap-2 ${
                    sheetNotice.type === 'success'
                      ? 'border-[#4d6a10]/30 bg-[#e7efcf] text-[#4d6a10] font-semibold'
                      : 'border-red-300 bg-red-50 text-red-700 font-semibold'
                  }`}
                >
                  <span>{sheetNotice.text}</span>
                  <button type="button" onClick={() => setSheetNotice(null)} className="opacity-70 hover:opacity-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {showSheetsPanel && (
                <div className="p-4 rounded-2xl border border-[#4d6a10]/25 bg-[#fafcf7] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#4d6a10]/15">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#4d6a10]" />
                      <span className="font-mono font-bold text-[#121410] text-xs">
                        Google Sheets Integration
                      </span>
                    </div>
                    {lastSyncedAt && (
                      <span className="text-[10px] font-mono text-[#121410]/60">
                        Last synced: {new Date(lastSyncedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveGoogleSheet} className="space-y-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-[#4d6a10] mb-1">
                        Google Sheet Link (URL)
                      </label>
                      <input
                        type="url"
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                        className="w-full px-3 py-2 rounded-xl border border-[#4d6a10]/25 bg-white text-[#121410] text-xs font-mono focus:outline-none focus:border-[#4d6a10]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#4d6a10]">
                          Google Apps Script Web App URL (Optional — 1-click &amp; auto live sync)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowScriptHelp((prev) => !prev)}
                          className="text-[10px] font-mono text-[#4d6a10] font-bold hover:underline cursor-pointer"
                        >
                          {showScriptHelp ? 'Hide Setup Script' : 'How to get Webhook URL?'}
                        </button>
                      </div>
                      <input
                        type="url"
                        value={googleWebhookUrl}
                        onChange={(e) => setGoogleWebhookUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full px-3 py-2 rounded-xl border border-[#4d6a10]/25 bg-white text-[#121410] text-xs font-mono focus:outline-none focus:border-[#4d6a10]"
                      />
                    </div>

                    <label className="inline-flex items-center gap-2 text-[11px] font-mono text-[#121410] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSyncSheet}
                        onChange={(e) => setAutoSyncSheet(e.target.checked)}
                        className="accent-[#4d6a10]"
                      />
                      <span>Automatically append new contact form inquiries to Google Sheet on submission</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={savingSheet}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#4d6a10] text-white font-mono text-[11px] font-bold hover:bg-[#3f590d] disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{savingSheet ? 'Saving...' : 'Save Google Sheet Link'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSyncToGoogleSheet}
                        disabled={syncingSheet || !googleWebhookUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#4d6a10]/30 bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white disabled:opacity-45 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{syncingSheet ? 'Syncing...' : 'Sync All to Sheet'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyForGoogleSheets}
                        disabled={messages.length === 0}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#4d6a10]/25 bg-white text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] font-mono text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-45"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedTsv ? 'Copied Rows!' : 'Copy Rows for Sheet'}</span>
                      </button>
                    </div>
                  </form>

                  {showScriptHelp && (
                    <div className="p-3.5 rounded-xl border border-[#4d6a10]/20 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-[#121410]">
                          1-Minute Live Auto-Sync Setup (Extensions → Apps Script in your Google Sheet)
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
                            setCopiedScript(true);
                            setTimeout(() => setCopiedScript(false), 2000);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#4d6a10] font-bold hover:underline cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                        </button>
                      </div>
                      <ol className="list-decimal list-inside text-[11px] text-[#121410]/70 space-y-1">
                        <li>Open your Google Sheet → click <strong>Extensions → Apps Script</strong>.</li>
                        <li>Paste the code below, click <strong>Deploy → New deployment → Web app</strong>.</li>
                        <li>Set <em>Who has access</em> to <strong>Anyone</strong>, click Deploy, and paste the Web App URL above.</li>
                      </ol>
                      <pre className="p-2.5 rounded-lg bg-[#fafcf7] border border-[#4d6a10]/15 text-[10px] font-mono text-[#121410]/85 overflow-x-auto leading-relaxed">
                        {APPS_SCRIPT_SNIPPET}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {messages.length === 0 ? (
                <div className="p-8 text-center text-[#121410]/60 border border-dashed border-[#4d6a10]/25 rounded-2xl bg-[#fafcf7]">
                  No contact messages received yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        m.is_read
                          ? 'border-[#4d6a10]/15 bg-white'
                          : 'border-[#4d6a10]/40 bg-[#fafcf7]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#121410] text-sm">{m.name}</span>
                            <span className="text-[#121410]/60 text-xs">&lt;{m.email}&gt;</span>
                            {m.company && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/75">
                                {m.company}
                              </span>
                            )}
                            {!m.is_read && (
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#4d6a10] text-white font-bold">
                                New
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-[#121410] mt-1">
                            Subject: {m.subject}
                          </h4>
                          <p className="text-[#121410]/80 mt-2 leading-relaxed bg-white p-3 rounded-xl border border-[#4d6a10]/15">
                            {m.message}
                          </p>
                          <span className="text-[10px] font-mono text-[#121410]/55 mt-2 block">
                            Received: {new Date(m.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!m.is_read && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(m.id)}
                              className="p-1.5 rounded-lg border border-[#4d6a10]/25 bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <a
                            href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                            className="p-1.5 rounded-lg border border-[#4d6a10]/20 bg-white text-[#121410]/70 hover:text-[#4d6a10] hover:border-[#4d6a10] transition-colors"
                            title="Reply by email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m.id)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-mono uppercase font-bold text-[#121410] text-[11px]">
                    Portfolio Projects Visibility &amp; Publishing ({projects.length})
                  </h3>
                  <span className="text-[#121410]/60 font-mono text-[10px]">
                    Toggle visibility or click Edit Info to add / update / delete projects
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="px-3.5 py-1.5 rounded-full bg-[#4d6a10] text-white font-mono text-[11px] font-bold hover:bg-[#3f590d] transition-colors cursor-pointer"
                >
                  + Manage / Add Projects
                </button>
              </div>

              <div className="space-y-2.5">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#121410] text-sm">{p.title}</span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] font-semibold">
                          {p.category}
                        </span>
                      </div>
                      <span className="text-[#121410]/65 font-mono text-[11px] block mt-0.5">
                        Client: {p.client_org} &middot; Slug: /{p.slug}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(p.id)}
                      className={`px-3.5 py-1.5 rounded-full border font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        p.published
                          ? 'border-[#4d6a10]/30 bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white'
                          : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {p.published ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono uppercase font-bold text-[#121410] text-[11px]">
                  Quick Profile &amp; Executive Bio Update
                </h3>
                {saveSuccess && (
                  <span className="text-[#4d6a10] font-mono text-xs flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    Changes committed to database
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-[#4d6a10] mb-1">
                    Executive Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] focus:outline-none focus:border-[#4d6a10] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-[#4d6a10] mb-1">
                    Core Biography / Executive Summary
                  </label>
                  <textarea
                    rows={4}
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] focus:outline-none focus:border-[#4d6a10] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-[#4d6a10] mb-1">
                    Product Philosophy Statement
                  </label>
                  <textarea
                    rows={3}
                    value={philosophyText}
                    onChange={(e) => setPhilosophyText(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] focus:outline-none focus:border-[#4d6a10] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#4d6a10] hover:bg-[#3f590d] text-white font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'edit' && (
            <AdminEditInfoManager
              token={token}
              data={portfolioData}
              onRefreshData={onRefreshData}
              onLaunchLivePreview={onLaunchLivePreview}
            />
          )}
        </div>
      </div>
    </div>
  );
};
