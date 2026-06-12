import React, { useState, useEffect } from 'react';
import { CSVData, GeneratorSettings } from './types';
import { CSV_PRESETS } from './data';
import { generateIllustratorJSX } from './utils/jsxGenerator';
import SVGLogo from './components/Logo';
import CSVImporter from './components/CSVImporter';
import CSVTableEditor from './components/CSVTableEditor';
import IllustratorSettings from './components/IllustratorSettings';
import ArtboardPreview from './components/ArtboardPreview';
import PreviewTable from './components/PreviewTable';
import ScriptOutput from './components/ScriptOutput';
import { 
  RotateCcw, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Layers,
  Inbox,
  CheckCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const defaultPreset = CSV_PRESETS[2]; // Dati Segnaposto come default creativo
  const [csvData, setCsvData] = useState<CSVData>({
    headers: [...defaultPreset.headers],
    rows: defaultPreset.rows.map(r => ({ ...r })),
  });
  
  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);
  const [activeStep, setActiveStep] = useState<number>(0);
  
  const [settings, setSettings] = useState<GeneratorSettings>({
    targetPlaceholder: '{{Invitato}}',
    projectName: 'Partecipazioni Botaniche – Nozze Sofia & Matteo',
    clientBrand: 'Sage Paper Design',
  });

  const [activePresetTemplate, setActivePresetTemplate] = useState<string>('segnaposto');

  // Sincronizza il preset selezionato con il tipo di layout dell'artboard
  useEffect(() => {
    if (selectedPresetId) {
      setActivePresetTemplate(selectedPresetId);
      // Sincronizza anche il placeholder target consigliato
      const found = CSV_PRESETS.find(p => p.id === selectedPresetId);
      if (found) {
        setSettings(prev => ({
          ...prev,
          targetPlaceholder: found.placeholder
        }));
      }
    }
  }, [selectedPresetId]);

  const handleReset = () => {
    setCsvData({
      headers: [],
      rows: [],
    });
    setSelectedPresetId('');
    setActivePresetTemplate('segnaposto');
    setSettings({
      targetPlaceholder: '{{Nome}}',
      projectName: '',
      clientBrand: '',
    });
    setActiveStep(0);
  };

  const handleExport = () => {
    if (csvData.rows.length === 0) return;
    const scriptCode = generateIllustratorJSX(csvData, settings);
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

  const hasData = csvData.rows.length > 0;
  
  // Lista dei passaggi
  const steps = [
    { label: 'Carica Dati', desc: 'CSV o Excel' },
    { label: 'Configura Segnaposto', desc: 'Mappatura campi' },
    { label: 'Anteprima Risultato', desc: 'Illustrator Live Artboard' },
    { label: 'Genera Script', desc: 'Esporta ExtendScript' }
  ];

  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#4D4742] font-sans antialiased flex flex-col justify-between selection:bg-terracotta/20 selection:text-terracotta">
      
      {/* Header Premium con Logo Minimalista e Bottoni di Reset globali */}
      <header className="h-[80px] bg-white border-b border-[#E8E1D8] sticky top-0 z-40 px-6 md:px-12 flex items-center shadow-xs">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
          <SVGLogo showTagline={true} />
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E1D8] hover:border-[#4D4742]/30 bg-white text-xs font-semibold tracking-wider hover:bg-[#F7F4EF]/50 transition-all cursor-pointer shadow-3xs"
              title="Azzera e ricomincia"
              id="top-reset-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6E6660]" />
              <span className="hidden sm:inline">Azzera</span>
            </button>
            <button
              onClick={handleExport}
              disabled={!hasData}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-xs ${
                hasData
                  ? 'bg-[#A85E52] hover:bg-[#A85E52]/90 text-white'
                  : 'bg-[#FCFBF8] border border-[#E8E1D8] text-[#9E958E] cursor-not-allowed'
              }`}
              id="top-quick-export-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scarica Script</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Stepper Sticky / Orizzontale Premium */}
      <div className="bg-[#FCFBF8]/95 border-b border-[#E8E1D8] backdrop-blur-md sticky top-[80px] z-30 py-3.5 shadow-luxury">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Stepper progressivo orizzontale */}
            <div className="flex items-center justify-between md:justify-start w-full md:w-auto overflow-x-auto gap-4 md:gap-8 pb-1 md:pb-0 scrollbar-none" id="horizontal-stepper-track">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                const isCompleted = activeStep > idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      // Consente di navigare liberamente
                      setActiveStep(idx);
                    }}
                    className={`flex items-center gap-2 text-left shrink-0 transition-all outline-none py-1 group cursor-pointer`}
                    id={`step-indicator-${idx}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                      isActive 
                        ? 'bg-[#A85E52] border-[#A85E52] text-white shadow-xs' 
                        : isCompleted
                        ? 'bg-[#868E75] border-[#868E75] text-white'
                        : 'bg-white border-[#E8E1D8] text-[#9E958E] group-hover:border-[#6E6660]'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </span>
                    <div className="text-left leading-tight">
                      <p className={`text-xs font-bold transition-all ${
                        isActive ? 'text-[#A85E52]' : 'text-[#4D4742]'
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-[#A85E52]/60 font-medium md:block hidden">
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Percentuale e indicatore testuale compatto */}
            <div className="flex items-center justify-between md:justify-end gap-3.5 border-t md:border-t-0 pt-3 md:pt-0 border-[#E8E1D8]/60">
              <span className="text-[9.5px] font-sans uppercase tracking-widest text-[#9E958E]">
                Progresso: {Math.round(((activeStep + 1) / steps.length) * 100)}%
              </span>
              <div className="w-24 bg-[#E8E1D8] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#A85E52] transition-all duration-300 rounded-full"
                  style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Workspace - 2-Column Responsive Dashboard inside animated steps */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8 flex flex-col justify-between" id="app-main-content">
        
        {/* Pulsanti di navigazione del Wizard guidato SPOSTATI IN ALTO */}
        <div className="pb-6 mb-2 border-b border-[#E8E1D8]/45 flex items-center justify-between gap-4" id="wizard-navigation-bar">
          <button
            onClick={handlePrevStep}
            disabled={activeStep === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'bg-white hover:bg-[#F7F4EF]/50 border-[#E8E1D8] text-[#4D4742] hover:border-[#6E6660] cursor-pointer'
            }`}
            id="prev-step-btn"
          >
            <ArrowLeft className="w-4 h-4 text-current" />
            <span>Indietro</span>
          </button>

          <div className="text-xxs-center text-[#9E958E] font-medium hidden md:block uppercase tracking-wider font-sans text-[10px]">
            {activeStep === 0 && "Step 1 di 4 • Carica il database degli invitati in formato CSV/Excel."}
            {activeStep === 1 && "Step 2 di 4 • Mappa i campi segnaposto in base alle chiavi inserite."}
            {activeStep === 2 && "Step 3 di 4 • Esamina l'aspetto grafico degli arredi di nozze."}
            {activeStep === 3 && "Step 4 di 4 • Genera lo script offline ed avvialo in Illustrator!"}
          </div>

          <button
            onClick={activeStep === steps.length - 1 ? handleExport : handleNextStep}
            disabled={activeStep === 0 && !hasData}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
              activeStep === 0 && !hasData
                ? 'bg-[#E8E1D8] text-[#9E958E] cursor-not-allowed'
                : 'bg-[#A85E52] hover:bg-[#A85E52]/90 text-white hover:shadow-md cursor-pointer'
            }`}
            id="next-step-btn"
          >
            <span>
              {activeStep === steps.length - 1 ? 'Esporta & Esporta JSX' : 'Avanti'}
            </span>
            <ArrowRight className="w-4 h-4 text-current" />
          </button>
        </div>

        {/* Step transition containers with Framer Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full flex-1"
          >
            {/* ======================================= */}
            {/* STEP 0: CARICA DATI (Upload Data) */}
            {/* ======================================= */}
            {activeStep === 0 && (
              <div className="space-y-8" id="step-upload-data">
                
                {/* Sezione 1: Project Header elegante */}
                <div className="bg-[#FCFBF8] rounded-2xl border border-[#E8E1D8] shadow-luxury p-6" id="project-header-comp">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-[#868E75]/10 text-[#868E75] rounded-xl border border-[#868E75]/10">
                        <FolderOpen className="w-5 h-5" />
                      </span>
                      <div>
                        <h2 className="text-xs font-bold text-[#4D4742] uppercase tracking-widest font-sans">
                          Dettagli Progetto Stationery
                        </h2>
                        <p className="text-[10px] text-[#9E958E] tracking-wider font-mono mt-0.5 uppercase">
                          Questo nome darà la firma al file script esportato
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 max-w-xl w-full">
                      <input
                        type="text"
                        value={settings.projectName || ''}
                        onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
                        placeholder="Partecipazioni Bucolic – Matrimonio Andrea & Sofia"
                        className="w-full px-4 py-3 bg-[#F7F4EF]/30 border border-[#E8E1D8] focus:border-[#868E75]/60 hover:border-[#C8BEB2] rounded-xl text-[#4D4742] text-sm outline-none focus:ring-4 focus:ring-[#868E75]/5 transition-all font-medium placeholder:text-[#9E958E]/60 shadow-inner-sm"
                        id="projectNameInput"
                      />
                      <span className="text-[10px] text-[#9E958E] italic mt-1.5 block">
                        Usa un nome descrittivo della collezione (es. “Wedding Place Cards – Bucolic Collection”)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sezione 2: 2 Column Layout - Cargo e Tabella */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Caricamento CSV/Excel - Sinistra */}
                  <div className="lg:col-span-5 h-full">
                    <CSVImporter
                      data={csvData}
                      onDataChange={setCsvData}
                      selectedPresetId={selectedPresetId}
                      onPresetSelect={setSelectedPresetId}
                    />
                  </div>

                  {/* Tabella di visualizzazione dati sulla destra - Sostituisce lo "Strumento d'eccellenza" */}
                  <div className="lg:col-span-7 h-full">
                    <CSVTableEditor
                      data={csvData}
                      onDataChange={setCsvData}
                    />
                  </div>

                </div>

              </div>
            )}

            {/* ======================================= */}
            {/* STEP 1: CONFIGURA CONTENUTI (Fields) */}
            {/* ======================================= */}
            {activeStep === 1 && (
              <div id="step-configure-fields">
                <IllustratorSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                  csvData={csvData}
                />
              </div>
            )}

            {/* ======================================= */}
            {/* STEP 2: ANTEPRIMA RISULTATO (Preview) */}
            {/* ======================================= */}
            {activeStep === 2 && (
              <div className="space-y-8" id="step-preview-results">
                
                {/* Pannello Superiore di Controllo Preset Grafici */}
                <div className="bg-[#FCFBF8] rounded-2xl border border-[#E8E1D8] shadow-luxury p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-[#4D4742]">
                      Scegli il layout di Anteprima Grafica
                    </h3>
                    <p className="text-[9.5px] text-[#9E958E] uppercase tracking-widest font-sans">
                      Visualizza come verranno esportati i diversi formati di nozze
                    </p>
                  </div>
                  
                  {/* Select di tipologia template con Cards Orizzontali */}
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: 'segnaposto', label: '🏷️ Segnaposto' },
                      { id: 'menu', label: '📜 Menù Banchetto' },
                      { id: 'buste', label: '✉️ Busta Indirizzi' },
                      { id: 'tableau', label: '🖼️ Tableau de Mariage' }
                    ].map(tpl => (
                      <button
                        key={tpl.id}
                        onClick={() => setActivePresetTemplate(tpl.id)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                          activePresetTemplate === tpl.id
                            ? 'bg-[#A85E52] border-[#A85E52] text-white shadow-xs font-bold scale-[1.01]'
                            : 'bg-white border-[#E8E1D8] text-[#4D4742] hover:border-[#6E6660]/40'
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Artboard Preview allargata a tutto schermo */}
                <ArtboardPreview
                  csvData={csvData}
                  settings={settings}
                  activeTemplatePreset={activePresetTemplate}
                />

                {/* Tabella di distribuzione posizionata ordinatamente in fondo per completezza */}
                <PreviewTable
                  csvData={csvData}
                  settings={settings}
                />

              </div>
            )}

            {/* ======================================= */}
            {/* STEP 3: GENERA SCRIPT (Generate Script) */}
            {/* ======================================= */}
            {activeStep === 3 && (
              <div id="step-generate-script">
                <ScriptOutput
                  csvData={csvData}
                  settings={settings}
                />
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer minimalista e rassicurante */}
      <footer className="w-full bg-white border-t border-[#E8E1D8] py-8 px-6 text-center text-xs text-[#9E958E] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-[#4D4742] uppercase tracking-wider text-[10px]">
            Illustrator Script Pro — Strumento di unione dati e automazione
          </p>
          <div className="flex items-center gap-4 text-xxs tracking-wide uppercase font-mono text-[#9E958E]">
            <span>100% Locale &amp; Sicuro</span>
            <span>•</span>
            <span>Estensione ufficiale JSX</span>
            <span>•</span>
            <span>Adobe Illustrator 2020+</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
