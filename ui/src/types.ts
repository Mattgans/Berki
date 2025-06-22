export type Tab = 'stocks' | 'crypto' | 'news';

export type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};