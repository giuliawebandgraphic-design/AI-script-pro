import React from 'react';
import { CSVData, GeneratorSettings } from '../types';
import { ListFilter, MapPin, Milestone, Sparkles } from 'lucide-react';

interface PreviewTableProps {
  csvData: CSVData;
  settings: GeneratorSettings;
}

export default function PreviewTable({ csvData, settings }: PreviewTableProps) {
  if (csvData.rows.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FCFBF8] rounded-3xl border border-[#E8E1D8] shadow-luxury p-6" id="preview-simulation-panel">
      <div className="space-y-4">
        
        {/* Intestazione */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E1D8]/50">
          <span className="p-2 bg-[#868E75]/10 text-[#868E75] rounded-xl border border-[#868E75]/15">
            <ListFilter className="w-4 h-4 text-[#868E75]" style={{ transform: 'none' }} />
          </span>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#4D4742]">
              Regole di Unione Dati su Tavole d&apos;Arte
            </h3>
            <p className="text-[9px] font-mono text-[#9E958E] uppercase tracking-wider">
              Come verranno mappati i record sul documento Adobe Illustrator
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Regola 1 */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D8] text-xs text-[#6E6660] space-y-2">
            <div className="font-bold text-[#4D4742] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#A85E52]/10 text-[#A85E52] flex items-center justify-center font-mono text-[10px] font-bold">A</span>
              <span>Distribuzione Sequenziale</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Lo script rileverà tutte le istanze attive di <code className="font-mono bg-[#F7F4EF] border border-[#E8E1D8] text-[#A85E52] px-1.5 py-0.5 rounded text-[11px] font-bold">{settings.targetPlaceholder || '{{Nome}}'}</code>. Le sostituirà una ad una procedendo in perfetto ordine sequenziale dal tuo file di origine.
            </p>
          </div>

          {/* Regola 2 */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D8] text-xs text-[#6E6660] space-y-2">
            <div className="font-bold text-[#4D4742] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#868E75]/10 text-[#868E75] flex items-center justify-center font-mono text-[10px] font-bold">B</span>
              <span>Nessuna Interruzione del Layout</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              L&apos;unione rispetterà rigorosamente i font scelti, i colori di livello e le inclinazioni. I testi uniti conserveranno la loro splendida impaginazione in formato vettoriale, pronti per essere salvati in PDF/X o inviati alle stampanti.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
