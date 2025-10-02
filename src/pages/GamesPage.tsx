import { useState, useEffect } from "react";
import AppNavigation from "@/components/AppNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TRIVIA_QUESTIONS = [
  { question: "When did we first meet?", type: "couple" },
  { question: "What's their favorite color?", type: "couple" },
  { question: "What's their dream vacation?", type: "couple" },
  { question: "What's their favorite food?", type: "couple" },
  { question: "What's the capital of France?", answer: "Paris", type: "general" },
  { question: "What year did World War II end?", answer: "1945", type: "general" },
];

const WOULD_YOU_RATHER = [
  { optionA: "Travel back in time", optionB: "Travel to the future" },
  { optionA: "Live in the city", optionB: "Live in the countryside" },
  { optionA: "Be able to fly", optionB: "Be invisible" },
  { optionA: "Always be 10 minutes late", optionB: "Always be 20 minutes early" },
  { optionA: "Give up social media", optionB: "Give up streaming services" },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<'trivia' | 'would-you-rather' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [pairId, setPairId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPair();
  }, []);

  const loadPair = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('pairs')
      .select('id')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .single();

    if (data) setPairId(data.id);
  };

  const handleTriviaAnswer = async () => {
    const correct = Math.random() > 0.5; // Simplified - in real app would check actual answer
    if (correct) {
      setScore(score + 1);
      toast({ title: "Correct! 🎉" });
    } else {
      toast({ title: "Not quite!", variant: "destructive" });
    }

    if (currentQuestion < TRIVIA_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer("");
    } else {
      await saveScore('trivia', score + (correct ? 1 : 0));
      toast({ title: "Game Over!", description: `Final Score: ${score + (correct ? 1 : 0)}/${TRIVIA_QUESTIONS.length}` });
      resetGame();
    }
  };

  const handleWouldYouRather = async (choice: 'A' | 'B') => {
    if (currentQuestion < WOULD_YOU_RATHER.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      toast({ title: "Thanks for playing!" });
      resetGame();
    }
  };

  const saveScore = async (gameType: string, finalScore: number) => {
    if (!pairId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('game_scores').insert({
      pair_id: pairId,
      game_type: gameType,
      user_id: user.id,
      score: finalScore
    });
  };

  const resetGame = () => {
    setActiveGame(null);
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswer("");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Gamepad2 className="h-6 w-6 text-love" />
          <h1 className="text-3xl font-bold">Couple Games</h1>
        </div>

        {!activeGame ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:border-love transition-colors" onClick={() => setActiveGame('trivia')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-love" />
                  Couple Trivia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Test how well you know each other!</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-love transition-colors" onClick={() => setActiveGame('would-you-rather')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-love" />
                  Would You Rather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Discover your partner's preferences!</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {activeGame === 'trivia' ? 'Couple Trivia' : 'Would You Rather'}
                {activeGame === 'trivia' && ` - Score: ${score}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeGame === 'trivia' && (
                <>
                  <p className="text-lg font-medium">
                    Question {currentQuestion + 1}/{TRIVIA_QUESTIONS.length}
                  </p>
                  <p className="text-xl">{TRIVIA_QUESTIONS[currentQuestion].question}</p>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTriviaAnswer()}
                  />
                  <Button onClick={handleTriviaAnswer} className="w-full">
                    Submit Answer
                  </Button>
                </>
              )}

              {activeGame === 'would-you-rather' && (
                <>
                  <p className="text-lg font-medium">
                    Question {currentQuestion + 1}/{WOULD_YOU_RATHER.length}
                  </p>
                  <p className="text-xl mb-4">Would you rather...</p>
                  <div className="grid gap-4">
                    <Button
                      onClick={() => handleWouldYouRather('A')}
                      variant="outline"
                      className="h-auto py-6 text-lg"
                    >
                      {WOULD_YOU_RATHER[currentQuestion].optionA}
                    </Button>
                    <Button
                      onClick={() => handleWouldYouRather('B')}
                      variant="outline"
                      className="h-auto py-6 text-lg"
                    >
                      {WOULD_YOU_RATHER[currentQuestion].optionB}
                    </Button>
                  </div>
                </>
              )}

              <Button variant="ghost" onClick={resetGame} className="w-full mt-4">
                Back to Games
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
