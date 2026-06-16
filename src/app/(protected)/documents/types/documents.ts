// Shared documents feature types are kept separate so server loading and client
// rendering can stay aligned without redefining the document contract.
export type DocumentItem = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  relativePath: string;
};

export type DocumentSection = {
  id: string;
  titleKey: string;
  items: DocumentItem[];
};

export type DocumentGroup = {
  id: string;
  titleKey: string;
  items?: DocumentItem[];
  sections?: DocumentSection[];
};

export type DocumentResource = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  relativePath: string;
  hasKorean: boolean;
  content: {
    en: string;
    ko: string;
  };
};
