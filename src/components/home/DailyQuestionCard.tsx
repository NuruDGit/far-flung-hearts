import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareQuote, ChevronRight } from "lucide-react";

interface DailyQuestionCardProps {
  dailyQuestion: any;
  questionAnswers: any[];
  onAnswerClick: () => void;
  user: any;
}

export const DailyQuestionCard = ({
  dailyQuestion,
  questionAnswers,
  onAnswerClick,
  user,
}: DailyQuestionCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!dailyQuestion) return null;

  const userAnswer = questionAnswers.find(a => a.user_id === user?.id);
  const partnerAnswer = questionAnswers.find(a => a.user_id !== user?.id);
  const bothAnswered = userAnswer && partnerAnswer;

  const handleCardClick = () => {
    if (bothAnswered) {
      setIsFlipped(!isFlipped);
    } else {
      onAnswerClick();
    }
  };

  return (
    <motion.div
      className="perspective-1000 cursor-pointer mb-6"
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className="relative w-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <Card 
          className="bg-gradient-to-br from-love-heart to-love-deep text-white shadow-glow backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageSquareQuote className="text-white" size={24} />
              </motion.div>
              
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg mb-2">
                  Question of the Day
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {dailyQuestion.question_text}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <motion.div
                      className={`w-8 h-8 rounded-full ${userAnswer ? 'bg-success' : 'bg-white/20'} flex items-center justify-center`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-xs font-semibold">You</span>
                    </motion.div>
                    <motion.div
                      className={`w-8 h-8 rounded-full ${partnerAnswer ? 'bg-success' : 'bg-white/20'} flex items-center justify-center`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-xs font-semibold">❤️</span>
                    </motion.div>
                  </div>

                  {bothAnswered && (
                    <motion.div
                      className="flex items-center gap-2 text-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span>Tap to see answers</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back of card - show answers */}
        {bothAnswered && (
          <Card 
            className="absolute top-0 left-0 w-full bg-white shadow-elevation-4 backface-hidden"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-lg mb-4 text-center bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
                Your Answers
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg glass-subtle">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">Your Answer:</p>
                  <p className="text-sm text-foreground">{userAnswer?.answer_text}</p>
                </div>

                <div className="p-4 rounded-lg glass-subtle">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">Partner's Answer:</p>
                  <p className="text-sm text-foreground">{partnerAnswer?.answer_text}</p>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4 italic">
                Tap again to flip back
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
};
