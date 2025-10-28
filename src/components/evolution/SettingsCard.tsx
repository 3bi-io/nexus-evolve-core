import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";

interface SettingsCardProps {
  autoApprovalThreshold: number;
  onThresholdChange: (value: number) => void;
}

export const SettingsCard = ({ autoApprovalThreshold, onThresholdChange }: SettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          System Settings
        </CardTitle>
        <CardDescription>Configure autonomous behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Auto-Approval Confidence Threshold</label>
              <span className="text-sm text-muted-foreground">{(autoApprovalThreshold * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[autoApprovalThreshold]}
              onValueChange={([value]) => onThresholdChange(value)}
              min={0.5}
              max={1.0}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Capabilities with confidence above this threshold will be automatically approved and enabled.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
