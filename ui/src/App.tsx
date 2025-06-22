
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from "./components/Navbar.tsx";
// import { StockView } from './components/StockView';
// import { CryptoView } from './components/CryptoView';
// import { NewsView } from './components/NewsView';
// import { PortfolioDisplay } from './components/PortfolioDisplay';
// import { TradeModal } from './components/TradeModal';
import type { Tab } from "./types.ts";
// import type { Tab, Asset, Stock, Crypto, PortfolioItem, TradeDetails } from './types';
// import { INITIAL_STOCKS, INITIAL_CRYPTOS, INITIAL_CASH_BALANCE } from './constants';
// import { simulatePriceChange } from './services/mockPriceService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('stocks');
  // const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  // const [cryptos, setCryptos] = useState<Crypto[]>(INITIAL_CRYPTOS);
  // const [portfolio, setPortfolio] = useState<{ cash: number; items: PortfolioItem[] }>({
    // cash: INITIAL_CASH_BALANCE,
    // items: [],
  // }
// );
  // const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  // const [selectedAssetForTrade, setSelectedAssetForTrade] = useState<Asset | null>(null);
  // const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  // const updatePrices = useCallback(() => {
  //   setStocks(prevStocks => prevStocks.map(stock => ({ ...stock, price: simulatePriceChange(stock.price) })));
  //   setCryptos(prevCryptos => prevCryptos.map(crypto => ({ ...crypto, price: simulatePriceChange(crypto.price) })));
  // }, []);

  // useEffect(() => {
  //   const intervalId = setInterval(updatePrices, 5000); // Update prices every 5 seconds
  //   return () => clearInterval(intervalId);
  // }, [updatePrices]);

  // const handleOpenTradeModal = (asset: Asset, type: 'buy' | 'sell') => {
  //   setSelectedAssetForTrade(asset);
  //   setTradeType(type);
  //   setIsTradeModalOpen(true);
  // };

  // const handleCloseTradeModal = () => {
  //   setIsTradeModalOpen(false);
  //   setSelectedAssetForTrade(null);
  // };

  // const handleExecuteTrade = (tradeDetails: TradeDetails) => {
  //   const { asset, quantity, type } = tradeDetails;
  //   const costOrProceeds = asset.price * quantity;

  //   setPortfolio(prevPortfolio => {
  //     const newPortfolio = { ...prevPortfolio };
  //     let existingItem = newPortfolio.items.find(item => item.assetId === asset.id && item.assetType === (asset.assetType || (activeTab === 'stocks' ? 'stock' : 'crypto')));
      
  //     if (type === 'buy') {
  //       if (newPortfolio.cash < costOrProceeds) {
  //         alert("Not enough cash to make this purchase.");
  //         return prevPortfolio;
  //       }
  //       newPortfolio.cash -= costOrProceeds;
  //       if (existingItem) {
  //         const totalQuantity = existingItem.quantity + quantity;
  //         existingItem.averageBuyPrice = ((existingItem.averageBuyPrice * existingItem.quantity) + costOrProceeds) / totalQuantity;
  //         existingItem.quantity = totalQuantity;
  //       } else {
  //         newPortfolio.items.push({
  //           assetId: asset.id,
  //           symbol: asset.symbol,
  //           name: asset.name,
  //           quantity: quantity,
  //           averageBuyPrice: asset.price,
  //           assetType: asset.assetType || (activeTab === 'stocks' ? 'stock' : 'crypto'),
  //           logoUrl: asset.logoUrl
  //         });
  //       }
  //     } else { // Sell
  //       if (!existingItem || existingItem.quantity < quantity) {
  //         alert("Not enough assets to sell.");
  //         return prevPortfolio;
  //       }
  //       newPortfolio.cash += costOrProceeds;
  //       existingItem.quantity -= quantity;
  //       if (existingItem.quantity === 0) {
  //         newPortfolio.items = newPortfolio.items.filter(item => item.assetId !== asset.id || item.assetType !== asset.assetType);
  //       }
  //     }
  //     return newPortfolio;
  //   });
  //   handleCloseTradeModal();
  // };
  
  // const renderActiveTab = () => {
  //   switch (activeTab) {
  //     case 'stocks':
  //       return <StockView stocks={stocks} onTrade={handleOpenTradeModal} portfolioItems={portfolio.items} />;
  //     case 'crypto':
  //       return <CryptoView cryptos={cryptos} onTrade={handleOpenTradeModal} portfolioItems={portfolio.items} />;
  //     case 'news':
  //       return <NewsView />;
  //     default:
  //       return null;
  //   }
  // };

  return (
    <div className="container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        <div>
          <div>
            <p>Tab Here</p>
            {/* {renderActiveTab()} */}
          </div>
          <div className="lg:col-span-1">
            <p>Portfolio here</p>
            {/* <PortfolioDisplay portfolio={portfolio} stocks={stocks} cryptos={cryptos} /> */}
          </div>
        </div>
      </main>
      {/* {isTradeModalOpen && selectedAssetForTrade && (
        <TradeModal
          asset={selectedAssetForTrade}
          tradeType={tradeType}
          isOpen={isTradeModalOpen}
          onClose={handleCloseTradeModal}
          onExecuteTrade={handleExecuteTrade}
          cashBalance={portfolio.cash}
          portfolioItems={portfolio.items}
        />
      )} */}
    </div>
  );
};

export default App;
