import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Loader2, Upload, Sparkles, Image as ImageIcon, Aperture, X, User, Layout, Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useAppStore, Asset, ModelStyle } from '../../App';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

// Mock result images for demonstration
const MOCK_RESULTS = {
  product: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  ],
  model: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'https://images.unsplash.com/photo-1529139574466-a302d2052505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  ]
};

const MODEL_STYLES: { id: ModelStyle, label: string }[] = [
  { id: 'asian', label: '日系 (Asian)' },
  { id: 'korean', label: '韩系 (Korean)' },
  { id: 'chinese', label: '中式 (Chinese)' },
  { id: 'euro', label: '欧美 (Western)' },
];

export function CameraModule() {
  const { addHistory, assets } = useAppStore();
  const [mode, setMode] = useState<'camera' | 'setup' | 'processing' | 'results'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Selections
  const [selectedBg, setSelectedBg] = useState<string | null>(null); // ID
  const [selectedModel, setSelectedModel] = useState<string | null>(null); // ID
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null); // ID
  const [selectedModelStyle, setSelectedModelStyle] = useState<ModelStyle | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter assets
  const backgroundAssets = assets.filter(a => a.type === 'background');
  const modelAssets = assets.filter(a => a.type === 'model');
  const vibeAssets = assets.filter(a => a.type === 'vibe');

  // Derived selections
  const activeBg = assets.find(a => a.id === selectedBg);
  const activeModel = assets.find(a => a.id === selectedModel);
  const activeVibe = assets.find(a => a.id === selectedVibe);

  const handleCapture = () => {
    // Mock capture
    setCapturedImage("https://images.unsplash.com/photo-1629198688000-71f23e745b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800");
    setMode('setup');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd read the file. Here we just use a mock URL for "uploaded" state
      setCapturedImage("https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800");
      setMode('setup');
    }
  };

  const handleShootIt = () => {
    setMode('processing');
    
    // Construct prompt for debugging/mocking
    let modelPrompt = "";
    if (activeModel) {
        modelPrompt += `use the model shown in {{${activeModel.name}}}`;
        if (activeModel.style) modelPrompt += `, in a style of {{${activeModel.style}}}`;
    } else if (selectedModelStyle) {
        modelPrompt += `use a model in a style of {{${selectedModelStyle}}}`;
    }

    const prompt = `
      you are a professional brand photographer.
      Product: {{captured_product}}
      ${modelPrompt}
      ${activeBg ? `Background: consistent to {{${activeBg.name}}}` : ''}
      ${activeVibe ? `Vibe: consistent to {{${activeVibe.name}}}` : ''}
    `;
    console.log("Generating with prompt:", prompt);

    setTimeout(() => {
      setMode('results');
      
      // Add 2 Product shots
      MOCK_RESULTS.product.forEach((url, i) => {
        addHistory({
          url: url + `&sig=${Date.now()}-${i}`,
          type: 'product_display',
          prompt: "Product display shot",
        });
      });

      // Add 2 Model shots
      MOCK_RESULTS.model.forEach((url, i) => {
        addHistory({
          url: url + `&sig=${Date.now()}-${i}`,
          type: 'model_display',
          prompt: prompt,
          usedAssets: {
              model: activeModel?.id,
              background: activeBg?.id,
              vibe: activeVibe?.id
          }
        });
      });
      
      toast.success("生成完成！已保存至历史记录");
    }, 3000);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedBg(null);
    setSelectedModel(null);
    setSelectedVibe(null);
    setSelectedModelStyle(null);
    setMode('camera');
  };

  const AssetGrid = ({ 
      items, 
      selectedId, 
      onSelect 
  }: { 
      items: Asset[], 
      selectedId: string | null, 
      onSelect: (id: string) => void 
  }) => (
    <div className="grid grid-cols-3 gap-3 p-1">
      {items.map(asset => (
        <button
          key={asset.id}
          onClick={() => onSelect(asset.id)}
          className={cn(
            "aspect-square rounded-lg overflow-hidden relative border-2 transition-all group",
            selectedId === asset.id ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent hover:border-zinc-200"
          )}
        >
          <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
          {asset.category === 'preset' && (
             <div className="absolute top-1 right-1 bg-black/60 p-0.5 rounded text-[8px] text-white px-1">官方</div>
          )}
          {selectedId === asset.id && (
            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-white drop-shadow-md" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 pt-4">
            <p className="text-[10px] text-white truncate text-center">{asset.name}</p>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full relative flex flex-col">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      <AnimatePresence mode="wait">
        {mode === 'camera' && (
          <motion.div 
            key="camera"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 relative bg-black overflow-hidden flex flex-col"
          >
            {/* Viewfinder */}
            <div className="flex-1 relative group">
              <img 
                src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                alt="Camera Preview"
              />
              {/* Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                 <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/20"></div>
                    ))}
                 </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border border-white/50 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-white"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-white"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-white"></div>
                </div>
              </div>
              <div className="absolute top-8 left-0 right-0 text-center text-white/80 text-sm font-medium px-4 drop-shadow-md">
                拍摄您的商品
              </div>
            </div>

            {/* Controls */}
            <div className="h-32 bg-black/90 flex items-center justify-around px-8 pb-6">
               <button 
                 onClick={handleUploadClick}
                 className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
               >
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                 </div>
                 <span className="text-[10px]">相册</span>
               </button>

              <button 
                onClick={handleCapture}
                className="w-18 h-18 rounded-full border-4 border-white/30 flex items-center justify-center relative group active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 bg-white rounded-full group-active:bg-gray-200 transition-colors border-2 border-black"></div>
              </button>

               <div className="w-10 flex flex-col items-center gap-1 text-white/40">
                 <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center border border-white/20">
                    <Aperture className="w-5 h-5" />
                 </div>
                 <span className="text-[10px]">设置</span>
               </div>
            </div>
          </motion.div>
        )}

        {mode === 'setup' && (
           <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b bg-white dark:bg-zinc-900 shrink-0 z-20">
               <Button variant="ghost" size="icon" onClick={handleRetake} className="-ml-2">
                 <ArrowLeft className="w-5 h-5" />
               </Button>
               <span className="font-semibold">Studio 配置</span>
               <div className="w-8"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top: Preview */}
                <div className="h-48 bg-zinc-100 dark:bg-zinc-900 relative shrink-0 flex justify-center items-center p-4">
                    <div className="relative h-full aspect-[3/4] shadow-lg rounded-md overflow-hidden">
                         {capturedImage && (
                            <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                        )}
                        {/* Overlays for selection feedback */}
                        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 p-1">
                             {activeModel && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-white/80 backdrop-blur">模特: {activeModel.name}</Badge>}
                             {selectedModelStyle && !activeModel && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-white/80 backdrop-blur">风格: {MODEL_STYLES.find(s => s.id === selectedModelStyle)?.label}</Badge>}
                             {activeBg && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-white/80 backdrop-blur">背景: {activeBg.name}</Badge>}
                        </div>
                    </div>
                </div>

                {/* Bottom: Tabs */}
                <div className="flex-1 bg-white dark:bg-zinc-950 rounded-t-xl -mt-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10 flex flex-col overflow-hidden relative">
                    <Tabs defaultValue="model" className="flex-1 flex flex-col">
                        <div className="px-4 pt-2 border-b">
                            <TabsList className="w-full grid grid-cols-3 h-12 bg-transparent">
                                <TabsTrigger value="model" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-black rounded-none border-b-2 border-transparent data-[state=active]:border-black transition-none pb-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span className="text-[10px]">模特</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="bg" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-black rounded-none border-b-2 border-transparent data-[state=active]:border-black transition-none pb-3">
                                     <div className="flex flex-col items-center gap-1">
                                        <Layout className="w-4 h-4" />
                                        <span className="text-[10px]">背景</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="vibe" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-black rounded-none border-b-2 border-transparent data-[state=active]:border-black transition-none pb-3">
                                     <div className="flex flex-col items-center gap-1">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-[10px]">氛围</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50">
                            <TabsContent value="model" className="mt-0 space-y-6">
                                {/* Style Presets */}
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 mb-3 uppercase">人种风格 (如果不选具体模特)</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {MODEL_STYLES.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => {
                                                    setSelectedModelStyle(selectedModelStyle === style.id ? null : style.id);
                                                    if (selectedModelStyle !== style.id) setSelectedModel(null); // Clear specific model if picking style
                                                }}
                                                className={cn(
                                                    "h-10 px-3 rounded-md text-sm font-medium border transition-colors text-left flex items-center justify-between",
                                                    selectedModelStyle === style.id 
                                                        ? "bg-blue-50 border-blue-200 text-blue-700" 
                                                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                                )}
                                            >
                                                {style.label}
                                                {selectedModelStyle === style.id && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Specific Model Assets */}
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 mb-3 uppercase">我的模特资产</h3>
                                    <AssetGrid 
                                        items={modelAssets} 
                                        selectedId={selectedModel} 
                                        onSelect={(id) => {
                                            const newId = selectedModel === id ? null : id;
                                            setSelectedModel(newId);
                                            if (newId) setSelectedModelStyle(null); // Clear style if picking specific model
                                        }} 
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="bg" className="mt-0 space-y-6">
                                <p className="text-xs text-zinc-400 mb-2">选择背景图以保持一致性</p>
                                <AssetGrid items={backgroundAssets} selectedId={selectedBg} onSelect={(id) => setSelectedBg(selectedBg === id ? null : id)} />
                            </TabsContent>

                            <TabsContent value="vibe" className="mt-0 space-y-6">
                                <p className="text-xs text-zinc-400 mb-2">选择整体氛围风格</p>
                                <AssetGrid items={vibeAssets} selectedId={selectedVibe} onSelect={(id) => setSelectedVibe(selectedVibe === id ? null : id)} />
                            </TabsContent>
                        </div>
                    </Tabs>
                    
                    {/* Footer Action */}
                    <div className="p-4 border-t bg-white dark:bg-zinc-900 shadow-up z-20">
                        <Button 
                            size="lg" 
                            className="w-full h-12 text-base gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" 
                            onClick={handleShootIt}
                        >
                            <Wand2 className="w-5 h-5" />
                            Shoot It (生成)
                        </Button>
                    </div>
                </div>
            </div>
           </motion.div>
        )}

        {mode === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
            </div>
            
            <h3 className="text-white text-2xl font-bold mb-2">AI 正在拍摄...</h3>
            <div className="text-zinc-400 space-y-1 text-sm">
                <p>分析商品光影...</p>
                {activeModel && <p>生成模特 {activeModel.name} ...</p>}
                {selectedModelStyle && !activeModel && <p>匹配{MODEL_STYLES.find(s => s.id === selectedModelStyle)?.label}风格...</p>}
                {activeBg && <p>渲染场景背景...</p>}
            </div>
          </motion.div>
        )}

        {mode === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
          >
            <div className="h-14 flex items-center px-4 border-b bg-white dark:bg-zinc-900 z-10">
              <Button variant="ghost" size="icon" onClick={handleRetake} className="-ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-semibold ml-2">本次成片</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-10">
              <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                        商品静物图
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MOCK_RESULTS.product.map((url, i) => (
                    <div key={i} className="group relative aspect-[4/5] bg-zinc-100 rounded-lg overflow-hidden shadow-sm border border-zinc-200">
                      <img src={url} className="w-full h-full object-cover" alt="Result" />
                      <div className="absolute top-2 right-2 bg-white/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                         <Check className="w-3 h-3 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-4 bg-purple-600 rounded-full"></span>
                        模特展示图
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MOCK_RESULTS.model.map((url, i) => (
                    <div key={i} className="group relative aspect-[4/5] bg-zinc-100 rounded-lg overflow-hidden shadow-sm border border-zinc-200">
                      <img src={url} className="w-full h-full object-cover" alt="Result" />
                      <div className="absolute top-2 right-2 bg-white/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                         <Check className="w-3 h-3 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
               <Button className="w-full h-12 text-lg" onClick={handleRetake}>
                 拍摄下一组
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
