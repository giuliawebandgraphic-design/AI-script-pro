import { CSVData, GeneratorSettings } from '../types';

/**
 * Genera il codice JavaScript (ExtendScript) per Adobe Illustrator (.jsx)
 * ed esegue l'unione dei dati (Data Merge) in modo compatibile con l'ambiente ES3 di Illustrator.
 */
export function generateIllustratorJSX(data: CSVData, settings: GeneratorSettings): string {
  // Serializza i dati del CSV in formato compatibile con ES3 (usando var e stringhe standard)
  const rowsJsonString = JSON.stringify(data.rows, null, 2);

  const projectInfo = settings.projectName || settings.clientBrand
    ? ` *\n${settings.projectName ? ` * PROGETTO: ${settings.projectName}\n` : ''}${settings.clientBrand ? ` * BRAND/CLIENTE: ${settings.clientBrand}\n` : ''}`
    : '';

  // Script di automazione Illustrator compilato per l'ambiente ExtendScript ES3.
  const code = `/**
 * =========================================================================
 * SCRIPT DI AUTOMAZIONE PER ADOBE ILLUSTRATOR: INSERIMENTO RECORD SU SEGNAPOSTI
 * =========================================================================${projectInfo} * 
 * COME USARE QUESTO SCRIPT:
 * 1. Apri il tuo modello (.ai) in Adobe Illustrator.
 * 2. Vai su: File > Script > Altro script... (File > Scripts > Other Script...)
 * 3. Seleziona questo file (.jsx) scaricato.
 */

#target illustrator

(function() {
  if (app.documents.length === 0) {
    alert("Errore:\\nNessun documento aperto in Illustrator.\\n\\nApri il tuo file modello prima di avviare lo script.", "Errore");
    return;
  }

  var doc = app.activeDocument;
  var dataset = ${rowsJsonString};

  var config = {
    targetPlaceholder: "${settings.targetPlaceholder.replace(/"/g, '\\"')}" // es. "{{Nome}}"
  };

  // Funzione per sostituire tutti i segnaposto in un test frame con i dati di un record
  function compileFrameWithRecord(frame, record) {
    var text = frame.contents;
    if (!text) return false;
    
    var userPh = config.targetPlaceholder || "{{Nome}}";
    
    // Trova la prima colonna come fallback se necessario
    var firstKey = "";
    for (var key in record) {
      if (record.hasOwnProperty(key)) {
        firstKey = key;
        break;
      }
    }
    
    // Sostituzione del segnaposto configurato
    while (text.indexOf(userPh) !== -1) {
      var defaultVal = firstKey ? record[firstKey] : "";
      text = text.replace(userPh, defaultVal);
    }
    
    // Sostituzione dinamica di tutte le colonne presenti nel record (es. {{Nome}}, {Nome})
    for (var key in record) {
      if (!record.hasOwnProperty(key)) continue;
      var val = record[key];

      var templates = [
        "{{" + key + "}}",
        "{" + key + "}",
        "{{" + key.toUpperCase() + "}}",
        "{" + key.toUpperCase() + "}",
        "{{" + key.toLowerCase() + "}}",
        "{" + key.toLowerCase() + "}"
      ];
      
      for (var t = 0; t < templates.length; t++) {
        var tpl = templates[t];
        while (text.indexOf(tpl) !== -1) {
          text = text.replace(tpl, val);
        }
      }
    }

    frame.contents = text;
    return true;
  }

  // Raccoglie tutti i text frames del documento o della selezione
  var allFrames = [];
  try {
    if (doc.selection && doc.selection.length > 0) {
      for (var s = 0; s < doc.selection.length; s++) {
        var item = doc.selection[s];
        if (item.typename === "TextFrame") {
          allFrames.push(item);
        } else if (item.textFrames) {
          for (var tf = 0; tf < item.textFrames.length; tf++) {
            allFrames.push(item.textFrames[tf]);
          }
        }
      }
    }
  } catch (e) {}

  // Se nessun frame nella selezione, prendi tutti dal documento attivo
  if (allFrames.length === 0) {
    allFrames = doc.textFrames;
  }

  // Ottieni tutte le chiavi di colonna presenti nel CSV per la scansione multi-campo
  var keys = [];
  if (dataset && dataset.length > 0) {
    for (var key in dataset[0]) {
      if (dataset[0].hasOwnProperty(key)) {
        keys.push(key);
      }
    }
  }

  function containsPlaceholderForKey(text, keyName) {
    if (!text) return false;
    var templates = [
      "{?" + keyName + "}",
      "{{" + keyName + "}}",
      "{" + keyName + "}",
      "{?" + keyName.toUpperCase() + "}",
      "{{" + keyName.toUpperCase() + "}}",
      "{" + keyName.toUpperCase() + "}",
      "{?" + keyName.toLowerCase() + "}",
      "{{" + keyName.toLowerCase() + "}}",
      "{" + keyName.toLowerCase() + "}"
    ];
    for (var t = 0; t < templates.length; t++) {
      if (text.indexOf(templates[t]) !== -1) {
        return true;
      }
    }
    return false;
  }

  // Costruisci una mappa: per ciascuna colonna trova la lista dei rispettivi frame che la contengono
  var keyToFrames = {};
  for (var kIdx = 0; kIdx < keys.length; kIdx++) {
    keyToFrames[keys[kIdx]] = [];
  }

  for (var i = 0; i < allFrames.length; i++) {
    var f = allFrames[i];
    try {
      if (f.contents) {
        for (var kIdx = 0; kIdx < keys.length; kIdx++) {
          var kName = keys[kIdx];
          if (containsPlaceholderForKey(f.contents, kName)) {
            keyToFrames[kName].push(f);
          }
        }
      }
    } catch (e) {}
  }

  // Verifica quali caselle totali saranno modificate analizzando l'univocità dei frame raccolti
  var uniqueFrames = [];
  function addUniqueFrame(tf) {
    for (var ufd = 0; ufd < uniqueFrames.length; ufd++) {
      if (uniqueFrames[ufd] === tf) return;
    }
    uniqueFrames.push(tf);
  }

  for (var kName in keyToFrames) {
    if (keyToFrames.hasOwnProperty(kName)) {
      var arr = keyToFrames[kName];
      for (var fIdx = 0; fIdx < arr.length; fIdx++) {
        addUniqueFrame(arr[fIdx]);
      }
    }
  }

  var totalUniqueCount = uniqueFrames.length;

  if (totalUniqueCount === 0) {
    var userPh = config.targetPlaceholder || "{{Nome}}";
    alert(
      "Errore:\\nNessuna casella di testo con segnaposto valida rilevata nel documento (es. '" + userPh + "').\\n\\n" +
      "Seleziona gli elementi o assicurati che siano sbloccati ed editabili nel livello corrente.",
      "Nessun segnaposto rilevato"
    );
    return;
  }

  // Ordina indipendentemente ciascuna colonna in perfetto ordine di lettura naturale (dall'alto al basso, da sinistra a destra)
  var readingOrderSort = function(a, b) {
    var boundsA = a.geometricBounds; // [left, top, right, bottom]
    var boundsB = b.geometricBounds;
    var diffY = boundsB[1] - boundsA[1]; // b.top - a.top
    if (Math.abs(diffY) > 20) {
      return diffY;
    }
    return boundsA[0] - boundsB[0]; // Da sinistra a destra
  };

  for (var kName in keyToFrames) {
    if (keyToFrames.hasOwnProperty(kName)) {
      keyToFrames[kName].sort(readingOrderSort);
    }
  }

  // Trova il numero massimo di slot individuati per una singola colonna per iterare correttamente d'unione
  var maxSlotsCount = 0;
  for (var kName in keyToFrames) {
    if (keyToFrames.hasOwnProperty(kName)) {
      if (keyToFrames[kName].length > maxSlotsCount) {
        maxSlotsCount = keyToFrames[kName].length;
      }
    }
  }

  // Conferma l'unione speculare per indice di lettura riga per riga
  var startConfirm = confirm(
    "Unione Record in Illustrator\\n" +
    "---------------------------------------\\n" +
    "Righe CSV caricate: " + dataset.length + "\\n" +
    "Totale caselle distinte rilevate: " + totalUniqueCount + "\\n" +
    "Capacità massima per colonna: " + maxSlotsCount + " caselle parallele\\n\\n" +
    "Vuoi inserire i dati del CSV in sequenza temporale riga per riga per ciascuna casella ordinata?",
    true,
    "Conferma Unione Automatica"
  );

  if (!startConfirm) {
    return;
  }

  var successCount = 0;
  for (var k = 0; k < maxSlotsCount; k++) {
    if (k < dataset.length) {
      var record = dataset[k];
      
      // Abbina ogni colonna del record k-esimo al rispettivo k-esimo slot nell'ordine di lettura
      for (var kName in keyToFrames) {
        if (keyToFrames.hasOwnProperty(kName)) {
          var list = keyToFrames[kName];
          if (k < list.length) {
            compileFrameWithRecord(list[k], record);
          }
        }
      }
      successCount++;
    } else {
      // Svuota i segnaposto eccedenti per i quali non ci sono righe nel file CSV
      for (var kName in keyToFrames) {
        if (keyToFrames.hasOwnProperty(kName)) {
          var list = keyToFrames[kName];
          if (k < list.length) {
            list[k].contents = "";
          }
        }
      }
    }
  }

  alert(
    "Unione completata con successo!\\n" +
    "---------------------------------------\\n" +
    "Record elaborati ed abbinati: " + successCount + " su " + dataset.length + "\\n" +
    "Totale caselle testo compilate: " + totalUniqueCount + "\\n" +
    "Tutte le caselle e gli indirizzi sono stati mappati riga dopo riga ordinatamente.",
    "Operazione Completata"
  );
})();
`;

  return code;
}
