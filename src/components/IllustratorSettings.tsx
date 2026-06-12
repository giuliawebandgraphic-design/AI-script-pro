import React, { useState, useEffect } from 'react';
import { GeneratorSettings, CSVData } from '../types';
import { 
  Sparkles, 
  Settings, 
  Milestone, 
  Check, 
  Plus, 
  Trash2, 
  HelpCircle,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  Blocks,
  Copy,
  FolderSync
} from 'lucide-react';

interface IllustratorSettingsProps {
  settings: GeneratorSettings;
  onSettingsChange: (newSettings: GeneratorSettings) => void;
  csvData: CSVData;
}

export default function IllustratorSettings({
  settings,
  onSettingsChange,
  csvData,
}: IllustratorSettingsProps) {
  
  const headers = csvData.headers.length > 0 ? csvData.headers : ['Nome', 'Cognome', 'Tavolo'];

  // Cerca di rilevare i campi più sensati all'inizio
  const firstCol = headers[0] || 'Nome';
  const secondCol = headers[1] || 'Cognome';
  const tableCol = headers.find(h => h.toLowerCase().includes('tavolo') || h.toLowerCase().includes('categ') || h.toLowerCase().includes('indi') || h.toLowerCase().includes('note')) || headers[2] || 'Tavolo';

  // 1. Quanti campi vogliamo configurare attivamente? (Imposta per default in base alle colonne caricate)
  const [activeCount, setActiveCount] = useState<number>(() => {
    const ph = settings.targetPlaceholder;
    const matches = ph.match(/\{\{([^}]+)\}\}/g) || [];
    if (matches.length > 1) return Math.min(matches.length, 5);
    if (headers.length >= 3) return 3;
    if (headers.length >= 2) return 2;
    return 1;
  });

  // 2. Mappatura dei singoli slot
  const [slots, setSlots] = useState<string[]>(() => {
    const ph = settings.targetPlaceholder;
    const matches = (ph.match(/\{\{([^}]+)\}\}/g) || []).map(m => m.replace(/[\{\}]/g, ''));
    
    // Inizializza con i tag trovati nella formula corrente di default
    const initialSlots: string[] = [];
    if (matches.length > 0) {
      matches.forEach(m => {
        // Verifica se la colonna esiste, altrimenti usa quella più simile
        const matchedHeader = headers.find(h => h.toLowerCase() === m.toLowerCase()) || m;
        initialSlots.push(matchedHeader);
      });
    }

    // Se non abbiamo riempito abbastanza slot, andiamo in ordine per intestazioni del CSV
    headers.forEach(h => {
      if (initialSlots.length < 5 && !initialSlots.includes(h)) {
        initialSlots.push(h);
      }
    });

    // Se mancano ancora, riempi con vuoto
    while (initialSlots.length < 5) {
      initialSlots.push('');
    }

    return initialSlots;
  });

  // 3. Stile di visualizzazione in Illustrator: Uniti (Formula unica) o Separati (Caselle distinte)
  const [mergeStyle, setMergeStyle] = useState<'combined' | 'separated'>(() => {
    // Se il target corrente contiene spazi o separatori tra parentesi graffe, di default è combinato
    const ph = settings.targetPlaceholder;
    const parts = ph.match(/\{\{([^}]+)\}\}/g) || [];
    return parts.length > 1 ? 'combined' : 'separated';
  });

  // Copia negli appunti rapida dei tag per Illustrator
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  
  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // 4. Sincronizza lo stato locale con le impostazioni globali del progetto (settings.targetPlaceholder)
  useEffect(() => {
    const activeSlots = slots.slice(0, activeCount).filter(s => s && s.trim() !== '');
    if (activeSlots.length === 0) return;

    let newPlaceholder = '';
    if (mergeStyle === 'combined') {
      // Unisci tutti in una formula unica (es. {{Nome}} {{Cognome}} - {{Tavolo}})
      newPlaceholder = activeSlots.map(s => `{{${s}}}`).join(' ');
    } else {
      // Nel caso di caselle separate, usiamo il primo campo selezionato come target primario di riferimento dello script
      newPlaceholder = `{{${activeSlots[0]}}}`;
    }

    if (settings.targetPlaceholder !== newPlaceholder) {
      onSettingsChange({
        ...settings,
        targetPlaceholder: newPlaceholder
      });
    }
  }, [activeCount, slots, mergeStyle]);

  // Gestore del cambio di selezione per uno specifico slot
  const handleSlotChange = (index: number, value: string) => {
    const updated = [...slots];
    updated[index] = value;
    setSlots(updated);
  };

  // Risolve i valori sostituiti nel testo finale per i primi 4 record
  const getSimulatedMergedText = (row: Record<string, string>) => {
    if (!row) return '';
    
    // Se lo stile di fusione è combinato, compila l'intera formula stringa
    if (mergeStyle === 'combined') {
      let formula = slots.slice(0, activeCount).filter(s => s && s.trim() !== '').map(s => `{{${s}}}`).join(' ');
      let replaced = formula;
      headers.forEach(h => {
        const val = row[h] || '';
        replaced = replaced.split(`{{${h}}}`).join(val);
        replaced = replaced.split(`{${h}}`).join(val);
      });
      return replaced;
    } else {
      // Altrimenti restituisce solo il campo principale (Slot 1)
      const primaryHeader = slots[0];
      return row[primaryHeader] || '';
    }
  };

  // Seleziona i primi 4 record per il widget di anteprima live
  const previewRows = csvData.rows.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="illustrator-settings-panel">
      
      {/* Colonna Sinistra: Configurazione Selettiva Guidata Avanzata */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Card Principale Mappatura */}
        <div className="bg-[#FCFBF8] rounded-3xl border border-[#E8E1D8] shadow-luxury p-6 space-y-6">
          
          <div className="border-b border-[#E8E1D8]/50 pb-5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#A85E52]/10 text-[#A85E52] rounded text-[9.5px] uppercase tracking-wider font-bold font-sans">
                Configurazione Avanzata
              </span>
              <span className="px-2 py-0.5 bg-[#868E75]/10 text-[#868E75] rounded text-[9.5px] uppercase tracking-wider font-bold font-sans">
                {activeCount} Tipologie Attive
              </span>
            </div>
            <h2 className="text-serif font-serif text-lg font-bold text-[#4D4742] mt-1.5">
              Scegli quante e quali tipologie di dati inserire
            </h2>
            <p className="text-xs text-[#9E958E] mt-1 font-sans">
              Configura i campi del database CSV e seleziona come mapparli nel modello di Illustrator.
            </p>
          </div>

          {/* 1. SELETTORE QUANTITÀ CAMPI */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4D4742] block font-sans">
              1. Quante tipologie di dati vuoi unire?
            </label>
            <div className="grid grid-cols-5 gap-2" id="fields-quantity-selector">
              {[1, 2, 3, 4, 5].map((num) => {
                const isActive = activeCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setActiveCount(num)}
                    className={`py-3.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isActive
                        ? 'border-[#A85E52] bg-[#A85E52]/5 text-[#A85E52] scale-[1.01] shadow-2xs'
                        : 'border-[#E8E1D8] bg-white text-[#9E958E] hover:border-[#6E6660]/40 hover:text-[#4D4742]'
                    }`}
                  >
                    <span className="text-base font-black font-sans leading-none">{num}</span>
                    <span className="text-[8.5px] uppercase tracking-widest font-sans font-bold leading-none shrink-0">
                      {num === 1 ? 'Campo' : 'Campi'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MAPPATURA SINGOLI SLOT DINAMICI */}
          <div className="space-y-3.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4D4742] block font-sans">
              2. Assegna le colonne alle tipologie di dati:
            </label>
            
            <div className="space-y-3" id="active-slots-mapper">
              {Array.from({ length: activeCount }).map((_, idx) => {
                const currentVal = slots[idx] || '';
                const fallbackExample = csvData.rows[0]?.[currentVal] || '(Vuoto)';

                return (
                  <div 
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-[#E8E1D8] rounded-xl gap-3 hover:border-[#868E75]/40 transition-colors shadow-3xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#868E75]/10 border border-[#868E75]/10 text-[#868E75] flex items-center justify-center text-[10px] font-mono font-bold">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[#4D4742] block">
                          Campo Unione {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5" onClick={() => handleCopyTag(`{{${currentVal}}}`)}>
                          <span className="text-[9px] text-[#A85E52] font-mono bg-[#A85E52]/5 border border-[#A85E52]/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-[#A85E52]/10 transition-colors flex items-center gap-1">
                            {"{{" + (currentVal || '...') + "}}"}
                            <Copy className="w-2.5 h-2.5" />
                          </span>
                          {copiedTag === `{{${currentVal}}}` && (
                            <span className="text-[7.5px] text-[#868E75] font-bold uppercase tracking-widest">Copiato!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 max-w-xs sm:w-auto flex flex-col items-end gap-1">
                      <select
                        value={currentVal}
                        onChange={(e) => handleSlotChange(idx, e.target.value)}
                        className="w-full text-xs font-sans font-bold bg-[#FCFBF8] border border-[#E8E1D8] text-[#4D4742] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#868E75]/80 active:border-[#868E75]"
                      >
                        <option value="">-- Seleziona una Colonna --</option>
                        {headers.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-[8.5px] text-[#9E958E] italic max-w-[200px] truncate">
                        Esempio: &ldquo;{fallbackExample}&rdquo;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SCELTA STILE DI COMPOSIZIONE GRAFICA */}
          <div className="space-y-3 bg-white border border-[#E8E1D8] p-4.5 rounded-2xl">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4D4742] block font-sans">
              3. Come disponi questi {activeCount} campi in Illustrator?
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="merge-layout-composition-options">
              {/* Opzione Separati */}
              <button
                type="button"
                onClick={() => setMergeStyle('separated')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex gap-3 ${
                  mergeStyle === 'separated'
                    ? 'border-[#868E75] bg-[#868E75]/5 text-[#4D4742]'
                    : 'border-[#E8E1D8] bg-[#FCFBF8] hover:border-[#6E6660]/30'
                }`}
              >
                <Blocks className={`w-5 h-5 shrink-0 mt-0.5 ${mergeStyle === 'separated' ? 'text-[#868E75]' : 'text-[#9E958E]'}`} />
                <div>
                  <span className="text-xs font-bold block">Caselle di Testo Separate</span>
                  <span className="text-[9.5px] text-[#9E958E] font-sans mt-0.5 block leading-normal">
                    Ogni campo ha la sua casella separata con il suo tag (es. una scatola per l&apos;ospite e una per il tavolo).
                  </span>
                </div>
              </button>

              {/* Opzione Uniti */}
              <button
                type="button"
                onClick={() => setMergeStyle('combined')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex gap-3 ${
                  mergeStyle === 'combined'
                    ? 'border-[#868E75] bg-[#868E75]/5 text-[#4D4742]'
                    : 'border-[#E8E1D8] bg-[#FCFBF8] hover:border-[#6E6660]/30'
                }`}
              >
                <FolderSync className={`w-5 h-5 shrink-0 mt-0.5 ${mergeStyle === 'combined' ? 'text-[#868E75]' : 'text-[#9E958E]'}`} />
                <div>
                  <span className="text-xs font-bold block">Fondi in un Blocco Unico</span>
                  <span className="text-[9.5px] text-[#9E958E] font-sans mt-0.5 block leading-normal">
                    I filtri vengono uniti in un&apos;unica casella di testo (es. Nome e Tavolo scritti a capo nello stesso blocco).
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Prompt d&apos;aiuto per Illustrator */}
          <div className="bg-[#868E75]/5 border border-[#868E75]/15 p-4 rounded-xl flex gap-3 text-xs text-[#6E6660] leading-relaxed">
            <Milestone className="w-5 h-5 text-[#868E75] shrink-0 mt-0.5" />
            <div className="font-sans">
              <p className="font-bold text-[#4D4742]">💡 Come allineare i segnaposto su Illustrator:</p>
              {mergeStyle === 'separated' ? (
                <div className="mt-1 space-y-1">
                  <p>Disegna caselle di testo indipendenti e inserisci all&apos;interno i rispettivi tag dei campi attivi:</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {slots.slice(0, activeCount).filter(s => s).map(s => (
                      <code key={s} className="bg-white border border-[#E8E1D8] text-[#A85E52] px-1.5 py-0.5 rounded font-mono font-bold text-[10.5px]">
                        {"{{" + s + "}}"}
                      </code>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  Componi la casella di testo nel tuo template grafico con la formula combinata complessiva: 
                  <code className="bg-white border border-[#E8E1D8] text-[#A85E52] px-1.5 py-0.5 rounded font-mono font-bold text-[10.5px] mt-1.5 inline-block">
                    {settings.targetPlaceholder}
                  </code>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Colonna Destra: PREVIEW LIVE AUTOMATICA SUI CARTONCINI */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-[#FCFBF8] rounded-3xl border border-[#E8E1D8] shadow-luxury p-6 flex flex-col justify-between min-h-[510px]">
          
          <div className="border-b border-[#E8E1D8]/50 pb-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#868E75] uppercase tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#868E75] animate-spin" style={{ animationDuration: '3s' }} />
              Live Preview Istantanea
            </div>
            <h2 className="text-serif font-serif text-lg font-bold text-[#4D4742] mt-0.5">
              Simulazione Mappatura
            </h2>
            <p className="text-xs text-[#9E958E] mt-1 font-sans">
              Visualizza in tempo reale come verranno combinati o separati i campi sui primi 4 record:
            </p>
          </div>

          {/* Visualizzatore dei cartoncini di anteprima di matrimonio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6" id="settings-interactive-preview-list">
            {previewRows.map((row, index) => {
              const mainText = getSimulatedMergedText(row);
              const activeMapped = slots.slice(0, activeCount).filter(s => s && s.trim() !== '');

              return (
                <div 
                  key={index}
                  className="bg-[#FCFBF8] border border-[#E8E1D8] hover:border-[#A85E52]/40 rounded-xl p-4 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all text-center min-h-[135px]"
                >
                  <div className="absolute top-1 left-1 bottom-1 right-1 border border-[#E8E1D8]/40 rounded-lg pointer-events-none" />
                  
                  <div className="relative z-1 flex justify-between items-center text-[8.5px] font-mono tracking-wider text-[#9E958E] uppercase pb-1.5 border-b border-[#E8E1D8]/30 mb-2">
                    <span>Etichetta #{index+1}</span>
                    <span className="px-1.5 py-0.5 bg-[#868E75]/10 text-[#868E75] rounded text-[7px] font-bold">
                      {mergeStyle === 'combined' ? 'Unito' : 'Multi-testo'}
                    </span>
                  </div>

                  <div className="relative z-1 py-1.5 flex-1 flex flex-col justify-center items-center gap-1 font-sans">
                    {/* Se è unito nello stesso blocco */}
                    {mergeStyle === 'combined' ? (
                      <span className="font-serif text-[13.5px] font-bold text-[#4D4742] tracking-wide italic whitespace-normal">
                        {mainText || <span className="text-[#9E958E] italic text-xs">(Nessun dato)</span>}
                      </span>
                    ) : (
                      /* Se sono blocchi di testo indipendenti */
                      <div className="space-y-1 w-full text-center">
                        {activeMapped.map((colName, slotIdx) => {
                          const val = row[colName] || '';
                          return (
                            <div key={slotIdx} className="leading-tight">
                              {slotIdx === 0 ? (
                                <span className="font-serif text-[14px] font-bold text-[#4D4742] tracking-wide italic block">
                                  {val || <span className="text-gray-300 italic">(Campo 1 vuoto)</span>}
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-widest text-[#868E75] font-bold font-sans block mt-0.5">
                                  {val}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-[#F7F4EF]/75 rounded-xl border border-[#E8E1D8] text-[10px] text-[#6E6660] leading-relaxed font-sans">
            <span className="font-bold text-[#4D4742] block mb-0.5">✨ Sincronizzazione Perfetta:</span>
            Facendo clic e modificando le colonne o modificando il numero di campi a sinistra, queste anteprime stampate si modificano istantaneamente record per record.
          </div>

        </div>

      </div>

    </div>
  );
}
