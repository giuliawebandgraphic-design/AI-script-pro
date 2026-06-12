import { Preset } from './types';

export const CSV_PRESETS: Preset[] = [
  {
    id: 'buste',
    name: 'Intestazione buste',
    description: 'Gestione nomi e indirizzi di spedizione per buste e partecipazioni.',
    placeholder: '{{Nome}} {{Cognome}}',
    headers: ['Nome', 'Cognome', 'Indirizzo'],
    rows: [
      { Nome: 'Andrea', Cognome: 'Sartori', Indirizzo: 'Via Garibaldi 12' },
      { Nome: 'Clara', Cognome: 'Marini', Indirizzo: 'Corso Sempione 45' },
      { Nome: 'Filippo', Cognome: 'Rizzo', Indirizzo: 'Viale Europa 8' },
      { Nome: 'Elena', Cognome: 'Donati', Indirizzo: 'Piazza del Popolo 3' },
    ],
  },
  {
    id: 'menu',
    name: 'Dati Menù',
    description: 'Portate del banchetto di nozze, ingredienti e avvisi intolleranze alimentari degli invitati.',
    placeholder: '{{Portata}}',
    headers: ['Portata', 'Categoria', 'Nota_Intolleranza'],
    rows: [
      { Portata: 'Risotto ai funghi porcini e tartufo', Categoria: 'Primo', Nota_Intolleranza: 'Senza Lattosio' },
      { Portata: 'Filetto di orata in crosta di patate', Categoria: 'Secondo', Nota_Intolleranza: 'Nessuna' },
      { Portata: 'Lasagnetta di verdure dell’orto', Categoria: 'Primo Vegetariano', Nota_Intolleranza: 'Gluten Free' },
      { Portata: 'Mousse al cioccolato fondente 70%', Categoria: 'Dessert', Nota_Intolleranza: 'Nessuna' },
    ],
  },
  {
    id: 'segnaposto',
    name: 'Dati Segnaposto',
    description: 'Cartellini nominativi personali da inserire sui tavoli della sala del banchetto.',
    placeholder: '{{Invitato}}',
    headers: ['Invitato', 'Tavolo', 'Menu_Speciale'],
    rows: [
      { Invitato: 'Zia Caterina', Tavolo: 'Tavolo Imperiale 1', Menu_Speciale: 'No' },
      { Invitato: 'Leonardo Rossi', Tavolo: 'Tavolo Rose', Menu_Speciale: 'Menù Bambino' },
      { Invitato: 'Ilaria Ferri', Tavolo: 'Tavolo Girasoli', Menu_Speciale: 'No' },
      { Invitato: 'Marco Mastronardi', Tavolo: 'Tavolo Imperiale 2', Menu_Speciale: 'Vegano' },
    ],
  },
  {
    id: 'tableau',
    name: 'Dati Tableau',
    description: 'Composizione dei singoli tavoli e suddivisione dei gruppi per la stampa del Tableau de Mariage.',
    placeholder: 'Tavolo {{Tavolo_Nome}}',
    headers: ['Tavolo_Nome', 'Invitati', 'Numero_Persone'],
    rows: [
      { Tavolo_Nome: 'Orchidea', Invitati: 'Marco, Elena, Alice, Roberto', Numero_Persone: '4' },
      { Tavolo_Nome: 'Gelsomino', Invitati: 'Giacomo, Marta, Sofia, Luca', Numero_Persone: '4' },
      { Tavolo_Nome: 'Peonia', Invitati: 'Zia Caterina, Nonna Isa, Zio Franco', Numero_Persone: '3' },
      { Tavolo_Nome: 'Ortensia', Invitati: 'Matteo, Clara, Alice, Giovanni', Numero_Persone: '4' },
    ],
  },
];
