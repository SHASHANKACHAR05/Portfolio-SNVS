import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Compass, Layers, Wrench, Trophy, Plus, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifecycleStage } from './seaRingData';
import { InlineEditableText, useAdminEdit } from '../../context/AdminEditContext';

interface ProductThinkingModalProps {
  stage: LifecycleStage | null;
  onClose: () => void;
  onSelectNext?: () => void;
  onSelectPrev?: () => void;
  onSaveStage?: (updated: LifecycleStage) => Promise<void>;
}

const inputCls =
  'w-full px-3 py-1.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const ProductThinkingModal: React.FC<ProductThinkingModalProps> = ({
  stage,
  onClose,
  onSelectNext,
  onSelectPrev,
  onSaveStage,
}) => {
  const { isEditMode } = useAdminEdit();
  const [saving, setSaving] = useState(false);

  const [addingActivity, setAddingActivity] = useState(false);
  const [activityDraft, setActivityDraft] = useState('');

  const [addingDeliverable, setAddingDeliverable] = useState(false);
  const [deliverableDraft, setDeliverableDraft] = useState('');

  const [addingTool, setAddingTool] = useState(false);
  const [toolDraft, setToolDraft] = useState('');

  // Close on Escape key & navigate with arrows (skip arrows when typing in an input/textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === 'Escape' && !isTyping) onClose();
      if (!isTyping && e.key === 'ArrowRight' && onSelectNext) onSelectNext();
      if (!isTyping && e.key === 'ArrowLeft' && onSelectPrev) onSelectPrev();
    };

    if (stage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [stage, onClose, onSelectNext, onSelectPrev]);

  if (!stage) return null;

  const updateStage = async (patch: Partial<LifecycleStage>) => {
    if (!onSaveStage) return;
    setSaving(true);
    try {
      await onSaveStage({ ...stage, ...patch });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="petalyx-scope fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
        style={{ color: 'var(--ink)' }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#121410]/45 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[24px] bg-white border border-[#eef0ea] shadow-2xl text-[#121410] overflow-hidden z-10"
        >
          {/* Top Olive-to-Lime Accent Bar */}
          <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#4d6a10] via-[#6f9a0c] to-[#b4cd52]" />

          {/* Modal Header */}
          <div className="p-5 sm:p-7 pb-4 shrink-0 flex items-start justify-between gap-4 border-b border-[#eef0ea] bg-[#fafcf7]">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20">
                  STAGE {stage.num}
                </span>
                <span className="text-xs text-[#121410]/60 font-semibold uppercase tracking-wider">
                  <InlineEditableText
                    as="span"
                    value={stage.badge}
                    onSave={(val) => updateStage({ badge: val })}
                  />
                </span>
                {isEditMode && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4d6a10] text-white font-bold">
                    Inline Edit Active
                  </span>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121410] font-display tracking-tight">
                <InlineEditableText
                  as="span"
                  value={stage.name}
                  onSave={(val) => updateStage({ name: val })}
                />
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-[#e7efcf]/50 text-[#121410]/65 hover:text-[#121410] transition-colors border border-[#eef0ea] hover:border-[#4d6a10]/30 shrink-0 cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body (Objective + Grid + Tools + Outcome) */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-white">
            {/* Objective Statement Callout */}
            <div className="px-5 sm:px-7 py-4 bg-[#e7efcf]/45 border-b border-[#eef0ea] flex items-start gap-3">
              <Compass className="w-5 h-5 text-[#4d6a10] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-[#121410] leading-relaxed flex-1 min-w-0">
                <strong className="text-[#4d6a10] uppercase text-[11px] tracking-wider block mb-0.5">
                  Strategic Objective
                </strong>
                <InlineEditableText
                  as="p"
                  multiline
                  value={stage.objective}
                  onSave={(val) => updateStage({ objective: val })}
                />
              </div>
            </div>

            {/* Core Content */}
            <div className="p-5 sm:p-7 space-y-6">
              {/* Grid: Activities & Deliverables */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Activities */}
                <div className="p-4 rounded-[18px] bg-[#fafcf7] border border-[#eef0ea] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4d6a10] uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-[#4d6a10]" />
                      <span>Core Activities</span>
                    </div>
                    {isEditMode && !addingActivity && (
                      <button
                        type="button"
                        onClick={() => {
                          setActivityDraft('');
                          setAddingActivity(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                  <ul className="space-y-2 text-xs text-[#121410]/75 leading-relaxed">
                    {stage.activities.map((act, i) => (
                      <li key={i} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6f9a0c] mt-1.5 shrink-0" />
                          <InlineEditableText
                            as="span"
                            multiline
                            value={act}
                            onSave={async (val) => {
                              const next = [...stage.activities];
                              next[i] = val;
                              await updateStage({ activities: next });
                            }}
                          />
                        </div>
                        {isEditMode && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={async () => {
                              const next = stage.activities.filter((_, idx) => idx !== i);
                              await updateStage({ activities: next });
                            }}
                            className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                            title="Delete activity"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditMode && addingActivity && (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        rows={2}
                        value={activityDraft}
                        onChange={(e) => setActivityDraft(e.target.value)}
                        placeholder="Add new core activity..."
                        className={inputCls}
                        autoFocus
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={saving || !activityDraft.trim()}
                          onClick={async () => {
                            await updateStage({ activities: [...stage.activities, activityDraft.trim()] });
                            setActivityDraft('');
                            setAddingActivity(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingActivity(false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deliverables */}
                <div className="p-4 rounded-[18px] bg-[#fafcf7] border border-[#eef0ea] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4d6a10] uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-[#4d6a10]" />
                      <span>Concrete Deliverables</span>
                    </div>
                    {isEditMode && !addingDeliverable && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeliverableDraft('');
                          setAddingDeliverable(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                  <ul className="space-y-2 text-xs text-[#121410]/85 leading-relaxed">
                    {stage.deliverables.map((del, i) => (
                      <li key={i} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4d6a10] shrink-0 mt-0.5" />
                          <InlineEditableText
                            as="span"
                            multiline
                            value={del}
                            onSave={async (val) => {
                              const next = [...stage.deliverables];
                              next[i] = val;
                              await updateStage({ deliverables: next });
                            }}
                          />
                        </div>
                        {isEditMode && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={async () => {
                              const next = stage.deliverables.filter((_, idx) => idx !== i);
                              await updateStage({ deliverables: next });
                            }}
                            className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                            title="Delete deliverable"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditMode && addingDeliverable && (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        rows={2}
                        value={deliverableDraft}
                        onChange={(e) => setDeliverableDraft(e.target.value)}
                        placeholder="Add new concrete deliverable..."
                        className={inputCls}
                        autoFocus
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={saving || !deliverableDraft.trim()}
                          onClick={async () => {
                            await updateStage({ deliverables: [...stage.deliverables, deliverableDraft.trim()] });
                            setDeliverableDraft('');
                            setAddingDeliverable(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingDeliverable(false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tools & Systems */}
              <div className="p-4 rounded-[18px] bg-[#fafcf7] border border-[#eef0ea] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4d6a10] uppercase tracking-wider">
                    <Wrench className="w-4 h-4 text-[#4d6a10]" />
                    <span>Governance Tools &amp; Software Stack</span>
                  </div>
                  {isEditMode && !addingTool && (
                    <button
                      type="button"
                      onClick={() => {
                        setToolDraft('');
                        setAddingTool(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add Tool</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {stage.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white border border-[#eef0ea] text-[#121410]/85 font-medium"
                    >
                      <span>{tool}</span>
                      {isEditMode && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={async () => {
                            const next = stage.tools.filter((_, idx) => idx !== i);
                            await updateStage({ tools: next });
                          }}
                          className="hover:text-red-600 cursor-pointer"
                          title="Remove tool"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {isEditMode && addingTool && (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={toolDraft}
                        onChange={(e) => setToolDraft(e.target.value)}
                        placeholder="e.g. Notion"
                        className="px-2.5 py-1 rounded-full border border-[#4d6a10] bg-white text-xs text-[#121410] focus:outline-none w-32"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={saving || !toolDraft.trim()}
                        onClick={async () => {
                          await updateStage({ tools: [...stage.tools, toolDraft.trim()] });
                          setToolDraft('');
                          setAddingTool(false);
                        }}
                        className="p-1 rounded-full bg-[#4d6a10] text-white cursor-pointer"
                        title="Add tool"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingTool(false)}
                        className="p-1 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expected Outcome */}
              <div className="p-4 rounded-[18px] bg-[#e7efcf]/55 border border-[#4d6a10]/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4d6a10] uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-[#4d6a10]" />
                  <span>Expected Organizational Outcome</span>
                </div>
                <div className="text-xs sm:text-sm text-[#121410]/90 leading-relaxed">
                  <InlineEditableText
                    as="p"
                    multiline
                    value={stage.outcome}
                    onSave={(val) => updateStage({ outcome: val })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 sm:px-7 shrink-0 border-t border-[#eef0ea] bg-[#fafcf7] flex items-center justify-between">
            <span className="text-[11px] text-[#121410]/60">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#eef0ea] text-[#121410] font-semibold">ESC</kbd> to close
            </span>

            <button
              type="button"
              onClick={onClose}
              className="petalyx-btn !py-2 !px-4 !text-xs cursor-pointer"
            >
              Close Phase Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
