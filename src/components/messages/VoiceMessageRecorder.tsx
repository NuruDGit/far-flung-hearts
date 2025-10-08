import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(30).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Setup audio visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Visualize waveform
      visualizeWaveform();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const visualizeWaveform = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const draw = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample and normalize to create waveform bars
      const bars = Array.from({ length: 30 }, (_, i) => {
        const index = Math.floor((i / 30) * dataArray.length);
        return dataArray[index] / 255;
      });
      
      setWaveform(bars);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
    }
  };

  const handleCancel = () => {
    stopRecording();
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-card border rounded-2xl p-4 shadow-elevation-3 z-50"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{
            scale: isRecording ? [1, 1.2, 1] : 1,
          }}
          transition={{
            repeat: isRecording ? Infinity : 0,
            duration: 1.5,
          }}
          className="flex-shrink-0"
        >
          <div className={cn(
            "p-3 rounded-full",
            isRecording ? "bg-destructive/20" : "bg-muted"
          )}>
            <Mic className={cn(
              "h-5 w-5",
              isRecording ? "text-destructive" : "text-muted-foreground"
            )} />
          </div>
        </motion.div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{formatDuration(duration)}</span>
            <span className="text-xs text-muted-foreground">
              {isRecording ? 'Recording...' : 'Stopped'}
            </span>
          </div>

          {/* Waveform visualization */}
          <div className="flex items-center gap-0.5 h-8">
            {waveform.map((value, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-primary rounded-full"
                animate={{
                  height: `${Math.max(value * 100, 10)}%`,
                }}
                transition={{
                  duration: 0.1,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {isRecording ? (
          <Button
            variant="outline"
            size="icon"
            onClick={stopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!audioBlob}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
