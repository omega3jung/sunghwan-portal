// Shared documents feature types are kept separate so server loading and client
// rendering can stay aligned without redefining the document contract.
export type DocumentItem = {
  id: string;
  title: string;
  description: string;
  relativePath: string;
};

export type DocumentGroup = {
  id: string;
  title: string;
  items: DocumentItem[];
};

export type DocumentResource = {
  id: string;
  title: string;
  description: string;
  relativePath: string;
  hasKorean: boolean;
  content: {
    en: string;
    ko: string;
  };
};
