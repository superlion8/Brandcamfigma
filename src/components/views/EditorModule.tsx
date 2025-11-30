import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Wand2, Image as ImageIcon, Check, Layout, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAppStore, Asset, ModelStyle } from '../../App';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

const MOCK_RESULT = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";

export function EditorModule() {
  const { assets, addHistory } = useAppStore();
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Selections
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter assets
  const backgroundAssets = assets.filter(a => a.type === 'background');
  const modelAssets = assets.filter(a => a.type === 'model');
  const vibeAssets = assets.filter(a => a.type === 'vibe');
  
  // Derived
  const activeBg = assets.find(a => a.id === selectedBg);
  const activeModel = assets.find(a => a.id === selectedModel);
  const activeVibe = assets.find(a => a.id === selectedVibe);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage("https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800");
      setResult(null);
    }
  };

  const handleGenerate = () => {
    if (!image) return;
    
    setIsGenerating(true);
    
    // Construct prompt
    const finalPrompt = `
      Original Image: {{image}}
      User Prompt: ${prompt}
      ${activeModel ? `Model: {{${activeModel.name}}}` : ''}
      ${activeBg ? `Background: {{${activeBg.name}}}` : ''}
      ${activeVibe ? `Vibe: {{${activeVibe.name}}}` : ''}
    `;
    console.log("Editor Generating:", finalPrompt);

    setTimeout(() => {
        setResult(MOCK_RESULT + `&sig=${Date.now()}`);
        setIsGenerating(false);
        addHistory({
            url: MOCK_RESULT,
            type: 'edited',
            prompt: finalPrompt,
            usedAssets: {
                model: activeModel?.id,
                background: activeBg?.id,
                vibe: activeVibe?.id
            }
        });
        toast.success("编辑完成");
    }, 3000);
  };

  const AssetGrid = ({ items, selectedId, onSelect }: { items: Asset[], selectedId: string | null, onSelect: (id: string) => void }) => (
    <div className="grid grid-cols-3 gap-3">
      {items.map(asset => (
        <button
          key={asset.id}
          onClick={() => onSelect(asset.id)}
          className={cn(
            "aspect-square rounded-lg overflow-hidden relative border-2 transition-all",
            selectedId === asset.id ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent"
          )}
        >
          <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
          {selectedId === asset.id && (
            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-white drop-shadow-md" />
            </div>
          )}
           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 pt-3">
             <p className="text-[10px] text-white truncate text-center">{asset.name}</p>
           </div>
        </button>
      ))}
    </div>
  );

  if (isGenerating) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
             <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin relative z-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI 正在重绘...</h3>
            <p className="text-zinc-400 text-sm">应用您的 Prompt 与 风格选择</p>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="h-14 border-b bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 font-semibold">
        图像编辑
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Image Area */}
        <div className="bg-zinc-100 dark:bg-zinc-900 min-h-[300px] flex items-center justify-center relative p-4">
            {!image ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-64 h-64 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                >
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <span>点击上传图片</span>
                </div>
            ) : (
                <div className="relative w-full max-w-sm">
                     <img src={result || image} className="w-full rounded-lg shadow-lg" alt="Preview" />
                     {result && <Badge className="absolute top-2 right-2 bg-green-500">已生成</Badge>}
                     {!result && <Badge className="absolute top-2 right-2 bg-zinc-500">原图</Badge>}
                     
                     <Button 
                        variant="secondary" 
                        size="sm" 
                        className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
                        onClick={() => { setImage(null); setResult(null); }}
                     >
                        重选
                     </Button>
                </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-6 bg-white dark:bg-zinc-950 rounded-t-xl -mt-4 shadow-lg relative z-10 min-h-[400px]">
            
            {/* Prompt Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">编辑指令 (Prompt)</label>
                <Textarea 
                    placeholder="例如：把背景换成海边，让光线更柔和..." 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-zinc-50"
                />
            </div>

            {/* Assets Selection */}
            <Tabs defaultValue="model" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="model">模特</TabsTrigger>
                    <TabsTrigger value="bg">背景</TabsTrigger>
                    <TabsTrigger value="vibe">氛围</TabsTrigger>
                </TabsList>
                <div className="mt-4 bg-zinc-50 p-4 rounded-lg border">
                    <TabsContent value="model" className="mt-0">
                         <AssetGrid items={modelAssets} selectedId={selectedModel} onSelect={(id) => setSelectedModel(selectedModel === id ? null : id)} />
                         {modelAssets.length === 0 && <p className="text-center text-zinc-400 text-sm py-4">暂无模特资产</p>}
                    </TabsContent>
                    <TabsContent value="bg" className="mt-0">
                        <AssetGrid items={backgroundAssets} selectedId={selectedBg} onSelect={(id) => setSelectedBg(selectedBg === id ? null : id)} />
                        {backgroundAssets.length === 0 && <p className="text-center text-zinc-400 text-sm py-4">暂无背景资产</p>}
                    </TabsContent>
                    <TabsContent value="vibe" className="mt-0">
                        <AssetGrid items={vibeAssets} selectedId={selectedVibe} onSelect={(id) => setSelectedVibe(selectedVibe === id ? null : id)} />
                        {vibeAssets.length === 0 && <p className="text-center text-zinc-400 text-sm py-4">暂无氛围资产</p>}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white dark:bg-zinc-900 shrink-0">
         <Button 
            className="w-full h-12 text-lg gap-2 bg-purple-600 hover:bg-purple-700" 
            onClick={handleGenerate}
            disabled={!image}
         >
            <Wand2 className="w-5 h-5" />
            Generate (生成)
         </Button>
      </div>
    </div>
  );
}
