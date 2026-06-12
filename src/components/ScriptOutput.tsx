import React, { useState } from 'react';
import { CSVData, GeneratorSettings } from '../types';
import { generateIllustratorJSX } from '../utils/jsxGenerator';
import { 
  Download, 
  Copy, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ThumbsUp,
  FileCheck, 
  MonitorPlay,
  Share2
} from 'lucide-react';

interface ScriptOutputProps {
  csvData: CSVData;
  settings: GeneratorSettings;
}

export default function ScriptOutput({ csvData, settings }: ScriptOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  // Stati per la gestione degli accordion "Scopri di più"
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => (prev === id ? null : id));
  };

  const scriptCode = generateIllustratorJSX(csvData, settings);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      // Scarica automaticamente lo script per immediatezza
      handleDownload();
    }, 1200);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    const safeProjectName = (settings.projectName || 'unione')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_');
    link.download = `illustrator_pro_${safeProjectName}.jsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="script-output-container">
      
      {/* COLONNA SINISTRA: CTA DI GENERAZIONE SCRIPT & STATO SUCCESSIVO */}
      <div className="lg:col-span-7 space-y-6">
        
        <div className="bg-[#FCFBF8] rounded-3xl border border-[#E8E1D8] shadow-luxury p-8 flex flex-col justify-between min-h-[420px]" id="generation-main-card">
          
          {/* STATO 1: PRONTO ALL'USO */}
          {!isGenerating && !isGenerated && (
            <div className="space-y-6 my-auto text-center py-6">
              <div className="w-16 h-16 bg-[#868E75]/10 text-[#868E75] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#868E75]/25">
                <Sparkles className="w-8 h-8 animate-pulse text-[#868E75]" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#A85E52] uppercase tracking-wider font-bold">
                  Compilazione file ExtendScript
                </span>
                <h2 className="font-serif text-2xl font-black text-[#4D4742]">
                  Il tuo script è pronto
                </h2>
                <p className="text-xs text-[#9E958E] max-w-sm mx-auto leading-relaxed">
                  L&apos;unione dei campi è stata calcolata correttamente. Generando il file potrai avviarlo direttamente in Adobe Illustrator offline.
                </p>
              </div>

              {/* Bottoni di Azione */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3.5 max-w-sm mx-auto">
                <button
                  onClick={triggerGeneration}
                  disabled={csvData.rows.length === 0}
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 bg-[#A85E52] hover:bg-[#A85E52]/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:shadow-md cursor-pointer"
                  id="generate-script-btn-primary"
                >
                  <Download className="w-4 h-4 text-current" />
                  <span>Genera Script (.JSX)</span>
                </button>

                <button
                  onClick={handleCopy}
                  disabled={csvData.rows.length === 0}
                  className="flex items-center justify-center gap-2 py-4 px-6 bg-white hover:bg-[#F7F4EF]/55 text-[#4D4742] border border-[#E8E1D8] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  id="copy-script-btn-secondary"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#868E75]" />
                      <span className="text-[#868E75] font-bold">Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#6E6660]" />
                      <span>Copia codice</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reassurance Metadata */}
              <div className="pt-2 text-[11px] font-medium text-[#868E75] flex items-center justify-center gap-4">
                <span>✔ Compatibile con Adobe Illustrator 2020+</span>
                <span className="text-[#9E958E] font-normal">•</span>
                <span className="text-[#9E958E] font-mono">Elaborazione: ~2 sec</span>
              </div>
            </div>
          )}

          {/* STATO 2: IN GENERAZIONE (Loader elegante) */}
          {isGenerating && (
            <div className="space-y-6 my-auto text-center py-10" id="generating-loader-state">
              <div className="w-16 h-16 border-4 border-t-[#A85E52] border-r-transparent border-l-transparent border-b-[#868E75]/30 rounded-full animate-spin mx-auto mb-4" />
              <div className="space-y-1">
                <p className="text-xxs font-mono uppercase tracking-widest text-[#9E958E] animate-pulse">
                  Unione in corso ...
                </p>
                <h3 className="font-serif text-lg font-bold text-[#4D4742]">
                  Creazione dello script di nozze in corso...
                </h3>
                <p className="text-xs text-[#9E958E]">
                  Stiamo raccogliendo e assemblando {csvData.rows.length} record in ExtendScript.
                </p>
              </div>
            </div>
          )}

          {/* STATO 3: SUCCESSO (Soddisfazione visiva) */}
          {isGenerated && (
            <div className="space-y-8 my-auto text-center py-6" id="generated-success-state">
              {/* Animazione Cerchio con Checkmark */}
              <div className="w-20 h-20 bg-[#868E75]/10 border border-[#868E75]/30 text-[#868E75] rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-[#868E75]/5 rounded-full scale-125 animate-ping" style={{ animationDuration: '2s' }} />
                <FileCheck className="w-10 h-10 text-[#868E75]" style={{ transform: 'none' }} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#868E75] uppercase tracking-wider font-extrabold px-3 py-1 bg-[#868E75]/10 rounded-full border border-[#868E75]/25 inline-block">
                  Compilato con successo
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#4D4742]">
                  Script generato con successo!
                </h2>
                <p className="text-xs text-[#6E6660] max-w-sm mx-auto leading-relaxed">
                  Il file script <code className="bg-[#F7F4EF] font-mono text-[11px] px-1.5 py-0.5 rounded text-charcoal">.jsx</code> è stato generato ed è ora disponibile per il download sul tuo computer.
                </p>
              </div>

              {/* Bottoni di Azione nel Success State */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3.5 max-w-md mx-auto">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 bg-[#868E75] hover:bg-[#868E75]/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-3xs"
                  id="success-download-btn"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Scarica file .JSX</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white hover:bg-[#F7F4EF]/55 text-[#4D4742] border border-[#E8E1D8] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  id="success-copy-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#868E75]" />
                      <span className="text-[#868E75] font-bold">Copiato negli Appunti!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#6E6660]" />
                      <span>Copia Codice Script</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setIsGenerated(false)}
                className="text-[10px] text-[#A85E52] hover:underline font-bold uppercase tracking-widest cursor-pointer block mx-auto pt-2"
              >
                ← Genera di nuovo o Cambia Impostazioni
              </button>
            </div>
          )}

        </div>

      </div>

      {/* COLONNA DESTRA: ACCORDION "SCOPRI DI PIÙ" PER CHI NON È TECNICO */}
      <div className="lg:col-span-5 space-y-4">
        
        <div className="bg-[#FCFBF8] rounded-3xl border border-[#E8E1D8] p-6 shadow-luxury">
          <div className="flex items-center gap-2 border-b border-[#E8E1D8]/50 pb-3 mb-4">
            <span className="p-1 px-1.5 bg-[#868E75]/10 text-[#868E75] rounded text-xxs font-bold">FAQ</span>
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#4D4742]">
              Istruzioni d&apos;uso &amp; Setup
            </h4>
          </div>
          
          <p className="text-xs text-[#9E958E] leading-relaxed mb-4">
            Se è la prima volta che utilizzi gli ExtendScript in Illustrator, espandi i nostri accordi semplificati per iniziare con fiducia.
          </p>

          <div className="space-y-2.5" id="help-accordions-group">
            
            {/* ACCORDION 1: Come avviare lo script */}
            <div className="border border-[#E8E1D8] rounded-xl bg-white overflow-hidden">
              <button 
                onClick={() => toggleAccordion('start')}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-xs font-bold text-[#4D4742] hover:bg-[#F7F4EF]/25 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#868E75]/10 text-[#868E75] flex items-center justify-center font-mono text-[10px]">1</span>
                  <span>Come avviare il processo</span>
                </span>
                {openAccordion === 'start' ? <ChevronUp className="w-4 h-4 text-[#9E958E]" /> : <ChevronDown className="w-4 h-4 text-[#9E958E]" />}
              </button>

              {openAccordion === 'start' && (
                <div className="p-4 border-t border-[#E8E1D8]/60 text-[11px] text-[#6E6660] leading-relaxed bg-[#F7F4EF]/15 space-y-2">
                  <p>
                    1. Apri il tuo progetto grafico <code className="bg-cream-dark px-1 rounded font-mono font-bold">.ai</code> in Illustrator.
                  </p>
                  <p>
                    2. Vai sul menù superiore: <br />
                    <strong className="text-[#4D4742]">File &gt; Script &gt; Altro script...</strong>
                  </p>
                  <p>
                    3. Seleziona il file <code className="font-mono bg-[#EAEAEC] px-1 py-0.5 rounded text-xs text-[#4D4742]">{`illustrator_pro_${(settings.projectName || 'unione').toLowerCase().replace(/[^a-z0-9]/gi, '_')}.jsx`}</code> appena scaricato dal computer.
                  </p>
                </div>
              )}
            </div>

            {/* ACCORDION 2: Requisiti di Illustrator */}
            <div className="border border-[#E8E1D8] rounded-xl bg-white overflow-hidden">
              <button 
                onClick={() => toggleAccordion('req')}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-xs font-bold text-[#4D4742] hover:bg-[#F7F4EF]/25 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#868E75]/10 text-[#868E75] flex items-center justify-center font-mono text-[10px]">2</span>
                  <span>Come impostare il file grafico</span>
                </span>
                {openAccordion === 'req' ? <ChevronUp className="w-4 h-4 text-[#9E958E]" /> : <ChevronDown className="w-4 h-4 text-[#9E958E]" />}
              </button>

              {openAccordion === 'req' && (
                <div className="p-4 border-t border-[#E8E1D8]/60 text-[11px] text-[#6E6660] leading-relaxed bg-[#F7F4EF]/15 space-y-2">
                  <p>
                    Il trucco consiste nell&apos;avere una o più caselle di testo con il testo esatto di segnaposto impostato. 
                  </p>
                  <p>
                    Ad esempio, se hai impostato <code className="bg-[#FCFBF8] border border-[#E8E1D8] text-[#A85E52] px-1.5 py-0.5 rounded font-mono font-bold">{settings.targetPlaceholder || '{{Nome}}'}</code>, inserisci quel testo esatto per la valuta da sostituire. Lo script lo rimpiazzerà in modo automatico scorrendo la griglia!
                  </p>
                </div>
              )}
            </div>

            {/* ACCORDION 3: Tasti di Scelta rapida */}
            <div className="border border-[#E8E1D8] rounded-xl bg-white overflow-hidden">
              <button 
                onClick={() => toggleAccordion('shortcut')}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-xs font-bold text-[#4D4742] hover:bg-[#F7F4EF]/25 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#868E75]/10 text-[#868E75] flex items-center justify-center font-mono text-[10px]">3</span>
                  <span>Scorciatoie rapide da tastiera</span>
                </span>
                {openAccordion === 'shortcut' ? <ChevronUp className="w-4 h-4 text-[#9E958E]" /> : <ChevronDown className="w-4 h-4 text-[#9E958E]" />}
              </button>

              {openAccordion === 'shortcut' && (
                <div className="p-4 border-t border-[#E8E1D8]/60 text-[11px] text-[#6E6660] leading-relaxed bg-[#F7F4EF]/15 space-y-1.5">
                  <p>Puoi installare lo script in modo permanente in Illustrator oppure avviarlo con la comoda scorciatoia di sistema:</p>
                  <div className="p-2 bg-white rounded border border-[#E8E1D8] font-mono text-[10px] space-y-1">
                    <p><strong>Windows:</strong> <kbd className="bg-[#F7F4EF] px-1 rounded border border-[#E8E1D8] text-xs font-bold">CTRL + F12</kbd></p>
                    <p><strong>Mac:</strong> <kbd className="bg-[#F7F4EF] px-1 rounded border border-[#E8E1D8] text-xs font-bold">CMD + F12</kbd></p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
