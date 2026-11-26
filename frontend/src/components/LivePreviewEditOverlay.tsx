import React, { useEffect, useRef, useState } from 'react';
import {
  Pencil, X, LayoutDashboard, User, BarChart3, Briefcase, FolderGit2, Wrench, GraduationCap,
  GripVertical, Minimize2, Maximize2
} from 'lucide-react';
import { EditSectionKey } from './AdminEditInfoManager';

interface LivePreviewEditOverlayProps {
  isOpen: boolean;
  activeSection: EditSectionKey;
  onSectionChange: (section: EditSectionKey) => void;
  onReturnToDashboard: () => void;
  onExitLiveEdit: () => void;
}

const JUMP_SECTIONS: { key: EditSectionKey; label: string; anchor: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Profile', anchor: '#overview', icon: <User className="w-3.5 h-3.5" /> },
  { key: 'metrics', label: 'Metrics', anchor: '#record', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { key: 'experiences', label: 'Experience', anchor: '#experience', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { key: 'projects', label: 'Projects', anchor: '#portfolio', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
  { key: 'skills', label: 'Skills', anchor: '#skills', icon: <Wrench className="w-3.5 h-3.5" /> },
  { key: 'certifications', label: 'Education', anchor: '#certifications', icon: <GraduationCap className="w-3.5 h-3.5" /> },
];

export const LivePreviewEditOverlay: React.FC<LivePreviewEditOverlayProps> = ({
  isOpen,
  activeSection,
  onSectionChange,
  onReturnToDashboard,
  onExitLiveEdit,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Keep bar inside viewport on window resize
  useEffect(() => {
    if (!pos) return;
    const handleResize = () => {
      const rect = barRef.current?.getBoundingClientRect();
      const w = rect?.width ?? 260;
      const h = rect?.height ?? 48;
      setPos((prev) =>
        prev
          ? {
              x: Math.max(8, Math.min(prev.x, window.innerWidth - w - 8)),
              y: Math.max(8, Math.min(prev.y, window.innerHeight - h - 8)),
            }
          : null
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pos]);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOffset.current = {
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
    };
    if (!pos) {
      setPos({ x: rect.left, y: rect.top });
    }
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = barRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 260;
    const h = rect?.height ?? 48;
    const nextX = Math.max(8, Math.min(e.clientX - dragOffset.current.dx, window.innerWidth - w - 8));
    const nextY = Math.max(8, Math.min(e.clientY - dragOffset.current.dy, window.innerHeight - h - 8));
    setPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const handleJump = (key: EditSectionKey, anchor: string) => {
    onSectionChange(key);
    const el = document.querySelector(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const positionStyle: React.CSSProperties = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px` }
    : { bottom: '16px', left: '50%', transform: 'translateX(-50%)' };

  return (
    <div
      ref={barRef}
      style={positionStyle}
      className="fixed z-[9990] max-w-[96vw] select-none"
    >
      <div
        className={`flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-[#4d6a10]/35 bg-white/95 backdrop-blur-md shadow-2xl text-[#121410] transition-shadow ${
          isDragging ? 'shadow-[0_18px_40px_rgba(77,106,16,0.28)] ring-2 ring-[#4d6a10]/30' : ''
        }`}
      >
        {/* Drag Handle */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          title="Drag to move toolbar anywhere"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e7efcf] text-[#4d6a10] font-mono text-[11px] font-bold touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <GripVertical className="w-3.5 h-3.5 opacity-70" />
          <Pencil className="w-3 h-3" />
          <span>On-Page Edit</span>
        </div>

        {!isMinimized && (
          <>
            {JUMP_SECTIONS.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => handleJump(sec.key, sec.anchor)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeSection === sec.key
                    ? 'bg-[#4d6a10] text-white'
                    : 'bg-[#fafcf7] text-[#121410]/80 hover:bg-[#e7efcf] hover:text-[#4d6a10]'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            ))}

            <div className="w-px h-4 bg-[#4d6a10]/20 mx-0.5 hidden sm:block" />

            <button
              type="button"
              onClick={onReturnToDashboard}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#4d6a10] hover:bg-[#e7efcf] font-mono text-[11px] font-semibold cursor-pointer"
              title="Return to Admin Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </>
        )}

        {/* Minimize / Expand toggle */}
        <button
          type="button"
          onClick={() => setIsMinimized((prev) => !prev)}
          className="p-1.5 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#4d6a10] hover:bg-[#e7efcf] transition-colors cursor-pointer"
          title={isMinimized ? 'Expand toolbar' : 'Collapse toolbar to compact pill'}
        >
          {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={onExitLiveEdit}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#121410] text-white hover:bg-red-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          title="Exit On-Page Edit Mode"
        >
          <X className="w-3.5 h-3.5" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};
