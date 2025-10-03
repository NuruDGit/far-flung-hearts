import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Answer {
  id: string;
  user_id: string;
  answer_text: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Question {
  id: string;
  question_text: string;
  question_date: string;
}

export default function DailyQuestionAnswers() {
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get("questionId");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!questionId) {
      navigate("/app");
      return;
    }

    loadQuestionAndAnswers();
    subscribeToAnswers();
  }, [questionId]);

  const loadQuestionAndAnswers = async () => {
    try {
      // Load question
      const { data: questionData, error: questionError } = await supabase
        .from("daily_questions")
        .select("id, question_text, question_date")
        .eq("id", questionId)
        .single();

      if (questionError) throw questionError;
      setQuestion(questionData);

      // Load answers
      const { data: answersData, error: answersError } = await supabase
        .from("daily_question_answers")
        .select("*")
        .eq("daily_question_id", questionId)
        .order("created_at", { ascending: true });

      if (answersError) throw answersError;

      // Fetch profiles separately
      if (answersData && answersData.length > 0) {
        const userIds = answersData.map(a => a.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        const answersWithProfiles = answersData.map(answer => ({
          ...answer,
          profiles: profilesData?.find(p => p.id === answer.user_id) || null
        }));

        setAnswers(answersWithProfiles);
      } else {
        setAnswers([]);
      }
    } catch (error) {
      console.error("Error loading answers:", error);
      toast({
        title: "Error",
        description: "Failed to load answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToAnswers = () => {
    const channel = supabase
      .channel("daily_question_answers_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "daily_question_answers",
          filter: `daily_question_id=eq.${questionId}`,
        },
        () => {
          loadQuestionAndAnswers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleShareToMessages = async () => {
    if (!question || answers.length < 2) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pairData } = await supabase
        .from("pairs")
        .select("id")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq("status", "active")
        .single();

      if (!pairData) return;

      const formattedMessage = {
        type: "daily_question_share",
        question: question.question_text,
        answers: answers.map(a => ({
          user: a.profiles?.display_name || "Anonymous",
          answer: a.answer_text
        }))
      };

      await supabase.from("messages").insert({
        pair_id: pairData.id,
        sender_id: user.id,
        type: "daily_question_share",
        body: formattedMessage,
      });

      toast({
        title: "Shared to messages!",
        description: "Your Q&A has been shared to your chat.",
      });

      navigate("/app/messages");
    } catch (error) {
      console.error("Error sharing to messages:", error);
      toast({
        title: "Error",
        description: "Failed to share to messages.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Question not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/app")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {answers.length === 2 && (
          <Button
            variant="outline"
            onClick={handleShareToMessages}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Share to Messages
          </Button>
        )}
      </div>

      <Card className="bg-gradient-to-br from-love-light/20 to-love-deep/20">
        <CardHeader>
          <CardTitle className="text-2xl">Today's Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{question.question_text}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {new Date(question.question_date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {answers.map((answer) => (
          <Card key={answer.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={answer.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {(answer.profiles?.display_name?.[0] || "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {answer.profiles?.display_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(answer.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{answer.answer_text}</p>
            </CardContent>
          </Card>
        ))}

        {answers.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No answers yet. Be the first to answer!
            </CardContent>
          </Card>
        )}

        {answers.length === 1 && (
          <Card className="flex items-center justify-center">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Waiting for your partner's answer...
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
