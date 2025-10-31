import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Download, Eraser } from "lucide-react";
import { toast } from "sonner";
import { removeBackground, loadImage } from "@/lib/backgroundRemoval";

export const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
      setProgress(0);
      setProcessingTime(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    setLoading(true);
    setProgress(0);
    const startTime = performance.now();

    try {
      // Convert data URL to blob
      const response = await fetch(originalImage);
      const blob = await response.blob();
      
      // Load as HTMLImageElement
      const imageElement = await loadImage(blob);
      
      // Remove background with progress tracking
      const resultBlob = await removeBackground(imageElement, (p) => {
        setProgress(p);
      });
      
      // Convert result to data URL for display
      const resultUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(resultUrl);
      
      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
      
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal error:', error);
      toast.error('Failed to remove background. Make sure WebGPU is supported.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'background-removed.png';
    link.click();
    
    toast.success('Image downloaded!');
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Eraser className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Background Removal</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Remove backgrounds from images directly in your browser. 100% private - images never leave your device.
        </p>

        {!originalImage ? (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 10MB
              </p>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Original</p>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Processed</p>
                <div className="relative aspect-square rounded-lg overflow-hidden" style={{
                  backgroundImage: 
                    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), ' +
                    'linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), ' +
                    'linear-gradient(45deg, transparent 75%, #e5e7eb 75%), ' +
                    'linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}>
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      {loading ? 'Processing...' : 'No result yet'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  {progress < 40 ? 'Loading model...' : 
                   progress < 80 ? 'Processing image...' : 
                   'Finalizing...'}
                </p>
              </div>
            )}

            {processingTime && (
              <div className="text-sm text-muted-foreground text-center">
                Processed in {(processingTime / 1000).toFixed(1)}s
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleRemoveBackground}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eraser className="mr-2 h-4 w-4" />
                    Remove Background
                  </>
                )}
              </Button>

              {processedImage && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}

              <Button
                onClick={() => {
                  setOriginalImage(null);
                  setProcessedImage(null);
                  setProgress(0);
                  setProcessingTime(null);
                }}
                variant="ghost"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
