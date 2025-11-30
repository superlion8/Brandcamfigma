import React from 'react';
import { Camera, Briefcase, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from './ui/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileLayout({ children, currentTab, onTabChange }: MobileLayoutProps) {
  const showNav = currentTab !== 'camera';
  
  const tabs = [
    { id: 'brand', label: '品牌资产', icon: Briefcase },
    { id: 'camera', label: '', icon: Camera, isSpecial: true },
    { id: 'gallery', label: '图库', icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-50 dark:bg-zinc-900 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-zinc-950">
        {children}
      </div>

      {/* Bottom Navigation */}
      {showNav && (
        <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 shrink-0 z-50 relative pb-[env(safe-area-inset-bottom)] h-[calc(4rem+env(safe-area-inset-bottom))] box-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            if (tab.isSpecial) {
                return (
                    <div key={tab.id} className="relative flex items-center justify-center -mt-6 pointer-events-none h-16">
                        <button
                            onClick={() => onTabChange(tab.id)}
                            className="w-16 h-16 bg-black text-white rounded-full shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
                        >
                            <Camera size={28} />
                        </button>
                    </div>
                );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-16 space-y-1 transition-colors duration-200",
                  isActive 
                    ? "text-black dark:text-white font-medium" 
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
