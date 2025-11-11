import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube2, Mic, Volume2, CheckCircle, XCircle, 
  AlertTriangle, Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioTestResult {
  micTest: 'idle' | 'testing' | 'success' | 'failed';
  speakerTest: 'idle' | 'testing' | 'success' | 'failed';
  micLevel: number;
  micError?: string;
  speakerError?: string;
}

export const AudioTestButton = () => {
  const { toast } = useToast();
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testResult, setTestResult] = useState<AudioTestResult>({
    micTest: 'idle',
    speakerTest: 'idle',
    micLevel: 0,
  });

  const testMicrophone = async (): Promise<boolean> => {
    setTestResult(prev => ({ ...prev, micTest: 'testing', micLevel: 0, micError: undefined }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Test for 3 seconds
      return new Promise((resolve) => {
        let maxLevel = 0;
        const startTime = Date.now();
        
        const checkLevel = () => {
          if (Date.now() - startTime > 3000) {
            // Cleanup
            stream.getTracks().forEach(track => track.stop());
            audioContext.close();
            
            if (maxLevel > 10) {
              setTestResult(prev => ({ ...prev, micTest: 'success', micLevel: maxLevel }));
              resolve(true);
            } else {
              setTestResult(prev => ({ 
                ...prev, 
                micTest: 'failed', 
                micLevel: maxLevel,
                micError: 'No audio detected. Please speak into your microphone.' 
              }));
              resolve(false);
            }
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const level = Math.round((average / 255) * 100);
          
          if (level > maxLevel) {
            maxLevel = level;
          }
          
          setTestResult(prev => ({ ...prev, micLevel: level }));
          requestAnimationFrame(checkLevel);
        };

        checkLevel();
      });
    } catch (error) {
      console.error('Microphone test failed:', error);
      setTestResult(prev => ({ 
        ...prev, 
        micTest: 'failed',
        micError: error instanceof Error ? error.message : 'Failed to access microphone' 
      }));
      return false;
    }
  };

  const testSpeakers = async (): Promise<boolean> => {
    setTestResult(prev => ({ ...prev, speakerTest: 'testing', speakerError: undefined }));

    try {
      // Test with speech synthesis
      const utterance = new SpeechSynthesisUtterance('Testing speakers. If you can hear this, your speakers are working correctly.');
      
      return new Promise((resolve) => {
        utterance.onend = () => {
          setTestResult(prev => ({ ...prev, speakerTest: 'success' }));
          resolve(true);
        };

        utterance.onerror = (error) => {
          console.error('Speaker test failed:', error);
          setTestResult(prev => ({ 
            ...prev, 
            speakerTest: 'failed',
            speakerError: 'Failed to play audio through speakers' 
          }));
          resolve(false);
        };

        // Fallback timeout
        setTimeout(() => {
          if (testResult.speakerTest === 'testing') {
            setTestResult(prev => ({ ...prev, speakerTest: 'success' }));
            resolve(true);
          }
        }, 5000);

        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Speaker test failed:', error);
      setTestResult(prev => ({ 
        ...prev, 
        speakerTest: 'failed',
        speakerError: error instanceof Error ? error.message : 'Failed to test speakers' 
      }));
      return false;
    }
  };

  const runFullTest = async () => {
    setIsTestOpen(true);
    
    toast({
      title: 'Starting Audio Test',
      description: 'Please speak into your microphone when prompted...',
    });

    // Test microphone first
    const micSuccess = await testMicrophone();
    
    if (!micSuccess) {
      toast({
        title: 'Microphone Test Failed',
        description: testResult.micError || 'Could not detect audio from microphone',
        variant: 'destructive',
      });
    }

    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test speakers
    const speakerSuccess = await testSpeakers();

    if (!speakerSuccess) {
      toast({
        title: 'Speaker Test Failed',
        description: testResult.speakerError || 'Could not play audio through speakers',
        variant: 'destructive',
      });
    }

    if (micSuccess && speakerSuccess) {
      toast({
        title: 'Audio Test Complete',
        description: 'Both microphone and speakers are working correctly! ✓',
      });
    }
  };

  const getStatusIcon = (status: 'idle' | 'testing' | 'success' | 'failed') => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: 'idle' | 'testing' | 'success' | 'failed') => {
    switch (status) {
      case 'testing':
        return <Badge variant="outline">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-500">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Not Tested</Badge>;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={runFullTest}
        disabled={testResult.micTest === 'testing' || testResult.speakerTest === 'testing'}
        className="gap-2"
      >
        <TestTube2 className="h-4 w-4" />
        Test Audio
      </Button>

      {isTestOpen && (
        <Card className="mt-4 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              Audio System Test
            </CardTitle>
            <CardDescription>
              Testing your microphone and speakers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Microphone Test */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="font-medium">Microphone</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResult.micTest)}
                  {getStatusBadge(testResult.micTest)}
                </div>
              </div>
              
              {testResult.micTest === 'testing' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Speak into your microphone...
                  </p>
                  <Progress value={testResult.micLevel} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Volume: {testResult.micLevel}%
                  </p>
                </div>
              )}
              
              {testResult.micError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription className="text-xs">
                    {testResult.micError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Speaker Test */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="font-medium">Speakers</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResult.speakerTest)}
                  {getStatusBadge(testResult.speakerTest)}
                </div>
              </div>
              
              {testResult.speakerTest === 'testing' && (
                <p className="text-sm text-muted-foreground">
                  Playing test audio...
                </p>
              )}
              
              {testResult.speakerError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription className="text-xs">
                    {testResult.speakerError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Overall Status */}
            {testResult.micTest !== 'idle' && testResult.speakerTest !== 'idle' && (
              <div className="pt-4 border-t">
                {testResult.micTest === 'success' && testResult.speakerTest === 'success' ? (
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      All audio systems working correctly!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Some audio systems failed. Please check your device settings.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
