export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

export interface GeneratorSettings {
  targetPlaceholder: string; // e.g. '{{Nome}}'
  projectName?: string;
  clientBrand?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  headers: string[];
  rows: Record<string, string>[];
}
