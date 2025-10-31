import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageGenerator } from "@/components/multimodal/ImageGenerator";
import { HuggingFaceImageGen } from "@/components/ai/HuggingFaceImageGen";
import { VoiceRecorder } from "@/components/multimodal/VoiceRecorder";
import { TextToSpeech } from "@/components/multimodal/TextToSpeech";
import { MultimodalGallery } from "@/components/multimodal/MultimodalGallery";
import { Sparkles, Image, Mic, Volume2, Grid } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function MultimodalStudio() {
  return (
    <PageLayout>
      <SEO 
        title="Multimodal Studio - Image, Voice & Text AI Generation"
        description="Generate images with AI, transcribe audio to text, convert text to speech, and manage all your AI-generated content in one place. Powered by DALL-E and ElevenLabs."
        keywords="AI image generation, text to speech, voice to text, multimodal AI, DALL-E, audio transcription"
        canonical="https://oneiros.me/multimodal"
      />
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Multimodal Studio</h1>
            <p className="text-muted-foreground">
              Generate images, transcribe audio, and create voice from text
            </p>
          </div>
        </div>

        <Tabs defaultValue="image" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="image" className="gap-2">
              <Image className="w-4 h-4" />
              Lovable AI
            </TabsTrigger>
            <TabsTrigger value="huggingface" className="gap-2">
              <Image className="w-4 h-4" />
              HuggingFace
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="w-4 h-4" />
              Voice to Text
            </TabsTrigger>
            <TabsTrigger value="tts" className="gap-2">
              <Volume2 className="w-4 h-4" />
              Text to Speech
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Grid className="w-4 h-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </PageLayout>
  );
}
