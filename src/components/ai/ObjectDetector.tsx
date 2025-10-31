import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pipeline } from '@huggingface/transformers';

export const ObjectDetector = () => {
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setDetections([]);
    };
    reader.readAsDataURL(file);
  };

  const handleDetect = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const detector = await pipeline(
        'object-detection',
        'Xenova/detr-resnet-50',
        { device: 'webgpu' }
      );

      const result = await detector(image, {
        threshold: 0.5,
        percentage: true,
      });

      setDetections(result);
      toast({
        title: "Detection Complete!",
        description: `Found ${result.length} objects`,
      });
    } catch (error) {
      console.error('Detection error:', error);
      toast({
        title: "Detection Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Object Detection</CardTitle>
        <CardDescription>
          Detect and locate objects in images using DETR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" className="w-full" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </span>
            </Button>
          </label>

          {image && (
            <div className="relative w-full">
              <img
                src={image}
                alt="Upload"
                className="w-full rounded-lg border"
              />
              {detections.length > 0 && (
                <svg
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ pointerEvents: 'none' }}
                >
                  {detections.map((det, idx) => (
                    <g key={idx}>
                      <rect
                        x={`${det.box.xmin}%`}
                        y={`${det.box.ymin}%`}
                        width={`${det.box.xmax - det.box.xmin}%`}
                        height={`${det.box.ymax - det.box.ymin}%`}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                      />
                      <text
                        x={`${det.box.xmin}%`}
                        y={`${det.box.ymin}%`}
                        fill="hsl(var(--primary))"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {det.label} ({Math.round(det.score * 100)}%)
                      </text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          )}

          {image && (
            <Button
              onClick={handleDetect}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                'Detect Objects'
              )}
            </Button>
          )}

          {detections.length > 0 && (
            <div className="w-full space-y-2">
              <h3 className="font-semibold">Detected Objects:</h3>
              <div className="space-y-1">
                {detections.map((det, idx) => (
                  <div key={idx} className="text-sm p-2 bg-muted rounded">
                    <span className="font-medium">{det.label}</span>
                    {' - '}
                    <span className="text-muted-foreground">
                      {Math.round(det.score * 100)}% confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
