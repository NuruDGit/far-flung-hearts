import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, Zap, Camera, MessageSquareQuote, Flame, Smile, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// --- Types ---
interface PartnerStatusWidgetProps {
    partner: any;
    userProfile: any;
    pair: any;
}

interface QuickActionsWidgetProps {
    onSendLove: () => void;
    onPing: () => void;
    onSharePhoto: () => void;
    disabled?: boolean;
}

interface StatsWidgetProps {
    streak: number;
    moodCount: number;
    messageCount: number;
    loading?: boolean;
}

// --- Components ---

export const WelcomeHeader = ({ userProfile, partner }: { userProfile: any, partner: any }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const displayName = userProfile?.display_name || userProfile?.first_name || 'there';

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-love-deep to-love-heart inline-block">
                {getGreeting()}, {displayName}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
                {partner
                    ? `Connected with ${partner.first_name || partner.display_name} ❤️`
                    : 'Ready to bridge the distance?'}
            </p>
        </div>
    );
};

export const PartnerStatusWidget = ({ partner, userProfile, pair }: PartnerStatusWidgetProps) => {
    if (!partner) return null;

    const daysTogether = pair?.created_at
        ? Math.floor((new Date().getTime() - new Date(pair.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <Card className="border-none shadow-love/10 bg-white/60 backdrop-blur-md overflow-hidden hover:shadow-love/20 transition-all duration-300 group">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            <Avatar className="w-14 h-14 border-4 border-white shadow-md ring-2 ring-love-light z-10">
                                <AvatarImage src={userProfile?.avatar_url} />
                                <AvatarFallback>You</AvatarFallback>
                            </Avatar>
                            <Avatar className="w-14 h-14 border-4 border-white shadow-md ring-2 ring-love-light z-0 transition-transform group-hover:translate-x-2">
                                <AvatarImage src={partner.avatar_url} />
                                <AvatarFallback>{partner.first_name?.[0] || 'P'}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-foreground">Together for {daysTogether} days</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                Connected now
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const QuickActionsWidget = ({ onSendLove, onPing, onSharePhoto, disabled }: QuickActionsWidgetProps) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            <Button
                variant="outline"
                className={cn(
                    "h-24 flex flex-col gap-2 border-0 shadow-sm bg-white/70 hover:bg-love-light/50 hover:scale-105 transition-all duration-300",
                    "hover:shadow-love/20"
                )}
                onClick={onSendLove}
                disabled={disabled}
            >
                <div className="p-2 rounded-full bg-love-heart/10 text-love-heart">
                    <Heart className="fill-current w-6 h-6" />
                </div>
                <span className="font-medium text-xs text-muted-foreground">Send Love</span>
            </Button>

            <Button
                variant="outline"
                className={cn(
                    "h-24 flex flex-col gap-2 border-0 shadow-sm bg-white/70 hover:bg-love-light/50 hover:scale-105 transition-all duration-300",
                    "hover:shadow-love/20"
                )}
                onClick={onPing}
                disabled={disabled}
            >
                <div className="p-2 rounded-full bg-love-coral/10 text-love-coral">
                    <Zap className="fill-current w-6 h-6" />
                </div>
                <span className="font-medium text-xs text-muted-foreground">Miss You</span>
            </Button>

            <Button
                variant="outline"
                className={cn(
                    "h-24 flex flex-col gap-2 border-0 shadow-sm bg-white/70 hover:bg-love-light/50 hover:scale-105 transition-all duration-300",
                    "hover:shadow-love/20"
                )}
                onClick={onSharePhoto}
                disabled={disabled}
            >
                <div className="p-2 rounded-full bg-love-deep/10 text-love-deep">
                    <Camera className="w-6 h-6" />
                </div>
                <span className="font-medium text-xs text-muted-foreground">Share Moment</span>
            </Button>
        </div>
    );
};

export const StatsWidget = ({ streak, moodCount, messageCount, loading }: StatsWidgetProps) => {
    return (
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4 grid grid-cols-3 divide-x divide-border/50">
                <div className="text-center px-2">
                    <div className="flex justify-center mb-1">
                        <Flame className={cn("w-5 h-5", streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground")} />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{loading ? '-' : streak}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Day Streak</div>
                </div>

                <div className="text-center px-2">
                    <div className="flex justify-center mb-1">
                        <Smile className="w-5 h-5 text-love-heart" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{moodCount}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Moods</div>
                </div>

                <div className="text-center px-2">
                    <div className="flex justify-center mb-1">
                        <MessageSquareQuote className="w-5 h-5 text-love-deep" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{messageCount}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Messages</div>
                </div>
            </CardContent>
        </Card>
    );
}

export const DailyQuestionWidget = ({ question, answers, onClick }: { question: any, answers: any[], onClick: () => void }) => {
    if (!question) return null;

    const answeredByMe = true; // Simplified for UI demo
    const answeredByPartner = answers.length === 2;

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-love-heart to-love-deep p-6 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
        >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <MessageSquareQuote size={64} className="rotate-12 transform translate-x-2 -translate-y-2" />
            </div>

            <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2 text-white/80">
                    <Badge variant="outline" className="border-white/30 text-white hover:bg-white/10">Daily Question</Badge>
                </div>
                <h3 className="text-xl font-bold leading-tight mb-4 pr-12">
                    "{question.question_text}"
                </h3>

                <div className="flex items-center justify-between mt-6">
                    <div className="flex -space-x-2">
                        {/* Placeholder avatars for answers */}
                        <div className={cn("w-8 h-8 rounded-full border-2 border-white/20 bg-white/20 flex items-center justify-center text-xs", answers.length > 0 && "bg-white text-love-deep")}>
                            {answers.length > 0 ? 'A' : '1'}
                        </div>
                        <div className={cn("w-8 h-8 rounded-full border-2 border-white/20 bg-white/20 flex items-center justify-center text-xs", answers.length > 1 && "bg-white text-love-deep")}>
                            {answers.length > 1 ? 'B' : '2'}
                        </div>
                    </div>
                    <Button size="sm" variant="secondary" className="bg-white/90 text-love-deep hover:bg-white group-hover:translate-x-1 transition-transform">
                        {answers.length > 0 ? "View Answers" : "Answer Now"}
                        <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
