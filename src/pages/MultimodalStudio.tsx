import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ScrollableTabs, TabsContent } from "@/components/ui/scrollable-tabs";
import { ImageGenerator } from "@/components/multimodal/ImageGenerator";
import { HuggingFaceImageGen } from "@/components/ai/HuggingFaceImageGen";
import { VoiceRecorder } from "@/components/multimodal/VoiceRecorder";
import { TextToSpeech } from "@/components/multimodal/TextToSpeech";
import { MultimodalGallery } from "@/components/multimodal/MultimodalGallery";
import { Sparkles, Image, Mic, Volume2, Grid } from "lucide-react";
import { SEO } from "@/components/SEO";

const TABS = [
  { value: "image", label: "Lovable AI", shortLabel: "Lovable", icon: <Image className="w-4 h-4" /> },
  { value: "huggingface", label: "HuggingFace", shortLabel: "HF", icon: <Image className="w-4 h-4" /> },
  { value: "voice", label: "Voice to Text", shortLabel: "STT", icon: <Mic className="w-4 h-4" /> },
  { value: "tts", label: "Text to Speech", shortLabel: "TTS", icon: <Volume2 className="w-4 h-4" /> },
  { value: "gallery", label: "Gallery", shortLabel: "Gallery", icon: <Grid className="w-4 h-4" /> },
];

export default function MultimodalStudio() {
  const [activeTab, setActiveTab] = useState("image");

  return (
    <PageLayout>
      <SEO 
        title="Multimodal Studio - Image, Voice & Text AI Generation"
        description="Generate images with AI, transcribe audio to text, convert text to speech, and manage all your AI-generated content in one place. Powered by DALL-E and ElevenLabs."
        keywords="AI image generation, text to speech, voice to text, multimodal AI, DALL-E, audio transcription"
        canonical="https://oneiros.me/multimodal"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Multimodal Studio</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Generate images, transcribe audio, and create voice from text
            </p>
          </div>
        </div>

        <ScrollableTabs tabs={TABS} value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="image">
            <ImageGenerator />
          </TabsContent>

          <TabsContent value="huggingface">
            <HuggingFaceImageGen />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceRecorder />
          </TabsContent>

          <TabsContent value="tts">
            <TextToSpeech />
          </TabsContent>

          <TabsContent value="gallery">
            <MultimodalGallery />
          </TabsContent>
        </ScrollableTabs>
      </div>
    </PageLayout>
  );
}
