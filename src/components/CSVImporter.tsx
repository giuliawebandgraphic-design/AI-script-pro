import React, { useState, useRef } from 'react';
import { CSVData, Preset } from '../types';
import { parseCSV } from '../utils/csvParser';
import { CSV_PRESETS } from '../data';
import { 
  Upload, 
  CheckCircle, 
  FileDown, 
  Sparkles,
  Sheet
} from 'lucide-react';

interface CSVImporterProps {
  data: CSVData;
  onDataChange: (newData: CSVData) => void;
  selectedPresetId: string;
  onPresetSelect: (presetId: string) => void;
}

export default function CSVImporter({
  data,
  onDataChange,
  selectedPresetId,
  onPresetSelect,
}: CSVImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSV(text);
        onDataChange(parsed);
        onPresetSelect(''); // Deseleziona i preset demo salvati
      }
    };
    reader.readAsText(file);
  };

  // Caricamento veloci per Preset
  const handleLoadPreset = (preset: Preset) => {
    onPresetSelect(preset.id);
    onDataChange({
      headers: [...preset.headers],
      rows: preset.rows.map(r => ({ ...r })),
    });
  };

  // Scarica il file CSV modello
  const handleDownloadTemplate = () => {
    const currentPreset = CSV_PRESETS.find(p => p.id === selectedPresetId) || CSV_PRESETS[0];
    const headerLine = currentPreset.headers.join(',');
    const rowsLines = currentPreset.rows.map(r => 
      currentPreset.headers.map(h => {
        const val = r[h] || '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );
    
    const csvContent = [headerLine, ...rowsLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = currentPreset.name.toLowerCase().replace(/\s+/g, '_');
    link.download = `modello_${safeName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="csv-importer-container">
      
      {/* 1. SELETTORE PRESET VELOCI */}
      <div className="bg-[#FCFBF8] rounded-2xl border border-[#E8E1D8] shadow-luxury p-5" id="presets-selector-panel">
        <div className="flex items-center gap-2 mb-3 border-b border-[#E8E1D8]/20 pb-2">
          <Sheet className="w-4 h-4 text-[#868E75]" />
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#4D4742]">
            Preset di Nozze Veloci:
          </h4>
        </div>
        <p className="text-[9.5px] text-[#9E958E] leading-relaxed mb-4 uppercase tracking-wider font-sans">
          Carica all&apos;istante un database d&apos;esempio coordinato
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {CSV_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className={`flex flex-col items-start p-3 bg-white hover:bg-[#F7F4EF]/35 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#A85E52] ring-3 ring-[#A85E52]/10 bg-[#FCFBF8]'
                    : 'border-[#E8E1D8] hover:border-[#6E6660]/30'
                }`}
                id={`preset-btn-${preset.id}`}
              >
                <span className={`text-xs font-bold ${isSelected ? 'text-[#A85E52]' : 'text-[#4D4742]'}`}>
                  {preset.name}
                </span>
                <span className="text-[9px] text-[#9E958E] line-clamp-1 mt-0.5 font-sans">
                  {preset.rows.length} righe • {preset.headers.join(', ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DRAG AND DROP CARD */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-[#FCFBF8] rounded-3xl border-2 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] shadow-luxury ${
          isDragging 
            ? 'border-[#A85E52] bg-[#A85E52]/5 scale-[0.99]' 
            : 'border-[#E8E1D8] hover:border-[#A85E52]/60 hover:bg-[#F7F4EF]/20'
        }`}
        id="drag-drop-card"
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.txt"
          className="hidden"
          id="hidden-csv-file-input"
        />
        
        {/* Cerchio icona animato */}
        <div className="w-12 h-14 w-12 h-12 bg-[#F7F4EF] text-[#A85E52] rounded-full flex items-center justify-center mb-3.5 border border-[#E8E1D8] shadow-3xs">
          <Upload className="w-5 h-5 animate-pulse" />
        </div>

        <h3 className="font-serif text-[14px] font-bold text-[#4D4742] tracking-wide">
          Trascina qui il tuo file CSV o TXT
        </h3>
        <p className="text-[9.5px] text-[#9E958E] uppercase tracking-widest font-sans mt-1">
          oppure clicca per selezionarlo
        </p>
 
      </div>

      {/* 3. FEEDBACK VISIVO STATO DOPO UPLOAD */}
      {data.rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#868E75]/35 p-4 shadow-luxury space-y-3" id="upload-feedback-badge">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#868E75] uppercase tracking-wider font-bold">
                Mappatura Database Valida
              </span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#868E75]" />
                <span className="text-xs font-bold text-[#4D4742]">
                  {data.rows.length} record • {data.headers.length} colonne
                </span>
              </div>
            </div>
            {selectedPresetId && (
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#868E75]/10 hover:bg-[#868E75]/20 text-[#868E75] text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all border border-[#868E75]/20 cursor-pointer shadow-3xs"
                title="Scarica file CSV di esempio"
              >
                <FileDown className="w-3 h-3" />
                <span>Modello</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
