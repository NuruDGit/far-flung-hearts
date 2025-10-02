import { useState, useEffect } from "react";
import AppNavigation from "@/components/AppNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Gamepad2, 
  Trophy, 
  Heart, 
  Flame, 
  MessageCircle, 
  Sparkles,
  PartyPopper,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import confetti from "canvas-confetti";

interface GameSession {
  id: string;
  game_type: string;
  status: string;
  pair_id: string;
  player1_id: string;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  player1_answers: any;
  player2_answers: any;
  game_data: any;
  ai_summary: string | null;
  created_at: string;
  completed_at: string | null;
}

const GAME_TYPES = [
  {
    id: 'truth_or_dare',
    title: 'Truth or Dare',
    icon: Flame,
    description: 'Spice things up with fun and flirty challenges',
    gradient: 'from-primary/20 to-accent/20',
    iconColor: 'text-primary'
  },
  {
    id: 'never_have_i_ever',
    title: 'Never Have I Ever',
    icon: MessageCircle,
    description: 'Discover surprising stories about each other',
    gradient: 'from-accent/20 to-primary/20',
    iconColor: 'text-accent'
  },
  {
    id: 'couple_quiz',
    title: 'How Well Do You Know Me?',
    icon: Trophy,
    description: 'Test your knowledge about your partner',
    gradient: 'from-primary/20 to-secondary/20',
    iconColor: 'text-primary'
  },
  {
    id: 'would_you_rather',
    title: 'Would You Rather',
    icon: Heart,
    description: 'Explore preferences and make fun choices together',
    gradient: 'from-secondary/20 to-accent/20',
    iconColor: 'text-accent'
  }
];

export default function GamesPage() {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingGame, setGeneratingGame] = useState(false);
  const [pairId, setPairId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadPairAndSessions();
  }, [user]);

  const loadPairAndSessions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('pairs')
      .select('id, user_a, user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .single();

    if (data) {
      setPairId(data.id);
      setPartnerId(data.user_a === user.id ? data.user_b : data.user_a);
      loadRecentSessions(data.id);
    }
  };

  const loadRecentSessions = async (pairIdParam: string) => {
    const { data } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('pair_id', pairIdParam)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setRecentSessions(data as any);
  };

  const startNewGame = async (gameType: string) => {
    if (!pairId || !user) return;

    setGeneratingGame(true);
    try {
      // Generate AI-powered game content
      const { data: gameData, error: gameError } = await supabase.functions.invoke('generate-game', {
        body: { gameType }
      });

      if (gameError) throw gameError;

      // Create game session
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          pair_id: pairId,
          game_type: gameType,
          player1_id: user.id,
          game_data: gameData.gameData,
          status: 'waiting'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setActiveSession(session as any);
      toast({
        title: "Game ready! 🎮",
        description: "Waiting for your partner to join..."
      });

    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: "Oops!",
        description: "Failed to start game. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingGame(false);
    }
  };

  const submitAnswer = async (answer: any) => {
    if (!activeSession || !user) return;

    const isPlayer1 = activeSession.player1_id === user.id;
    const currentAnswers = isPlayer1 ? activeSession.player1_answers : activeSession.player2_answers;
    const answers = Array.isArray(currentAnswers) ? currentAnswers : [];
    const updatedAnswers = [...answers, answer];

    const { error } = await supabase
      .from('game_sessions')
      .update(isPlayer1 
        ? { player1_answers: updatedAnswers }
        : { player2_answers: updatedAnswers }
      )
      .eq('id', activeSession.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save answer",
        variant: "destructive"
      });
      return;
    }

    // Check if game is complete
    const questions = activeSession.game_data.questions || [];
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await completeGame(updatedAnswers);
    }
  };

  const completeGame = async (finalAnswers: any[]) => {
    if (!activeSession) return;

    setLoading(true);
    try {
      // Calculate score
      const score = finalAnswers.filter(a => a.correct).length;

      // Generate AI summary
      const { data: summaryData } = await supabase.functions.invoke('generate-game-summary', {
        body: {
          gameType: activeSession.game_type,
          player1Answers: activeSession.player1_answers,
          player2Answers: activeSession.player2_answers,
          player1Score: activeSession.player1_score,
          player2Score: score
        }
      });

      // Update session
      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          ai_summary: summaryData?.summary,
          player2_score: score
        })
        .eq('id', activeSession.id);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Game Complete! 🎉",
        description: "Check out your AI-powered relationship insights!"
      });

      setActiveSession(null);
      setCurrentQuestionIndex(0);
      loadRecentSessions(activeSession.pair_id);

    } catch (error) {
      console.error('Error completing game:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGameContent = () => {
    if (!activeSession) return null;

    const questions = activeSession.game_data.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) return null;

    return (
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {GAME_TYPES.find(g => g.id === activeSession.game_type)?.title}
              </CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            <Sparkles className="h-8 w-8 text-accent animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {activeSession.game_type === 'truth_or_dare' && (
            <div className="space-y-6">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {currentQuestion.type === 'truth' ? '💭 Truth' : '🔥 Dare'}
              </Badge>
              <p className="text-2xl font-medium">{currentQuestion.question}</p>
              <div className="grid gap-3">
                <Button
                  onClick={() => submitAnswer({ completed: true, correct: true })}
                  size="lg"
                  className="h-16 text-lg"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  I did it!
                </Button>
                <Button
                  onClick={() => submitAnswer({ completed: false, correct: false })}
                  variant="outline"
                  size="lg"
                  className="h-16 text-lg"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Skip this one
                </Button>
              </div>
            </div>
          )}

          {activeSession.game_type === 'would_you_rather' && (
            <div className="space-y-6">
              <p className="text-2xl font-semibold text-center">Would you rather...</p>
              <div className="grid gap-4">
                <Button
                  onClick={() => submitAnswer({ choice: 'A', option: currentQuestion.optionA })}
                  variant="outline"
                  size="lg"
                  className="h-auto py-8 text-lg hover:bg-primary/10 hover:border-primary"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-primary" />
                    <span>{currentQuestion.optionA}</span>
                  </div>
                </Button>
                <Button
                  onClick={() => submitAnswer({ choice: 'B', option: currentQuestion.optionB })}
                  variant="outline"
                  size="lg"
                  className="h-auto py-8 text-lg hover:bg-accent/10 hover:border-accent"
                >
                  <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-accent" />
                    <span>{currentQuestion.optionB}</span>
                  </div>
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              setActiveSession(null);
              setCurrentQuestionIndex(0);
            }}
            className="w-full mt-4"
          >
            Exit Game
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (generatingGame) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Creating your game...</h3>
              <p className="text-muted-foreground">AI is crafting the perfect questions for you two! ✨</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Couple Games
            </h1>
            <p className="text-muted-foreground">AI-powered fun to bring you closer together</p>
          </div>
        </div>

        {activeSession ? (
          renderGameContent()
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {GAME_TYPES.map((game) => {
                const Icon = game.icon;
                return (
                  <Card 
                    key={game.id}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/30"
                    onClick={() => startNewGame(game.id)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                              <Icon className={`h-6 w-6 ${game.iconColor}`} />
                            </div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {game.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-base">
                            {game.description}
                          </CardDescription>
                        </div>
                        <Sparkles className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PartyPopper className="h-4 w-4" />
                        <span>AI-Generated • Multiplayer • Scored</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {recentSessions.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Recent Games
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {GAME_TYPES.find(g => g.id === session.game_type)?.title}
                        </h4>
                        <div className="flex gap-4 text-sm">
                          <Badge variant="secondary">
                            You: {session.player1_id === user?.id ? session.player1_score : session.player2_score}
                          </Badge>
                          <Badge variant="secondary">
                            Partner: {session.player1_id === user?.id ? session.player2_score : session.player1_score}
                          </Badge>
                        </div>
                      </div>
                      {session.ai_summary && (
                        <p className="text-sm text-muted-foreground italic">
                          💡 {session.ai_summary}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}