import React from 'react';
import { Camera, Wand2, Briefcase, Image as ImageIcon } from 'lucide-react';
import { cn } from './ui/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileLayout({ children, currentTab, onTabChange }: MobileLayoutProps) {
  const tabs = [
    { id: 'camera', label: '相机', icon: Camera },
    { id: 'editor', label: '修图', icon: Wand2 },
    { id: 'brand', label: '品牌资产', icon: Briefcase },
    { id: 'gallery', label: '图库', icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-zinc-950">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around shrink-0 z-50 safe-area-pb">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
