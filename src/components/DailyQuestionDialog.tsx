import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

interface DailyQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: {
    id: string;
    question_text: string;
    question_date: string;
  };
  pairId: string;
  userId: string;
  partnerAnswered: boolean;
  onAnswerSubmitted: () => void;
}

export function DailyQuestionDialog({
  open,
  onOpenChange,
  question,
  pairId,
  userId,
  partnerAnswered,
  onAnswerSubmitted,
}: DailyQuestionDialogProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        title: "Answer required",
        description: "Please write your answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("daily_question_answers").insert({
        daily_question_id: question.id,
        pair_id: pairId,
        user_id: userId,
        answer_text: answer.trim(),
      });

      if (error) throw error;

      // Also update the daily_questions table
      await supabase
        .from("daily_questions")
        .update({
          answered_by: userId,
          answered_at: new Date().toISOString(),
        })
        .eq("id", question.id);

      toast({
        title: "Answer submitted!",
        description: "Your answer has been saved.",
      });

      setAnswer("");
      onAnswerSubmitted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Today's Question</DialogTitle>
          <DialogDescription>
            Share your thoughts with your partner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-lg font-medium text-foreground">
              {question.question_text}
            </p>
          </div>

          {partnerAnswered && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Your partner has answered this question</span>
            </div>
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="Write your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{answer.length}/500 characters</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !answer.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
