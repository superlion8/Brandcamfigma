import React, { useRef, useState } from 'react';
import { Plus, Upload, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAppStore, Asset, AssetType } from '../../App';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function BrandAssetsModule() {
  const { assets, addAsset, deleteAsset } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>('product');

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock upload
      const mockUrl = URL.createObjectURL(file);
      addAsset({
        url: mockUrl,
        type: activeTab as AssetType, // Use current tab as type
        category: 'user',
        name: file.name.split('.')[0] || 'Uploaded Asset'
      });
      toast.success("上传成功");
    }
  };

  const AssetList = ({ type }: { type: AssetType }) => {
    const items = assets.filter(a => a.type === type);
    
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-zinc-300" />
                </div>
                <p>暂无{type === 'model' ? '模特' : type === 'background' ? '背景' : '商品'}资产</p>
                <Button variant="link" onClick={handleUploadClick}>点击上传</Button>
            </div>
        );
    }

    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {items.map(asset => (
          <div key={asset.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-100">
            <div className="aspect-square bg-zinc-100 relative">
                <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
                {asset.category === 'preset' && (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">官方预设</span>
                )}
            </div>
            <div className="p-3 flex items-center justify-between">
                <div className="truncate flex-1 mr-2">
                    <h4 className="text-sm font-medium text-zinc-900 truncate">{asset.name}</h4>
                    <p className="text-xs text-zinc-500">{new Date(asset.createdAt).toLocaleDateString()}</p>
                </div>
                
                {asset.category === 'user' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteAsset(asset.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <div className="h-14 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0">
        <span className="font-semibold text-lg">品牌资产</span>
        <Button size="sm" onClick={handleUploadClick} className="gap-1 bg-black text-white hover:bg-zinc-800">
            <Plus className="w-4 h-4" />
            上传
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="product" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
            <div className="px-4 pt-4">
                <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="product">商品</TabsTrigger>
                    <TabsTrigger value="model">模特</TabsTrigger>
                    <TabsTrigger value="background">背景</TabsTrigger>
                    <TabsTrigger value="vibe">氛围</TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
                <TabsContent value="product" className="mt-0"><AssetList type="product" /></TabsContent>
                <TabsContent value="model" className="mt-0"><AssetList type="model" /></TabsContent>
                <TabsContent value="background" className="mt-0"><AssetList type="background" /></TabsContent>
                <TabsContent value="vibe" className="mt-0"><AssetList type="vibe" /></TabsContent>
            </div>
        </Tabs>
      </div>
    </div>
  );
}
