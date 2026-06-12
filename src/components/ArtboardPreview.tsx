import React, { useState } from 'react';
import { CSVData, GeneratorSettings } from '../types';
import { 
  Layers, 
  MousePointer, 
  Sparkles, 
  Copy, 
  Check, 
  Compass, 
  Maximize2, 
  Minimize2,
  Bookmark,
  Printer,
  Grid
} from 'lucide-react';

interface ArtboardPreviewProps {
  csvData: CSVData;
  settings: GeneratorSettings;
  activeTemplatePreset?: string; // 'segnaposto' | 'menu' | 'buste' | 'tableau'
}

export default function ArtboardPreview({ 
  csvData, 
  settings,
  activeTemplatePreset = 'segnaposto' 
}: ArtboardPreviewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (csvData.rows.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#E8E1D8] shadow-luxury p-12 text-center" id="artboard-empty">
        <Sparkles className="w-10 h-10 text-[#9E958E] mx-auto mb-4 animate-bounce" />
        <p className="text-sm font-serif font-bold text-[#4D4742]">Nessun dato caricato nel database</p>
        <p className="text-xs text-[#9E958E] mt-1 max-w-sm mx-auto">
          Torna allo Step 1 per caricare un file CSV o seleziona un preset rapidi per sbloccare questa anteprima premium.
        </p>
      </div>
    );
  }

  // Risolve i valori sostituiti nel testo finale
  const getSimulatedMergedText = (row: Record<string, string>) => {
    let template = settings.targetPlaceholder || '{{Nome}}';
    let replaced = template;

    csvData.headers.forEach(h => {
      replaced = replaced.replace(`{{${h}}}`, row[h] || '');
      replaced = replaced.replace(`{${h}}`, row[h] || '');
      replaced = replaced.replace(`{{${h.toUpperCase()}}}`, row[h] || '');
      replaced = replaced.replace(`{{${h.toLowerCase()}}}`, row[h] || '');
    });

    return replaced;
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 75));

  // Prepara record da visualizzare
  const previewRows = csvData.rows.slice(0, 6); // visualizziamo fino ad un massimo di 6 per preservare lo spazio

  return (
    <div className="bg-white rounded-3xl border border-[#E8E1D8] shadow-luxury overflow-hidden" id="artboard-preview-panel">
      
      {/* 1. INTERSTAZIONE WORKSPACE ILLUSTRATOR */}
      <div className="px-6 py-5 border-b border-[#E8E1D8] flex items-center justify-between flex-wrap gap-4 bg-white">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-[#868E75]/10 text-[#868E75] rounded-xl border border-[#868E75]/10">
            <Compass className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#4D4742]">
              Anteprima Illustrator
            </h3>
            <p className="text-[10px] text-[#9E958E] uppercase tracking-wider font-mono mt-0.5">
              Simulatore vettoriale di stampa e posizionamento dei testi uniti
            </p>
          </div>
        </div>

        {/* Strumenti di Zoom & Preset */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center bg-[#F7F4EF] border border-[#E8E1D8] rounded-xl overflow-hidden px-1 py-1">
            <button 
              onClick={handleZoomOut}
              className="px-2.5 py-1 text-xs font-bold text-[#6E6660] hover:bg-white rounded-lg transition-all cursor-pointer"
              title="Riduci zoom"
            >
              -
            </button>
            <span className="px-3 text-[10px] font-mono font-bold text-[#4D4742] bg-white rounded-md border border-[#E8E1D8]/50 shadow-3xs py-0.5">
              {zoomLevel}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="px-2.5 py-1 text-xs font-bold text-[#6E6660] hover:bg-white rounded-lg transition-all cursor-pointer"
              title="Aumenta zoom"
            >
              +
            </button>
          </div>

          <div className="text-[10px] bg-[#868E75]/10 text-[#868E75] border border-[#868E75]/20 font-black px-3 py-1.5 rounded-lg uppercase tracking-widest font-sans flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 animate-pulse" />
            <span>Workspace Attivo</span>
          </div>
        </div>
      </div>

      {/* 2. REALISTICO WORKSPACE GRIGIO ADOBE ILLUSTRATOR */}
      <div className="p-6 bg-[#EAEAEC] border-b border-[#E8E1D8] relative overflow-hidden transition-all duration-300">
        
        {/* Righello orizzontale superiore in stile Illustrator */}
        <div className="absolute top-0 left-8 right-0 h-4 bg-[#F0F0F2] border-b border-[#C8C8C8] flex items-center text-[8px] font-mono text-[#7A7A7A] select-none z-10">
          <div className="px-2 border-r border-[#C8C8C8] w-24">0 mm</div>
          <div className="px-2 border-r border-[#C8C8C8] w-24">50 mm</div>
          <div className="px-2 border-r border-[#C8C8C8] w-24">100 mm</div>
          <div className="px-2 border-r border-[#C8C8C8] w-24">150 mm</div>
          <div className="px-2 border-r border-[#C8C8C8] w-24">200 mm</div>
          <div className="px-2 border-r border-[#C8C8C8] w-24">250 mm</div>
          <div className="px-2 border-r border-[#C8C8C8] w-24">300 mm</div>
        </div>

        {/* Righello verticale sinistro in stile Illustrator */}
        <div className="absolute top-4 left-0 bottom-0 w-8 bg-[#F0F0F2] border-r border-[#C8C8C8] flex flex-col items-center text-[8px] font-mono text-[#7A7A7A] select-none py-2 z-10">
          <div className="h-20 border-b border-[#C8C8C8] w-full text-center pt-1">0 mm</div>
          <div className="h-20 border-b border-[#C8C8C8] w-full text-center pt-1">50 mm</div>
          <div className="h-20 border-b border-[#C8C8C8] w-full text-center pt-1">100 mm</div>
          <div className="h-20 border-b border-[#C8C8C8] w-full text-center pt-1">150 mm</div>
        </div>

        {/* Contenitore interno con griglia pixel per simulare l'artboard */}
        <div 
          className="ml-8 mt-4 bg-[#D1D1D5] min-h-[460px] rounded-xl border border-[#BABABA] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-inner uppercase-none"
          style={{ 
            backgroundImage: 'radial-gradient(#b0b0b8 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center center'
          }}
        >
          
          {/* Angoli grafici dell'artboard */}
          <div className="absolute top-2 left-2 text-[9px] font-mono text-[#7D7D82] tracking-wider select-none normal-case">
            Artboard 1 • Griglia di Unione {activeTemplatePreset.toUpperCase()}
          </div>
          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#7D7D82] tracking-wider select-none normal-case">
            Formato: SRA3 (320 x 450 mm)
          </div>

          {/* Indicatori della linea di lettura sequenziale */}
          <div className="w-full flex justify-between items-center mb-6 text-[9px] text-[#4D4742] font-bold tracking-widest border-b border-[#BABABA] pb-2 z-10 normal-case">
            <span className="flex items-center gap-1">
              <MousePointer className="w-3.5 h-3.5 text-[#A85E52]" />
              Duplicazione: Alto → Basso, Sinistra → Destra (Ordine automatico)
            </span>
            <span className="flex items-center gap-1 text-[#868E75]">
              <Printer className="w-3.5 h-3.5" />
              Margine di Rifilo: 3mm Attivo
            </span>
          </div>

          {/* ========================================================= */}
          {/* DINAMIC LAYOUT PREMIER PER OGNI TIPO DI STATIONERY */}
          {/* ========================================================= */}
          
          {/* 2A. PRESET: SEGNAPOSTO (Cartoncino con bordo oro e script morbido) */}
          {activeTemplatePreset === 'segnaposto' && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-2 z-10 font-sans" id="grid-parent-segnaposto">
              {previewRows.map((row, idx) => {
                const textValue = getSimulatedMergedText(row);
                const isHovered = hoveredIndex === idx;
                const isCopied = copiedIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`relative aspect-[3/2] bg-[#FCFBF8] border rounded-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between p-4 shadow-luxury select-none ${
                      isHovered
                        ? 'border-[#4D90FE] ring-2 ring-[#4D90FE]/15 scale-[1.03] z-20'
                        : 'border-[#E8E1D8] hover:border-[#4D90FE]'
                    }`}
                    onClick={() => handleCopyText(textValue, idx)}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Illustrator anchor point styling */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />

                    {/* Double elegant watercolor circle accent and golden outline */}
                    <div className="absolute inset-2 border border-[#A85E52]/20 rounded-md pointer-events-none" />
                    <div className="absolute inset-2.5 border border-[#868E75]/15 rounded-md pointer-events-none" />

                    {/* Meta badge */}
                    <div className="flex justify-between items-center text-[8px] font-mono text-[#9E958E] uppercase pb-1 border-b border-[#E8E1D8]/50 z-10">
                      <span>Card #{idx + 1}</span>
                      <span className="text-[#868E75] font-bold">Segnaposto</span>
                    </div>

                    {/* Content */}
                    <div className="text-center py-2 flex flex-col items-center justify-center flex-1 z-10">
                      
                      {/* Elegante font calligrafico romantico per il nome sul segnaposto */}
                      <span className="font-script text-[28px] text-[#4D4742] tracking-wide block leading-none mb-1">
                        {textValue || 'Invitato'}
                      </span>
                      
                      {row.Tavolo && (
                        <span className="font-serif italic text-[10px] tracking-wider text-[#868E75] mt-1.5 font-semibold">
                          {row.Tavolo}
                        </span>
                      )}
                    </div>

                    {/* Footer card */}
                    <div className="flex justify-between items-center text-[7.5px] font-mono text-[#9E958E] pt-1 border-t border-[#E8E1D8]/30">
                      <span className="truncate max-w-[80px]">Vector Layer</span>
                      <span className="text-xxs uppercase tracking-wider text-[#868E75] font-bold inline-flex items-center gap-0.5">
                        {isCopied ? <Check className="w-2.5 h-2.5" /> : null}
                        {isCopied ? 'Copiato' : 'Copia'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* 2B. PRESET: MENÙ (Elegante listato banchetto) */}
          {activeTemplatePreset === 'menu' && (
            <div className="w-full flex justify-center gap-6 my-2 z-10 font-sans" id="grid-parent-menu">
              {csvData.rows.slice(0, 3).map((row, idx) => {
                const textValue = getSimulatedMergedText(row);
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`relative w-[190px] min-h-[350px] bg-[#FCFBF8] border rounded-xl transition-all duration-300 p-5 flex flex-col justify-between shadow-luxury select-none ${
                      isHovered
                        ? 'border-[#4D90FE] ring-2 ring-[#4D90FE]/15 scale-[1.02] z-20'
                        : 'border-[#E8E1D8] hover:border-[#4D90FE]'
                    }`}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Illustrator selection */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />

                    {/* Elegant menu borders */}
                    <div className="absolute inset-2 border border-[#868E75]/30 rounded-lg pointer-events-none" />

                    <div className="text-center space-y-4 flex-1 flex flex-col justify-between pt-2">
                      <div className="space-y-1">
                        <span className="font-script text-xl text-[#A85E52] leading-none block">Il Banchetto</span>
                        <h4 className="font-serif text-xs font-bold text-[#4D4742] tracking-widest uppercase">
                          Nozze di Sofia & Matteo
                        </h4>
                      </div>

                      {/* Portata dinamica caricata */}
                      <div className="space-y-2 p-1 border-y border-[#E8E1D8]/40 py-4 my-2">
                        <span className="text-[8px] font-mono text-[#868E75] uppercase tracking-wider block font-bold">
                          {row.Categoria || 'Portata principale'}
                        </span>
                        <p className="font-serif text-[12px] font-bold text-[#4D4742] tracking-wide leading-relaxed italic">
                          "{textValue || 'Risotto ai funghi e tartufo'}"
                        </p>
                        {row.Nota_Intolleranza && row.Nota_Intolleranza !== 'Nessuna' && (
                          <span className="text-[7.5px] font-sans px-1.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-md font-bold inline-block">
                            ⚠ {row.Nota_Intolleranza}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-[7.5px] text-[#9E958E] leading-relaxed uppercase tracking-wider">
                          Vini in Abbinamento • Cantina Chianti
                        </p>
                        <span className="font-script text-base text-[#868E75]">Sage Paper Wedding</span>
                      </div>
                    </div>

                    <div className="text-[7px] text-center font-mono text-[#9E958E] mt-3 border-t border-[#E8E1D8]/45 pt-1">
                      Illustrator Menu Template CC
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2C. PRESET: BUSTA (Lettera con indirizzo elegante) */}
          {activeTemplatePreset === 'buste' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-2 z-10 font-sans" id="grid-parent-buste">
              {csvData.rows.slice(0, 4).map((row, idx) => {
                const textValue = getSimulatedMergedText(row);
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`relative aspect-[16/10] bg-[#FCFBF8] border rounded-2xl transition-all duration-300 p-6 flex flex-col justify-between shadow-luxury select-none ${
                      isHovered
                        ? 'border-[#4D90FE] ring-2 ring-[#4D90FE]/15 scale-[1.02] z-20'
                        : 'border-[#E8E1D8] hover:border-[#4D90FE]'
                    }`}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Illustrator selection */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />

                    {/* Envelope flap aesthetic styling */}
                    <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-[#F7F4EF] to-[#FCFBF8] border-b border-[#E8E1D8]/30 rounded-t-2xl pointer-events-none" />

                    {/* Wax seal simulation decoration */}
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#A85E52] border border-[#A85E52]/90 flex items-center justify-center text-[10px] font-script text-white/95 italic rotate-12 opacity-80" shadow-3xs="true">
                      S&M
                    </div>

                    <div className="py-2 space-y-1 text-left">
                      <span className="text-[7px] font-mono tracking-wider font-extrabold text-[#868E75] uppercase block">
                        Mittente: S. & M. — Via della Spiga 15, Milano
                      </span>
                    </div>

                    {/* Centered beautiful calligraphic addressed text */}
                    <div className="text-center py-4 flex-1 flex flex-col justify-center">
                      <p className="font-script text-3xl text-[#4D4742] tracking-wide leading-none select-none">
                        {textValue || 'Gentilissimi Invitati'}
                      </p>
                      
                      {row.Indirizzo && (
                        <p className="font-serif italic text-[11px] tracking-wide text-[#6E6660] mt-2 border-t border-[#E8E1D8]/40 pt-1.5 max-w-[200px] mx-auto leading-relaxed">
                          {row.Indirizzo}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[7px] font-mono text-[#9E958E] border-t border-[#E8E1D8]/30 pt-1">
                      <span>Busta Nozze 120x180mm</span>
                      <span className="text-[#A85E52] font-semibold">ExtendScript Target</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* 2D. PRESET: TABLEAU (Suddivisione dei tavoli per cartoncini grandi) */}
          {activeTemplatePreset === 'tableau' && (
            <div className="w-full flex justify-center gap-5 my-2 z-10 font-sans" id="grid-parent-tableau">
              {csvData.rows.slice(0, 3).map((row, idx) => {
                const textValue = getSimulatedMergedText(row);
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`relative w-[190px] min-h-[340px] bg-[#FCFBF8] border rounded-xl p-5 flex flex-col justify-between shadow-luxury select-none transition-all duration-300 ${
                      isHovered
                        ? 'border-[#4D90FE] ring-2 ring-[#4D90FE]/15 scale-[1.02] z-20'
                        : 'border-[#E8E1D8] hover:border-[#4D90FE]'
                    }`}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Illustrator selection */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#4D90FE] z-10" />

                    <div className="absolute inset-2 border border-[#868E75]/25 rounded-md pointer-events-none" />

                    <div className="text-center py-2 flex flex-col items-center flex-1 justify-between">
                      {/* Titolo tavolo */}
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-[#A85E52] uppercase tracking-widest font-bold">
                          Tableau de Mariage
                        </span>
                        <h4 className="font-serif text-[15px] font-black text-[#4D4742] tracking-normal leading-tight">
                          {textValue || 'Tavolo Orchidea'}
                        </h4>
                      </div>

                      {/* Lista di invitati a quel tavolo */}
                      <div className="w-full my-4 py-3 border-y border-[#E8E1D8]/40 space-y-1.5">
                        {row.Invitati ? (
                          row.Invitati.split(',').map((inv, i) => (
                            <span key={i} className="font-serif text-[10.5px] text-[#6E6660] italic block tracking-wide">
                              {inv.trim()}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="text-[10px] text-[#9E958E] italic block">Zia Caterina</span>
                            <span className="text-[10px] text-[#9E958E] italic block">Nonna Isa</span>
                            <span className="text-[10px] text-[#9E958E] italic block">Zio Franco</span>
                          </>
                        )}
                      </div>

                      <div className="text-[8px] font-mono text-[#868E75] font-bold">
                        {row.Numero_Persone || '3'} Persone Configurate
                      </div>
                    </div>

                    <div className="text-[6.5px] text-center text-[#9E958E] border-t border-[#E8E1D8]/30 pt-1 font-mono uppercase">
                      Double Border Elegant Layout
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* 3. CAPTION EXPLANATION BELOW WALKING THE USER STEP-BY-STEP */}
      <div className="px-6 py-4 bg-[#FCFBF8] border-t border-[#E8E1D8] flex items-center justify-between text-xxs text-[#9E958E] font-medium flex-wrap gap-3">
        <span className="flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-[#868E75]" />
          <span>* Passa sopra i cartigli per vedere le coordinate e le linee vettoriali di selezione del TextFrame.</span>
        </span>
        <span className="italic">
          Premi &quot;Copia&quot; per salvare istantaneamente una stringa sostitutiva negli appunti.
        </span>
      </div>

    </div>
  );
}
