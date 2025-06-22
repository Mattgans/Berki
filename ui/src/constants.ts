
import type { Stock, Crypto } from './types';

export const GEMINI_API_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
// Note: Image generation model is not used in this example but kept for reference.
// export const GEMINI_API_MODEL_IMAGE = 'imagen-3.0-generate-002';


export const INITIAL_STOCKS: Stock[] = [
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', price: 170.34, assetType: 'stock', logoUrl: 'https://logo.clearbit.com/apple.com' },
  { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corp.', price: 280.56, assetType: 'stock', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2700.80, assetType: 'stock', logoUrl: 'https://logo.clearbit.com/abc.xyz' },
  { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3300.20, assetType: 'stock', logoUrl: 'https://logo.clearbit.com/amazon.com' },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', price: 1050.75, assetType: 'stock', logoUrl: 'https://logo.clearbit.com/tesla.com' },
];

export const INITIAL_CRYPTOS: Crypto[] = [
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', price: 40000.00, assetType: 'crypto', logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029' },
  { id: 'ETH', symbol: 'ETH', name: 'Ethereum', price: 3000.00, assetType: 'crypto', logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029' },
  { id: 'BNB', symbol: 'BNB', name: 'Binance Coin', price: 400.00, assetType: 'crypto', logoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=029' },
  { id: 'SOL', symbol: 'SOL', name: 'Solana', price: 100.00, assetType: 'crypto', logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=029' },
  { id: 'ADA', symbol: 'ADA', name: 'Cardano', price: 1.20, assetType: 'crypto', logoUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=029' },
];

export const INITIAL_CASH_BALANCE = 100000; // Starting cash for the user

export const NEWS_FETCH_PROMPT = `
Provide the top 5 latest financial news headlines and brief summaries relevant to stock and cryptocurrency markets.
For each news item, provide:
TITLE: [Title of the news]
SUMMARY: [Brief summary, about 2-3 sentences]
SOURCE_URL: [URL if available from search results. If multiple relevant URLs, pick the most direct one.]
IMAGE_URL: [A relevant image URL if available, otherwise leave blank or use a placeholder like https://picsum.photos/seed/{UNIQUE_SEED}/300/200 where UNIQUE_SEED is derived from the title or a random number]

Separate each news item with '---NEWS_ITEM_SEPARATOR---'.
Ensure the output is clean and directly parsable.
`;
