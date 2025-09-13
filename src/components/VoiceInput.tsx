import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const VoiceInput = ({ onVoiceResult, isListening, setIsListening }: VoiceInputProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onVoiceResult(transcript);
        setIsListening(false);
        
        toast({
          title: "Voice Input Captured! 🎤",
          description: `"${transcript}"`,
        });
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        toast({
          title: "Voice Input Error",
          description: "Could not capture voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, [onVoiceResult, setIsListening, toast]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      
      toast({
        title: "Listening... 👂",
        description: "Speak your expense details now!",
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <Volume2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Voice input not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="lg"
        onClick={toggleListening}
        className={`transition-all duration-300 ${
          isListening ? "animate-pulse" : "hover:scale-105"
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="h-5 w-5 mr-2" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 mr-2" />
            Voice Input
          </>
        )}
      </Button>
      
      {isListening && (
        <Badge variant="secondary" className="animate-pulse">
          🎤 Listening...
        </Badge>
      )}
    </div>
  );
};
