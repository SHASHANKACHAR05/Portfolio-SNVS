import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Metric } from '../types';
import GhostFibers from '../components/ghost-fibers/GhostFibers';
import CircularGallery, { CircularGalleryItem } from '../components/circular-gallery/CircularGallery';
import { InlineSectionEditor } from '../context/AdminEditContext';

interface MetricsSectionProps {
  metrics: Metric[];
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function renderMetricCardImage(m: Metric, index: number): string {
  const width = 760;
  const height = 960;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean light Petalyx card surface with subtle olive gradient tint
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.65, '#fafcf7');
  bg.addColorStop(1, '#eef5df');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle architectural grid lines
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 48; x < width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 48; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Crisp inner card border
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.28)';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Top accent bar
  const accent = ctx.createLinearGradient(0, 0, width, 0);
  accent.addColorStop(0, '#4d6a10');
  accent.addColorStop(1, '#b4cd52');
  ctx.fillStyle = accent;
  ctx.fillRect(10, 10, width - 20, 12);

  // Index badge (01, 02...)
  const numStr = String(index + 1).padStart(2, '0');
  ctx.fillStyle = '#e7efcf';
  ctx.beginPath();
  ctx.roundRect(56, 68, 96, 64, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#4d6a10';
  ctx.font = '800 30px "Inter Tight", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(numStr, 104, 101);

  // Context project pill on top right
  const pillText = m.context_project || 'Verified';
  ctx.font = '700 22px "Inter Tight", system-ui, sans-serif';
  const pillW = Math.min(360, ctx.measureText(pillText).width + 54);
  const pillX = width - 56 - pillW;
  ctx.fillStyle = '#e7efcf';
  ctx.beginPath();
  ctx.roundRect(pillX, 74, pillW, 52, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#4d6a10';
  ctx.textAlign = 'center';
  ctx.fillText(pillText, pillX + pillW / 2, 101);

  // Hero Metric Value
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#121410';
  ctx.font = '800 132px "Inter Tight", system-ui, sans-serif';
  ctx.fillText(m.value_number || '', 56, 330, width - 112);

  // Olive accent rule
  ctx.fillStyle = '#6f9a0c';
  ctx.beginPath();
  ctx.roundRect(56, 366, 92, 8, 4);
  ctx.fill();

  // Metric Label
  ctx.fillStyle = '#121410';
  ctx.font = '700 40px "Inter Tight", system-ui, sans-serif';
  const labelLines = wrapLines(ctx, m.label || '', width - 112, 2);
  let y = 448;
  for (const l of labelLines) {
    ctx.fillText(l, 56, y);
    y += 50;
  }

  // Description
  ctx.fillStyle = 'rgba(18, 20, 16, 0.72)';
  ctx.font = '400 28px "Inter Tight", system-ui, sans-serif';
  const descLines = wrapLines(ctx, m.description || '', width - 112, 5);
  y += 18;
  for (const l of descLines) {
    ctx.fillText(l, 56, y);
    y += 40;
  }

  // Bottom divider & verified footer
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, height - 112);
  ctx.lineTo(width - 56, height - 112);
  ctx.stroke();

  ctx.fillStyle = 'rgba(18, 20, 16, 0.55)';
  ctx.font = '600 22px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VERIFIED DATA', 56, height - 62);

  ctx.fillStyle = '#4d6a10';
  ctx.font = '700 22px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(pillText, width - 56, height - 62);

  return canvas.toDataURL('image/png');
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics }) => {
  const [showChart, setShowChart] = useState(false);

  // Recharts data visualization
  const chartData = [
    { name: 'HEIs (Samarth)', value: 1200, context: 'Samarth eGov' },
    { name: 'Central Univs (HR)', value: 150, context: 'Samarth eGov' },
    { name: 'ERP Modules', value: 45, context: 'Samarth eGov' },
    { name: 'PO Modules Owned', value: 10, context: 'Samarth eGov' },
    { name: 'Websites Unified', value: 13, context: 'NFDC India' },
    { name: 'Manuals Authored', value: 30, context: 'Samarth eGov' }
  ];

  // Build CircularGallery card textures from the real verified metrics
  const galleryItems = useMemo<CircularGalleryItem[]>(() => {
    if (typeof document === 'undefined' || !metrics.length) return [];
    return metrics.map((m, idx) => ({
      image: renderMetricCardImage(m, idx),
      text: m.label,
      description: `${m.value_number} — ${m.description} (${m.context_project})`,
      alt: `${m.value_number} ${m.label} — ${m.context_project}`
    }));
  }, [metrics]);

  return (
    <section
      id="record"
      className="petalyx-scope py-16 md:py-20 border-b border-[#eef0ea] bg-white overflow-x-clip relative"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-30 z-0" />

      {/* Interactive GhostFibers WebGL2 Background */}
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-85" aria-hidden="true">
        <GhostFibers
          glowColor="#4d6a10"
          secondaryColor="#84a92c"
          lineColor="#6f9a0c"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
          lightMode={true}
          brightness={0.85}
          vignette={0.35}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <InlineSectionEditor section="metrics" label="Metric Cards" />
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-2">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 petalyx-pill mb-3">
              <BarChart3 className="w-3.5 h-3.5 text-[#4d6a10]" />
              <span>Delivery Record &amp; Quantified Impact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.15]">
              What shipped, <span className="text-[#4d6a10] italic">and where.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#121410]/70 mt-2 max-w-xl leading-relaxed">
              Strictly verified accomplishments across national enterprise ERP and cultural media transformations. Every figure is mapped strictly to its source organization.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className="text-xs font-mono font-semibold px-4 py-2 rounded-full border border-[#4d6a10]/25 text-[#121410]/80 hover:text-[#4d6a10] hover:border-[#4d6a10]/50 hover:bg-[#e7efcf]/40 flex items-center gap-1.5 transition-colors bg-white/90 backdrop-blur-sm shadow-2xs"
              title={showChart ? 'Switch back to Circular Gallery' : 'Show Visual Chart'}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#4d6a10]" />
              <span>{showChart ? 'Show Metrics Gallery' : 'Show Visual Distribution'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: Chart stays in container */}
        {showChart && (
          <div className="p-6 rounded-[22px] border border-[#4d6a10]/30 bg-white/90 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-mono uppercase text-[#4d6a10] font-bold">
              Quantitative Operational Scale
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5244' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#4a5244' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#4d6a10',
                      borderRadius: '12px',
                      color: '#121410',
                      fontSize: '12px',
                      fontFamily: '"Inter Tight", system-ui, sans-serif',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4d6a10' : '#6f9a0c'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Full-Bleed CircularGallery of Verified Metrics */}
      {!showChart && galleryItems.length > 0 && (
        <div className="relative w-full h-[440px] sm:h-[480px] -mt-4 sm:-mt-6 z-10">
          <CircularGallery
            items={galleryItems}
            bend={5.5}
            textColor="#121410"
            font='bold 18px "Inter Tight", sans-serif'
            borderRadius={0.05}
            scrollEase={0.17}
            fadeEdges={0.18}
            autoScroll={0.7}
            itemSize={1.06}
            itemAspect={0.79}
            gap={0.32}
            shadow={0.22}
          />
        </div>
      )}
    </section>
  );
};
