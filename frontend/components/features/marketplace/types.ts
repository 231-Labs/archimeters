export interface Atelier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  poolId: string;
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  title: string;
  author: string;
  price: string;
  description?: string;
  artistStatement?: string;
  artistName?: string;
  artistAddress?: string;
  isLoading: boolean;
  error: string | null;
}

export interface Sculpt {
  id: string;
  atelierId: string;
  blueprint: string;
  photoBlobId: string;
  stlBlobId: string;
  glbBlobId: string;
  creator: string;
  paramKeys: string[];
  paramValues: string[];
  price: string;
  kioskId: string;
  glbUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface KioskInfo {
  kioskId: string;
  kioskCapId: string;
}

