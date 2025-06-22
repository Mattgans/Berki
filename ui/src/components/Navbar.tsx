import './navbar.css'; 

import React from 'react';
import type { Tab } from "../types.ts";
import { IconGraphFilled, IconCoinFilled, IconNews } from 'npm:@tabler/icons-react'; // Assuming you have this icon
// import { ChartBarIcon, CurrencyDollarIcon, NewspaperIcon } from './icons'; // Assuming you have these icons

interface NavbarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}


const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
    const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'stocks', label: 'Stocks', icon: <></> },
        { id: 'crypto', label: 'Crypto', icon: <></> },
        { id: 'news', label: 'News', icon: <></> },
        // { id: 'stocks', label: 'Stocks', icon: <IconGraphFilled /> },
        // { id: 'crypto', label: 'Crypto', icon: <IconCoinFilled /> },
        // { id: 'news', label: 'News', icon: <IconNews /> },
    ];

    return (
        <div className="navbar">
            <h1>TradeSim Pro</h1>
            <div className="tabs">
                {navItems.map((item) => (
                    <button
                        type="button"
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${activeTab === item.id
                                ? 'bg-brand-primary text-white'
                                : 'text-dark-text-secondary hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>
        </div >
    );
};

export default Navbar;