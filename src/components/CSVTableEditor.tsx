import React, { useState, useEffect } from 'react';
import { CSVData } from '../types';
import { 
  Plus, 
  Trash2, 
  Check, 
  Edit3, 
  Database, 
  FileSpreadsheet, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface CSVTableEditorProps {
  data: CSVData;
  onDataChange: (newData: CSVData) => void;
}

export default function CSVTableEditor({
  data,
  onDataChange,
}: CSVTableEditorProps) {
  const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | null>(null);
  const [editingHeaderValue, setEditingHeaderValue] = useState('');
  
  // Cronologia per "Tornare indietro con le modifiche" (Undo History)
  const [history, setHistory] = useState<CSVData[]>([]);
  const [lastLoadedData, setLastLoadedData] = useState<string>('');

  // Svuota la history se carichiamo un set di dati totalmente diverso da fuori (es. cambio preset o reset)
  useEffect(() => {
    const serialized = JSON.stringify(data);
    if (!lastLoadedData) {
      setLastLoadedData(serialized);
    } else if (serialized !== lastLoadedData) {
      // Se è un cambio proveniente da modifiche interne (gestite dalle nostre funzioni), l'ultimo stato è già nella history.
      // Se invece è un reset o un cambio preset da fuori, puliamo la cronologia per evitare incoerenze.
      const isExternalChange = !history.some(h => JSON.stringify(h) === serialized);
      if (isExternalChange && history.length > 0 && serialized !== JSON.stringify(history[history.length - 1])) {
        setHistory([]);
      }
      setLastLoadedData(serialized);
    }
  }, [data, lastLoadedData, history]);

  // Sse non ci sono dati, visualizziamo un pannello di attesa altamente rifinito in stile Sage Paper Design
  if (!data || data.rows.length === 0) {
    return (
      <div 
        className="bg-[#FCFBF8] rounded-3xl border border-[#E8E1D8] p-8 text-center flex flex-col items-center justify-center min-h-[380px] shadow-luxury"
        id="table-editor-placeholder"
      >
        <div className="w-16 h-16 rounded-full bg-[#868E75]/10 border border-[#868E75]/20 flex items-center justify-center text-[#868E75] mb-4">
          <Database className="w-7 h-7" />
        </div>
        
        <h3 className="font-serif text-base font-bold text-[#4D4742] tracking-wide">
          In attesa dei dati...
        </h3>
        <p className="text-xs text-[#9E958E] max-w-sm mx-auto leading-relaxed mt-1.5">
          La tabella di editing interattivo apparirà qui non appena caricherai un file CSV/XLSX o selezionerai uno dei nostri preset di nozze a sinistra.
        </p>

        {/* Diadema decorativa griglia tratteggiata */}
        <div className="w-full max-w-xs mt-6 border border-dashed border-[#E8E1D8]/80 rounded-xl p-4 space-y-2 bg-white/40">
          <div className="flex gap-2">
            <div className="h-2 bg-[#E8E1D8]/55 w-1/3 rounded-full" />
            <div className="h-2 bg-[#E8E1D8]/55 w-1/2 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-2 bg-[#E8E1D8]/40 w-1/4 rounded-full" />
            <div className="h-2 bg-[#E8E1D8]/40 w-2/3 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-2 bg-[#E8E1D8]/20 w-1/2 rounded-full" />
            <div className="h-2 bg-[#E8E1D8]/20 w-1/3 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Helper per salvare lo stato nella history prima di applicare cambiamenti
  const pushToHistory = () => {
    const snapshot = JSON.parse(JSON.stringify(data));
    setHistory(prev => [...prev, snapshot]);
  };

  // Azione di annullamento (Undo)
  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    // Aggiorniamo anche lastLoadedData per evitare di resettare la history nel useEffect
    setLastLoadedData(JSON.stringify(previousState));
    onDataChange(previousState);
  };

  // Azioni Database: Aggiungi riga
  const handleAddRow = () => {
    pushToHistory();
    const newRow: Record<string, string> = {};
    data.headers.forEach(h => {
      newRow[h] = '';
    });
    onDataChange({
      headers: data.headers,
      rows: [...data.rows, newRow],
    });
  };

  // Rimuovi riga
  const handleRemoveRow = (index: number) => {
    pushToHistory();
    const updatedRows = [...data.rows];
    updatedRows.splice(index, 1);
    onDataChange({
      headers: data.headers,
      rows: updatedRows,
    });
  };

  // Modifica singola cella
  const handleCellChange = (rowIndex: number, header: string, value: string) => {
    // Registriamo nella history solo se il valore cambia effettivamente
    if (data.rows[rowIndex][header] === value) return;
    pushToHistory();
    const updatedRows = data.rows.map((row, idx) => {
      if (idx === rowIndex) {
        return { ...row, [header]: value };
      }
      return row;
    });
    onDataChange({
      headers: data.headers,
      rows: updatedRows,
    });
  };

  // Aggiungi Colonna
  const handleAddColumn = () => {
    pushToHistory();
    const baseColName = `Colonna_${data.headers.length + 1}`;
    const newHeaders = [...data.headers, baseColName];
    const newRows = data.rows.map(row => ({ ...row, [baseColName]: '' }));
    onDataChange({
      headers: newHeaders,
      rows: newRows,
    });
  };

  // Modifica nome intestazione colonna
  const startEditingHeader = (index: number, currentName: string) => {
    setEditingHeaderIndex(index);
    setEditingHeaderValue(currentName);
  };

  const saveHeaderName = (index: number) => {
    // Se non stiamo modificando nulla, esci subito
    if (editingHeaderIndex === null) return;
    
    const oldName = data.headers[index];
    // Consente spazi, caratteri accentati e caratteri standard, rimuovendo solo le parentesi graffe { } che disturberebbero i segnaposto
    const cleanedValue = editingHeaderValue.replace(/[{}]/g, '').trim();

    // Se l'utente svuota il testo o lascia solo spazi non validi, ripristina la colonna precedente
    if (!cleanedValue) {
      setEditingHeaderIndex(null);
      return;
    }

    let newName = cleanedValue;

    // Gestione dei duplicati delle colonne per evitare crash di chiavi duplicate in React e fusioni improprie
    const otherHeaders = data.headers.filter((_, idx) => idx !== index);
    if (otherHeaders.includes(newName)) {
      let counter = 1;
      while (otherHeaders.includes(`${newName}_${counter}`)) {
        counter++;
      }
      newName = `${newName}_${counter}`;
    }

    // Se il nome finale è uguale a quello precedente, chiudi senza salvare nella history
    if (oldName === newName) {
      setEditingHeaderIndex(null);
      return;
    }

    pushToHistory();
    const updatedHeaders = [...data.headers];
    updatedHeaders[index] = newName;

    const updatedRows = data.rows.map(row => {
      const newRow: Record<string, string> = {};
      data.headers.forEach(h => {
        if (h === oldName) {
          newRow[newName] = row[oldName] || '';
        } else {
          newRow[h] = row[h] || '';
        }
      });
      return newRow;
    });

    onDataChange({
      headers: updatedHeaders,
      rows: updatedRows,
    });
    setEditingHeaderIndex(null);
  };

  // Rimuovi Colonna
  const handleRemoveColumn = (headerName: string) => {
    pushToHistory();
    const updatedHeaders = data.headers.filter(h => h !== headerName);
    const updatedRows = data.rows.map(row => {
      const newRow = { ...row };
      delete newRow[headerName];
      return newRow;
    });
    onDataChange({
      headers: updatedHeaders,
      rows: updatedRows,
    });
  };

  return (
    <div className="bg-[#FCFBF8] rounded-2xl border border-[#E8E1D8] shadow-luxury overflow-hidden" id="spreadsheet-database-editor">
      
      {/* Header Tabella azioni */}
      <div className="px-5 py-4 border-b border-[#E8E1D8] flex items-center justify-between flex-wrap gap-3 bg-[#FCFBF8]">
        <div className="space-y-0.5">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#4D4742]">
            Modifica Tabella Dati Offline
          </h4>
          <p className="text-[9.5px] text-[#9E958E] uppercase tracking-wider font-sans">
            Modifica i valori inline, aggiungi colonne o righe per unire i campi
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xxs">
          {/* Pulsante Annulla Modifica (Undo) */}
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A85E52]/10 hover:bg-[#A85E52]/20 text-[#A85E52] border border-[#A85E52]/20 font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-3xs"
              title="Annulla l'ultima modifica effettuata"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="font-sans text-[9px]">Annulla ({history.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddColumn}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#868E75]/10 hover:bg-[#868E75]/20 text-[#868E75] hover:text-[#868E75]/90 border border-[#868E75]/20 font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-3xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Colonna</span>
          </button>
          
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#A85E52]/10 hover:bg-[#A85E52]/20 text-[#A85E52] hover:text-[#A85E52]/90 border border-[#A85E52]/20 font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-3xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invitato</span>
          </button>
        </div>
      </div>

      {/* Griglia Tabella Fogli di Calcolo */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F7F4EF] text-[#4D4742] font-semibold border-b border-[#E8E1D8] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 w-12 text-center text-[10px] text-[#9E958E] font-mono border-r border-[#E8E1D8]">
                #
              </th>
              {data.headers.map((header, colIdx) => (
                <th 
                  key={header} 
                  className="px-4 py-2 border-r border-[#E8E1D8] text-[10px] tracking-wide uppercase font-mono relative hover:bg-[#E8E1D8]/40 transition-colors"
                  style={{ minWidth: '130px' }}
                >
                  {editingHeaderIndex === colIdx ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editingHeaderValue}
                        onChange={(e) => setEditingHeaderValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveHeaderName(colIdx);
                          } else if (e.key === 'Escape') {
                            setEditingHeaderIndex(null);
                          }
                        }}
                        onBlur={() => {
                          // Salvataggio automatico al click fuori (Blur), con un piccolissimo ritardo per non bloccare eventuali interazioni con il checkmark
                          setTimeout(() => {
                            saveHeaderName(colIdx);
                          }, 100);
                        }}
                        className="bg-white border border-[#A85E52] rounded px-1.5 py-1 w-full font-mono font-bold text-xs outline-none focus:ring-1 focus:ring-[#A85E52]"
                        autoFocus
                      />
                      <button 
                        onClick={() => saveHeaderName(colIdx)}
                        className="p-1 text-[#868E75] hover:bg-[#868E75]/10 rounded flex-shrink-0"
                        title="Salva"
                        type="button"
                      >
                        <Check className="w-3.5 h-3.5 text-[#868E75]" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <span 
                        className="font-bold underline decoration-dotted cursor-pointer hover:text-[#A85E52]"
                        onClick={() => startEditingHeader(colIdx, header)}
                        title="Fai click per rinominare l'intestazione"
                      >
                        {header}
                      </span>
                      
                      {/* Azioni colonna sempre visibili ma discrete, utilissime sui touch screen */}
                      <div className="flex items-center gap-0.5 whitespace-nowrap ml-2">
                        <button 
                          onClick={() => startEditingHeader(colIdx, header)}
                          className="p-1 hover:bg-white rounded text-[#9E958E] hover:text-[#4D4742] transition-colors"
                          title="Rinomina"
                        >
                          <Edit3 className="w-3 h-3 text-current" />
                        </button>
                        {data.headers.length > 1 && (
                          <button 
                            onClick={() => handleRemoveColumn(header)}
                            className="p-1 hover:bg-white rounded text-[#A85E52]/75 hover:text-[#A85E52] transition-colors"
                            title={`Elimina colonna ${header}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-current" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </th>
              ))}
              <th className="px-4 py-2 w-14 text-center text-[#9E958E] font-mono">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E1D8]/50 bg-white">
            {data.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#F7F4EF]/25 transition-colors">
                
                {/* ID Riga */}
                <td className="px-4 py-2 text-center font-mono text-[10px] text-[#9E958E] border-r border-[#E8E1D8]/55 select-none bg-[#FCFBF8]">
                  {rowIdx + 1}
                </td>

                {/* Celle dei dati */}
                {data.headers.map((header) => (
                  <td key={header} className="p-1 border-r border-[#E8E1D8]/45">
                    <input
                      type="text"
                      value={row[header] || ''}
                      onChange={(e) => handleCellChange(rowIdx, header, e.target.value)}
                      className="w-full px-3 py-1.5 bg-transparent border border-transparent rounded hover:bg-[#F7F4EF]/35 focus:bg-white focus:border-[#868E75]/40 outline-none text-xs transition-all font-medium text-[#4D4742]"
                    />
                  </td>
                ))}

                {/* Pulsante Cancella Riga */}
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleRemoveRow(rowIdx)}
                    className="p-1 text-[#9E958E] hover:text-[#A85E52] hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex"
                    title={`Elimina riga #${rowIdx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-current" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Tabella */}
      <div className="bg-[#F7F4EF]/55 border-t border-[#E8E1D8] px-5 py-3 flex items-center justify-between text-[9.5px] text-[#9E958E] font-medium leading-relaxed">
        <span className="flex items-center gap-1 font-sans">
          <Check className="w-3.5 h-3.5 text-[#868E75]" style={{ transform: 'none' }} />
          <span>Le modifiche inline si aggiornano all&apos;istante in tutti i passaggi successivi.</span>
        </span>
        <span className="italic shrink-0 hidden sm:inline font-sans pb-0.5">
          * Fai click per rinominare intestazione o usa il cestino rosso per eliminare la colonna
        </span>
      </div>

    </div>
  );
}
