import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';
import { toast } from 'sonner';

export default function ProcessLogo() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const processLogo = async () => {
    try {
      setProcessing(true);
      setProgress(0);
      
      // Fetch the original logo
      const response = await fetch('/logo-oneiros-original.png');
      const blob = await response.blob();
      
      // Load as image element
      const imageElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement, setProgress);
      
      // Create URL for display
      const url = URL.createObjectURL(processedBlob);
      setProcessedImage(url);
      
      toast.success('Background removed! Right-click the image below to save it as logo-oneiros.png');
    } catch (error) {
      console.error('Error processing logo:', error);
      toast.error('Failed to process logo');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Logo Background Removal</h1>
          <p className="text-muted-foreground">
            Process the uploaded logo to remove the black background.
          </p>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-semibold mb-4">Original Logo</h2>
            <img 
              src="/logo-oneiros-original.png" 
              alt="Original logo" 
              className="max-w-md"
            />
          </div>

          <Button 
            onClick={processLogo}
            disabled={processing}
            size="lg"
          >
            {processing ? `Processing... ${progress}%` : 'Remove Background'}
          </Button>

          {processedImage && (
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-xl font-semibold mb-4">Processed Logo (Transparent)</h2>
              <div className="bg-checkered p-4 rounded">
                <img 
                  src={processedImage} 
                  alt="Processed logo" 
                  className="max-w-md"
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Right-click the image above and save it as "logo-oneiros.png" in the public folder.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
