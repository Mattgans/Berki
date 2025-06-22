import './portfoliodisplay.css'

import React from 'react';
import type { PortfolioItem, Stock, Crypto } from "../types.ts";
import { IconBriefcase2Filled, IconCurrencyDollar } from '@tabler/icons-react'; // Assuming icons

interface PortfolioDisplayProps {
    portfolio: {
        cash: number;
        items: PortfolioItem[];
    };
    stocks: Stock[];
    cryptos: Crypto[];
}

export const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ portfolio, stocks, cryptos }) => {
    const getAssetCurrentPrice = (assetId: string, assetType: 'stock' | 'crypto'): number => {
        const allAssets: (Stock | Crypto)[] = [...stocks, ...cryptos];
        const asset = allAssets.find(a => a.id === assetId && a.assetType === assetType);
        return asset ? asset.price : 0;
    };

    const totalPortfolioValue = portfolio.items.reduce((total, item) => {
        const currentPrice = getAssetCurrentPrice(item.assetId, item.assetType);
        return total + (item.quantity * currentPrice);
    }, 0);

    const totalAccountValue = portfolio.cash + totalPortfolioValue;

    return (
        <div className="portfolio">
            <IconBriefcase2Filled />
            <h2>My Portfolio</h2>

            <span>Total Account Value:</span>
            <span>${totalAccountValue.toFixed(2)}</span>
            <div className="line-item">
                <span>Cash Balance:</span>
                <IconCurrencyDollar /> <span className="money">${portfolio.cash.toFixed(2)}</span>
            </div>
            <div className="line-item">
                <span>Holdings Value:</span>
                <span className="money">${totalPortfolioValue.toFixed(2)}</span>
            </div>

            {portfolio.items.length > 0 && (
                <div>
                    <h3>Holdings:</h3>
                    <ul>
                        {portfolio.items.map((item) => {
                            const currentPrice = getAssetCurrentPrice(item.assetId, item.assetType);
                            const currentValue = item.quantity * currentPrice;
                            const totalCost = item.quantity * item.averageBuyPrice;
                            const profitLoss = currentValue - totalCost;
                            const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                            const isProfit = profitLoss >= 0;

                            return (
                                <li key={`${item.assetType}-${item.assetId}`}>
                                    <div>
                                        <span>{item.name} ({item.symbol})</span>
                                        <span>{item.assetType === 'stock' ? 'Stock' : 'Crypto'}</span>
                                    </div>
                                    <div>
                                        <span>Qty: {item.quantity.toFixed(item.assetType === 'crypto' ? 4 : 2)}</span>
                                        <span>Avg. Price: ${item.averageBuyPrice.toFixed(2)}</span>
                                        <span>Current Price: ${currentPrice.toFixed(2)}</span>
                                        <span>Value: ${currentValue.toFixed(2)}</span>
                                    </div>
                                    <div className={`${isProfit ? 'money' : 'loss'}`}>
                                        P/L: ${profitLoss.toFixed(2)} ({profitLossPercent.toFixed(2)}%)
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
            {portfolio.items.length === 0 && (
                <p>No assets in portfolio.</p>
            )}
        </div>
    );
};
