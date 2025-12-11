import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Video, Gamepad2, MessageSquareQuote, Copy, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SoloDashboardProps {
    userProfile: any;
}

export const SoloDashboard = ({ userProfile }: SoloDashboardProps) => {
    const navigate = useNavigate();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const displayName = userProfile?.display_name || userProfile?.first_name || 'there';

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* 1. Hero Section */}
            <div className="text-center space-y-6 py-8">
                <div className="relative inline-block">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-love-deep via-love-heart to-love-coral pb-2">
                        {getGreeting()}, {displayName}
                    </h1>
                    <Sparkles className="absolute -top-6 -right-8 text-yellow-400 w-8 h-8 animate-pulse" />
                </div>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Your shared space is ready. Invite your partner to unlock the full experience of <span className="font-semibold text-love-deep">Love Beyond Borders</span>.
                </p>

                <div className="flex justify-center pt-4">
                    <Button
                        onClick={() => navigate('/pair-setup')}
                        size="lg"
                        className="h-14 px-8 text-lg rounded-full shadow-love hover:shadow-love/50 transition-all hover:scale-105 bg-gradient-to-r from-love-heart to-love-deep text-white border-0"
                    >
                        Connect with Partner
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* 2. Feature Teaser Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Feature 1: Connection */}
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-blue-50 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Video className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">Virtual Dates</h3>
                            <p className="text-sm text-muted-foreground">High-quality video calls and shared activities designed for closeness.</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-600">Premium Quality</Badge>
                    </CardContent>
                </Card>

                {/* Feature 2: Daily Questions (Center/Hero) */}
                <Card className="border-love-light/50 border shadow-love/10 bg-gradient-to-b from-white to-love-light/10 overflow-hidden group hover:shadow-love/20 transition-all duration-300 transform md:-translate-y-4">
                    <div className="h-2 bg-gradient-to-r from-love-heart to-love-deep" />
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-love-heart/10 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Heart className="w-10 h-10 text-love-heart fill-current" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-2">Deep Connection</h3>
                            <p className="text-sm text-muted-foreground">Answer daily questions together and track your emotional journey.</p>
                        </div>
                        <Badge className="bg-love-heart hover:bg-love-deep text-white">Core Feature</Badge>
                    </CardContent>
                </Card>

                {/* Feature 3: Play */}
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600" />
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-purple-50 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Gamepad2 className="w-8 h-8 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">Play Together</h3>
                            <p className="text-sm text-muted-foreground">Fun mini-games and quizzes to spark joy and friendly competition.</p>
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-600">Fun & Games</Badge>
                    </CardContent>
                </Card>

            </div>

            {/* 3. Footer / Hint */}
            <div className="text-center pt-8 opacity-60">
                <p className="text-sm">More than 10,000 couples trust Love Beyond Borders</p>
            </div>

        </div>
    );
};
