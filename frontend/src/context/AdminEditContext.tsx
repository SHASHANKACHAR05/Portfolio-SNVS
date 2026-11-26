import React, { createContext, useContext, useState } from 'react';
import { Pencil, Check, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { PortfolioBundle } from '../types';
import { AdminEditInfoManager, EditSectionKey } from '../components/AdminEditInfoManager';

interface AdminEditContextValue {
  isEditMode: boolean;
  token: string | null;
  data: PortfolioBundle | null;
  onRefreshData: () => void;
}

const AdminEditContext = createContext<AdminEditContextValue>({
  isEditMode: false,
  token: null,
  data: null,
  onRefreshData: () => {},
});

export const AdminEditProvider: React.FC<{
  value: AdminEditContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <AdminEditContext.Provider value={value}>{children}</AdminEditContext.Provider>
);

export const useAdminEdit = () => useContext(AdminEditContext);

/* ───────────────────────────────────────────────────────────────────────────
   InlineEditableText — click directly on any text on the page to edit in place
   ─────────────────────────────────────────────────────────────────────────── */
interface InlineEditableTextProps {
  value: string;
  onSave: (nextValue: string) => Promise<void>;
  multiline?: boolean;
  className?: string;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3';
  placeholder?: string;
  renderView?: (val: string) => React.ReactNode;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onSave,
  multiline = false,
  className = '',
  as: Tag = 'span',
  placeholder,
  renderView,
}) => {
  const { isEditMode } = useAdminEdit();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const editorWrapRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (editing && editorWrapRef.current) {
      editorWrapRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [editing]);

  if (!isEditMode) {
    return <Tag className={className}>{renderView ? renderView(value) : value}</Tag>;
  }

  if (editing) {
    const commit = async () => {
      const trimmed = draft.trim();
      if (!trimmed || trimmed === value) {
        setEditing(false);
        return;
      }
      setSaving(true);
      try {
        await onSave(trimmed);
        setEditing(false);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    };

    return (
      <span
        ref={editorWrapRef}
        className="inline-block w-full min-w-[210px] max-w-full space-y-1.5 my-1 align-middle text-left normal-case tracking-normal"
        onClick={(e) => e.stopPropagation()}
      >
        {multiline ? (
          <textarea
            autoFocus
            rows={Math.max(2, Math.min(6, Math.ceil(draft.length / 65)))}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="block w-full px-3 py-2 rounded-xl border-2 border-[#4d6a10] bg-white text-[#121410] text-sm font-sans font-normal leading-relaxed shadow-md focus:outline-none"
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void commit();
              } else if (e.key === 'Escape') {
                setDraft(value);
                setEditing(false);
              }
            }}
            placeholder={placeholder}
            className="block w-full px-3 py-2 rounded-xl border-2 border-[#4d6a10] bg-white text-[#121410] text-sm font-sans font-semibold leading-normal shadow-md focus:outline-none"
          />
        )}
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => void commit()}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[11px] font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#4d6a10]/25 bg-white text-[#121410] font-mono text-[11px] font-semibold hover:bg-[#fafcf7] cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Cancel</span>
          </button>
        </span>
      </span>
    );
  }

  return (
    <Tag
      onClick={(e) => {
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
      title="Click to edit directly on page"
      className={`${className} relative cursor-text rounded-lg outline outline-1 outline-dashed outline-[#4d6a10]/40 hover:outline-2 hover:outline-[#4d6a10] hover:bg-[#e7efcf]/35 transition-all px-1 -mx-1 group/inline`.trim()}
    >
      {renderView ? renderView(value) : value}
      <span className="inline-flex items-center align-middle ml-1.5 px-1.5 py-0.5 rounded-full bg-[#4d6a10] text-white text-[9px] font-mono font-bold opacity-75 group-hover/inline:opacity-100 select-none">
        <Pencil className="w-2.5 h-2.5 mr-0.5" />
        Edit
      </span>
    </Tag>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
   InlineSectionEditor — compact top-right "Edit" button that opens inline CRUD
   ─────────────────────────────────────────────────────────────────────────── */
export const InlineSectionEditor: React.FC<{
  section: EditSectionKey;
  label: string;
}> = ({ section, label }) => {
  const { isEditMode, token, data, onRefreshData } = useAdminEdit();
  const [expanded, setExpanded] = useState(false);

  if (!isEditMode || !token) return null;

  return (
    <div className="relative z-20 mb-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold border shadow-xs transition-colors cursor-pointer ${
            expanded
              ? 'bg-[#121410] text-white border-[#121410]'
              : 'bg-[#4d6a10] text-white border-[#4d6a10] hover:bg-[#3f590d]'
          }`}
        >
          {expanded ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          <span>{expanded ? 'Close Editor' : `Edit ${label}`}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 p-4 sm:p-5 rounded-2xl border border-[#4d6a10]/30 bg-white shadow-lg">
          <AdminEditInfoManager
            token={token}
            data={data}
            onRefreshData={onRefreshData}
            initialSection={section}
            sectionHeading={label}
            isLivePreviewMode={true}
          />
        </div>
      )}
    </div>
  );
};

