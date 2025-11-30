import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Loader2, Upload, Sparkles, Image as ImageIcon, SlidersHorizontal, X, User, Layout, Wand2 } from 'lucide-react';
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
  { id: 'asian', label: '日系' },
  { id: 'korean', label: '韩系' },
  { id: 'chinese', label: '中式' },
  { id: 'euro', label: '欧美' },
];

export function CameraModule({ onReturn }: { onReturn: () => void }) {
  const { addHistory, assets } = useAppStore();
  const [mode, setMode] = useState<'camera' | 'review' | 'processing' | 'results'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Panel States
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [showVibePanel, setShowVibePanel] = useState(false);
  const [activeCustomTab, setActiveCustomTab] = useState('style');

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
    setMode('review');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd read the file. Here we just use a mock URL for "uploaded" state
      setCapturedImage("https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800");
      setMode('review');
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
    <div className="grid grid-cols-3 gap-3 p-1 pb-20">
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
        {(mode === 'camera' || mode === 'review') && (
          <motion.div 
            key="camera-view"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 relative bg-black overflow-hidden flex flex-col"
          >
            {/* Top Return Button */}
            <div className="absolute top-4 left-4 z-20">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-md" 
                    onClick={mode === 'review' ? handleRetake : onReturn}
                >
                    {mode === 'review' ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                </Button>
            </div>

            {/* Viewfinder / Captured Image */}
            <div className="flex-1 relative group">
              <img 
                src={capturedImage || "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity",
                    mode === 'camera' ? "opacity-60" : "opacity-100"
                )}
                alt="Preview"
              />
              
              {/* Selection Badges Overlay */}
              <div className="absolute top-16 left-0 right-0 flex justify-center gap-2 z-10 px-4 flex-wrap pointer-events-none">
                 {selectedModelStyle && <Badge variant="secondary" className="bg-black/50 text-white border-none backdrop-blur-md">风格: {MODEL_STYLES.find(s => s.id === selectedModelStyle)?.label}</Badge>}
                 {activeModel && <Badge variant="secondary" className="bg-black/50 text-white border-none backdrop-blur-md">模特: {activeModel.name}</Badge>}
                 {activeBg && <Badge variant="secondary" className="bg-black/50 text-white border-none backdrop-blur-md">背景: {activeBg.name}</Badge>}
                 {activeVibe && <Badge variant="secondary" className="bg-black/50 text-white border-none backdrop-blur-md">氛围: {activeVibe.name}</Badge>}
              </div>

              {mode === 'camera' && (
                <>
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-30">
                     <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="border border-white/20"></div>
                        ))}
                     </div>
                  </div>
                  
                  {/* Focus Frame */}
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
                </>
              )}
            </div>

            {/* Bottom Controls Area */}
            <div className="bg-black flex flex-col justify-end pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8 px-8 relative z-20 shrink-0 min-h-[9rem]">
                {mode === 'review' ? (
                    <div className="w-full flex justify-center pb-4">
                        <Button 
                            size="lg" 
                            className="w-48 h-14 rounded-full text-lg font-semibold gap-2 bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-bottom-4" 
                            onClick={handleShootIt}
                        >
                            <Wand2 className="w-5 h-5" />
                            Shoot It
                        </Button>
                    </div>
                ) : (
                   <div className="flex items-center justify-around">
                       {/* Album */}
                       <button 
                         onClick={handleUploadClick}
                         className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors w-12"
                       >
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5" />
                         </div>
                         <span className="text-[10px]">相册</span>
                       </button>

                      {/* Shutter */}
                      <button 
                        onClick={handleCapture}
                        className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center relative group active:scale-95 transition-transform mx-4"
                      >
                        <div className="w-18 h-18 bg-white rounded-full group-active:bg-gray-200 transition-colors border-2 border-black"></div>
                      </button>

                       {/* Right Controls: Custom & Vibe */}
                       <div className="flex gap-3">
                           <button 
                             onClick={() => setShowCustomPanel(true)}
                             className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
                           >
                             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                <SlidersHorizontal className="w-5 h-5" />
                             </div>
                             <span className="text-[10px]">自定义</span>
                           </button>
                           
                           <button 
                             onClick={() => setShowVibePanel(true)}
                             className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
                           >
                             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                <Sparkles className="w-5 h-5" />
                             </div>
                             <span className="text-[10px]">氛围</span>
                           </button>
                       </div>
                    </div>
                )}
            </div>
            
            {/* Slide-up Panel: Custom */}
            <AnimatePresence>
                {showCustomPanel && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                            onClick={() => setShowCustomPanel(false)}
                        />
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 h-[60%] bg-white dark:bg-zinc-900 rounded-t-2xl z-50 flex flex-col overflow-hidden"
                        >
                            <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
                                <span className="font-semibold">自定义配置</span>
                                <Button variant="ghost" size="sm" onClick={() => setShowCustomPanel(false)} className="h-8 w-8 p-0 rounded-full">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="p-2 flex gap-2 border-b overflow-x-auto shrink-0">
                                {[
                                    { id: 'style', label: '风格' },
                                    { id: 'model', label: '模特' },
                                    { id: 'bg', label: '背景' }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveCustomTab(tab.id)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                                            activeCustomTab === tab.id 
                                                ? "bg-black text-white" 
                                                : "bg-zinc-100 text-zinc-600"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4">
                                {activeCustomTab === 'style' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {MODEL_STYLES.map(style => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => {
                                                        setSelectedModelStyle(selectedModelStyle === style.id ? null : style.id);
                                                        if (selectedModelStyle !== style.id) setSelectedModel(null);
                                                    }}
                                                    className={cn(
                                                        "h-12 px-4 rounded-lg text-sm font-medium border transition-all flex items-center justify-between",
                                                        selectedModelStyle === style.id 
                                                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" 
                                                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                                                    )}
                                                >
                                                    {style.label}
                                                    {selectedModelStyle === style.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-zinc-400 text-center mt-4">选择一种风格，AI 将自动匹配模特特征</p>
                                    </div>
                                )}
                                {activeCustomTab === 'model' && (
                                    <AssetGrid 
                                        items={modelAssets} 
                                        selectedId={selectedModel} 
                                        onSelect={(id) => {
                                            const newId = selectedModel === id ? null : id;
                                            setSelectedModel(newId);
                                            if (newId) setSelectedModelStyle(null);
                                        }} 
                                    />
                                )}
                                {activeCustomTab === 'bg' && (
                                    <AssetGrid 
                                        items={backgroundAssets} 
                                        selectedId={selectedBg} 
                                        onSelect={(id) => setSelectedBg(selectedBg === id ? null : id)} 
                                    />
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Slide-up Panel: Vibe */}
            <AnimatePresence>
                {showVibePanel && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                            onClick={() => setShowVibePanel(false)}
                        />
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 h-[50%] bg-white dark:bg-zinc-900 rounded-t-2xl z-50 flex flex-col overflow-hidden"
                        >
                            <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
                                <span className="font-semibold">选择氛围</span>
                                <Button variant="ghost" size="sm" onClick={() => setShowVibePanel(false)} className="h-8 w-8 p-0 rounded-full">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4">
                                <AssetGrid items={vibeAssets} selectedId={selectedVibe} onSelect={(id) => setSelectedVibe(selectedVibe === id ? null : id)} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
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
