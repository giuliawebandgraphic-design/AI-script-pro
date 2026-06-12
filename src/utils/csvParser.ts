import { CSVData } from '../types';

/**
 * Parsa una stringa CSV (supporta virgole, punti e virgole, tabulazioni, e virgolette doppie).
 */
export function parseCSV(text: string): CSVData {
  if (!text.trim()) {
    return { headers: [], rows: [] };
  }

  const lines = text.split(/\r?\n/);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Rileva il delimitatore (, ; o \t) analizzando la prima riga
  const firstLine = lines[0];
  let delimiter = ',';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  }

  // Helper per dividere una riga tenendo conto delle virgolette doppie
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '').trim());
  };

  const parsedHeaders = splitLine(lines[0]);
  
  // Rimuove eventuali intestazioni vuote o le rende uniche
  const headers = parsedHeaders.map((h, i) => h || `Colonna_${i + 1}`);

  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Salta righe vuote

    const values = splitLine(lines[i]);
    const rowObj: Record<string, string> = {};

    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });

    // Se per qualche motivo ci sono valori extra oltre i colli delle intestazioni
    if (values.length > headers.length) {
      for (let j = headers.length; j < values.length; j++) {
        rowObj[`Colonna_${j + 1}`] = values[j] || '';
      }
    }

    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Genera una stringa CSV a partire da CSVData.
 */
export function stringifyCSV(data: CSVData): string {
  if (data.headers.length === 0) return '';
  
  const headerLine = data.headers.join(',');
  const rowLines = data.rows.map(row => 
    data.headers.map(h => {
      const val = row[h] || '';
      // Se contiene virgole o virgolette, avvolgi tra virgolette raddoppiandole
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  return [headerLine, ...rowLines].join('\n');
}
