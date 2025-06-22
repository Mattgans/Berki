
export type Tab = 'stocks' | 'crypto' | 'news';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  logoUrl?: string;
  assetType?: 'stock' | 'crypto'; // Explicitly define asset type
}

export interface Stock extends Asset {
  assetType: 'stock';
  marketCap?: number; // Example additional property for stocks
}

export interface Crypto extends Asset {
  assetType: 'crypto';
  circulatingSupply?: number; // Example additional property for cryptos
}

export interface PortfolioItem {
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  assetType: 'stock' | 'crypto';
  logoUrl?: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  sourceUrl?: string;
  publishedDate?: string; // Consider adding a date if available
  imageUrl?: string; 
}

export interface TradeDetails {
  asset: Asset;
  quantity: number;
  type: 'buy' | 'sell';
}

export interface GroundingChunkWeb {
  uri?: string; // Made optional to match @google/genai
  title?: string; // Made optional to match @google/genai and for robustness
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of grounding chunks can be added here if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata properties
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // Other candidate properties
}

// Ensure this matches the expected structure from Gemini API if you are directly typing it.
// This is a simplified version for demonstration.
export interface GeminiGenerateContentResponse {
  text: string; // Direct text output
  candidates?: Candidate[]; // For grounding metadata
}
