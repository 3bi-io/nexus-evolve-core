import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { modelCache } from "@/lib/modelCache";

export const ModelCacheViewer = () => {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCacheInfo = async () => {
    setLoading(true);
    try {
      const size = await modelCache.getCacheSize();
      const cachedModels = await modelCache.listCachedModels();
      setCacheSize(size);
      setModels(cachedModels);
    } catch (error) {
      console.error('Failed to load cache info:', error);
      toast.error('Failed to load cache information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const handleClearCache = async () => {
    try {
      await modelCache.clearCache();
      toast.success('Cache cleared successfully');
      loadCacheInfo();
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Model Cache</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadCacheInfo}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleClearCache}
              variant="destructive"
              size="sm"
              disabled={models.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Size</p>
            <p className="text-2xl font-bold">{formatBytes(cacheSize)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Cached Models</p>
            <p className="text-2xl font-bold">{models.length}</p>
          </Card>
        </div>

        {models.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Cached Models:</p>
            {models.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{model.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(model.size)} • {new Date(model.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">Cached</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No models cached yet</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Models are cached in your browser for faster loading</p>
          <p>• First use downloads models (~50-200MB depending on model)</p>
          <p>• Subsequent uses load instantly from cache</p>
        </div>
      </div>
    </Card>
  );
};
