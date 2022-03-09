export interface PageManifestConfig {
  title: string;
}

export interface PageManifestResultTemplate {
  markup: string;
  attributes: Record<string, string>;
}

export interface PageManifestResults {
  placeholder: string;
  attributes: Record<string, string>;
  templates: PageManifestResultTemplate[];
}

export interface PageManifestStyle {
  theme: string;
  layout: string;
}

export interface PageManifest {
  markup: string;
  results: PageManifestResults;
  style: PageManifestStyle;
  config: PageManifestConfig;
}
