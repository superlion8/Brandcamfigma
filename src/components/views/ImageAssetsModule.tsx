import React, { useState } from 'react';
import { Download, Heart, ExternalLink, Save, MoreHorizontal, Filter, Grid3X3, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import { useAppStore, GeneratedImage } from '../../App';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export function ImageAssetsModule() {
  const { history, toggleFavorite, saveHistoryToAsset } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const displayedHistory = filter === 'all' ? history : history.filter(h => h.isFavorite);

  const handleDownload = (url: string) => {
      // Mock download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("已开始下载");
  };

  const handleSaveToAssets = (image: GeneratedImage) => {
      let type: any = 'background';
      if (image.type === 'model_display') type = 'model';
      if (image.type === 'product_display') type = 'product';
      
      saveHistoryToAsset(image.id, type, `Saved ${new Date().toLocaleDateString()}`);
      toast.success("已保存到品牌资产库");
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="h-14 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0">
        <span className="font-semibold text-lg">生成历史</span>
        <div className="flex gap-2">
            <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)} className="h-8">
                <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs px-3 h-6">全部</TabsTrigger>
                    <TabsTrigger value="favorites" className="text-xs px-3 h-6">收藏</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
         <div className="grid grid-cols-2 gap-3">
            {displayedHistory.map((img) => (
                <div 
                    key={img.id} 
                    className="group relative aspect-[4/5] bg-zinc-200 rounded-lg overflow-hidden cursor-pointer break-inside-avoid"
                    onClick={() => setSelectedImage(img)}
                >
                    <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="History" />
                    
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-zinc-700 hover:text-red-500 shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(img.id);
                            }}
                        >
                            <Heart className={cn("w-4 h-4", img.isFavorite && "fill-red-500 text-red-500")} />
                        </button>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate">{new Date(img.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            ))}
         </div>
         {displayedHistory.length === 0 && (
             <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                 <p>暂无{filter === 'favorites' ? '收藏' : ''}图片</p>
             </div>
         )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(o) => !o && setSelectedImage(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-zinc-800">
            <div className="relative aspect-[4/5] bg-zinc-900">
                 {selectedImage && <img src={selectedImage.url} className="w-full h-full object-contain" alt="Detail" />}
            </div>
            
            <div className="p-4 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">
                            {selectedImage?.type === 'product_display' ? '商品展示' : 
                             selectedImage?.type === 'model_display' ? '模特展示' : 'AI 编辑'}
                        </h3>
                        <p className="text-xs text-zinc-400">{selectedImage && new Date(selectedImage.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => selectedImage && toggleFavorite(selectedImage.id)}
                        >
                            <Heart className={cn("w-4 h-4", selectedImage?.isFavorite && "fill-red-500 text-red-500")} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => selectedImage && handleDownload(selectedImage.url)}>
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex gap-3">
                     <Button className="flex-1" onClick={() => {
                         if (selectedImage) {
                             handleSaveToAssets(selectedImage);
                             setSelectedImage(null);
                         }
                     }}>
                         <Save className="w-4 h-4 mr-2" />
                         存为素材
                     </Button>
                </div>

                {selectedImage?.prompt && (
                    <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded text-xs text-zinc-500 max-h-24 overflow-y-auto">
                        <span className="font-semibold block mb-1">Prompt:</span>
                        {selectedImage.prompt}
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
