import React, { useState, createContext, useContext } from 'react';
import { MobileLayout } from './components/MobileLayout';
import { CameraModule } from './components/views/CameraModule';
import { EditorModule } from './components/views/EditorModule';
import { BrandAssetsModule } from './components/views/BrandAssetsModule';
import { ImageAssetsModule } from './components/views/ImageAssetsModule';
import { Toaster } from './components/ui/sonner';

// --- Types ---
export type AssetType = 'product' | 'model' | 'background' | 'vibe';
export type AssetCategory = 'preset' | 'user';
export type ModelStyle = 'asian' | 'korean' | 'chinese' | 'euro' | 'auto';

export interface Asset {
  id: string;
  url: string;
  type: AssetType;
  category: AssetCategory;
  name: string;
  createdAt: number;
  // Optional metadata
  tags?: string[]; 
  style?: ModelStyle; 
}

export type GeneratedImageType = 'product_display' | 'model_display' | 'edited';

export interface GeneratedImage {
  id: string;
  url: string;
  type: GeneratedImageType;
  prompt?: string;
  createdAt: number;
  isFavorite: boolean;
  // Metadata to track what was used to generate this
  usedAssets?: {
    model?: string;
    background?: string;
    vibe?: string;
  };
}

interface AppState {
  assets: Asset[];
  history: GeneratedImage[];
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  addHistory: (image: Omit<GeneratedImage, 'id' | 'createdAt' | 'isFavorite'>) => void;
  toggleFavorite: (id: string) => void;
  deleteAsset: (id: string) => void;
  saveHistoryToAsset: (historyId: string, assetType: AssetType, name: string) => void;
}

// --- Context ---
const AppContext = createContext<AppState | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};

// --- Mock Data ---
const INITIAL_ASSETS: Asset[] = [
  // Products
  {
    id: 'p1',
    type: 'product',
    category: 'user',
    name: 'Luxury Serum',
    url: 'https://images.unsplash.com/photo-1664198874755-e07f2695e663?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
  },
  // Models - User
  {
    id: 'm1',
    type: 'model',
    category: 'user',
    name: 'Studio Model A',
    url: 'https://images.unsplash.com/photo-1658860547138-1e28dfb90867?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
    style: 'euro'
  },
  // Models - Presets
  {
    id: 'pm1',
    type: 'model',
    category: 'preset',
    name: 'Japanese Style',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
    style: 'asian'
  },
  {
    id: 'pm2',
    type: 'model',
    category: 'preset',
    name: 'Korean Clean',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
    style: 'korean'
  },
  {
    id: 'pm3',
    type: 'model',
    category: 'preset',
    name: 'Western Casual',
    url: 'https://images.unsplash.com/photo-1529139574466-a302d2052505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
    style: 'euro'
  },
   {
    id: 'pm4',
    type: 'model',
    category: 'preset',
    name: 'Chinese Modern',
    url: 'https://images.unsplash.com/photo-1594751684246-34925515a838?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
    style: 'chinese'
  },
  // Backgrounds - Presets
  {
    id: 'bg1',
    type: 'background',
    category: 'preset',
    name: 'Minimal Studio',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
  },
  {
    id: 'bg2',
    type: 'background',
    category: 'preset',
    name: 'Urban Street',
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
  },
  {
    id: 'bg3',
    type: 'background',
    category: 'preset',
    name: 'Nature Soft',
    url: 'https://images.unsplash.com/photo-1518173946687-a4c88928d9fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
  },
   // Vibes - Presets
  {
    id: 'v1',
    type: 'vibe',
    category: 'preset',
    name: 'Warm & Cozy',
    url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
  },
  {
    id: 'v2',
    type: 'vibe',
    category: 'preset',
    name: 'Cool & Edgy',
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now(),
  }
];

const INITIAL_HISTORY: GeneratedImage[] = [
  {
    id: 'h1',
    type: 'product_display',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now() - 100000,
    isFavorite: true,
  },
  {
    id: 'h2',
    type: 'model_display',
    url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    createdAt: Date.now() - 200000,
    isFavorite: false,
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('camera');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [history, setHistory] = useState<GeneratedImage[]>(INITIAL_HISTORY);

  const addAsset = (asset: Omit<Asset, 'id' | 'createdAt'>) => {
    const newAsset = { 
      ...asset, 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: Date.now() 
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const addHistory = (image: Omit<GeneratedImage, 'id' | 'createdAt' | 'isFavorite'>) => {
    const newImage = { 
      ...image, 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: Date.now(), 
      isFavorite: false 
    };
    setHistory(prev => [newImage, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(img => img.id === id ? { ...img, isFavorite: !img.isFavorite } : img));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const saveHistoryToAsset = (historyId: string, assetType: AssetType, name: string) => {
    const historyItem = history.find(h => h.id === historyId);
    if (historyItem) {
      addAsset({
        url: historyItem.url,
        type: assetType,
        category: 'user',
        name: name || 'Saved from History'
      });
    }
  };

  return (
    <AppContext.Provider value={{ assets, history, addAsset, addHistory, toggleFavorite, deleteAsset, saveHistoryToAsset }}>
      <MobileLayout currentTab={currentTab} onTabChange={setCurrentTab}>
        {currentTab === 'camera' && <CameraModule />}
        {currentTab === 'editor' && <EditorModule />}
        {currentTab === 'brand' && <BrandAssetsModule />}
        {currentTab === 'gallery' && <ImageAssetsModule />}
      </MobileLayout>
      <Toaster />
    </AppContext.Provider>
  );
}
