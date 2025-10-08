import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Sparkles, Hourglass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReunionData {
  title: string;
  reunion_date: string;
  location?: string;
}

export const ReunionCountdown = ({ pairId }: { pairId: string }) => {
  const [reunion, setReunion] = useState<ReunionData | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", reunion_date: "", location: "" });
  const [joyBooster, setJoyBooster] = useState<string>("");
  const { toast } = useToast();

  const joyBoosters = [
    "Every second brings you closer to the moment you've been dreaming of! ✨",
    "The wait is almost over! Soon you'll be wrapped in each other's arms 💫",
    "Time is flying by... your reunion is just around the corner! 🌟",
    "Can you feel the excitement building? The countdown is ON! 🎉",
    "Distance makes the heart grow fonder, and yours is about to overflow with joy! 💝",
    "Soon, the countdown will be zero and the memories will be infinite! 🌈",
    "These final moments apart make the reunion even sweeter! 🦋",
    "The anticipation is electric! Your special moment is approaching fast! ⚡",
    "Every tick of the clock is a step closer to pure happiness! 🎊",
    "Hold on tight! Your beautiful reunion is on the horizon! 🌅"
  ];

  useEffect(() => {
    loadReunion();
    // Rotate joy boosters every 8 seconds
    const interval = setInterval(() => {
      setJoyBooster(joyBoosters[Math.floor(Math.random() * joyBoosters.length)]);
    }, 8000);
    setJoyBooster(joyBoosters[0]);
    return () => clearInterval(interval);
  }, [pairId]);

  useEffect(() => {
    if (!reunion) return;

    // Calculate countdown immediately
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(reunion.reunion_date).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, [reunion]);

  const loadReunion = async () => {
    const { data } = await supabase
      .from('reunion_countdown')
      .select('*')
      .eq('pair_id', pairId)
      .single();
    
    if (data) {
      setReunion(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('reunion_countdown')
      .upsert({
        pair_id: pairId,
        title: formData.title,
        reunion_date: formData.reunion_date,
        location: formData.location || null,
        created_by: user.id
      });

    if (error) {
      toast({ title: "Error", description: "Failed to save reunion", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Reunion countdown updated!" });
      setIsDialogOpen(false);
      loadReunion();
    }
  };

  if (!reunion) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Reunion Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Set Your Next Reunion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Plan Your Reunion</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Weekend together"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.reunion_date}
                    onChange={(e) => setFormData({ ...formData, reunion_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="Paris"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Save Reunion</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-gradient-xy" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float" style={{ left: '10%', animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute w-1.5 h-1.5 bg-secondary/20 rounded-full animate-float" style={{ left: '30%', animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute w-2.5 h-2.5 bg-accent/20 rounded-full animate-float" style={{ left: '60%', animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float" style={{ left: '80%', animationDelay: '0.5s', animationDuration: '3.5s' }} />
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Hourglass className="h-6 w-6 text-primary animate-pulse" />
            {reunion.title}
          </CardTitle>
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Joy Booster Message */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-foreground animate-fade-in leading-relaxed">
              {joyBooster}
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { value: timeLeft.days, label: 'Days', gradient: 'from-primary to-primary/70' },
            { value: timeLeft.hours, label: 'Hours', gradient: 'from-secondary to-secondary/70' },
            { value: timeLeft.minutes, label: 'Minutes', gradient: 'from-accent to-accent/70' },
            { value: timeLeft.seconds, label: 'Seconds', gradient: 'from-primary to-primary/70' }
          ].map((item, idx) => (
            <div key={idx} className="relative group">
              <div className={`bg-gradient-to-br ${item.gradient} p-2 sm:p-4 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                    {item.value}
                  </div>
                  <div className="text-[10px] sm:text-xs font-medium text-white/90 mt-0.5 sm:mt-1 uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity -z-10`} />
            </div>
          ))}
        </div>
        
        {reunion.location && (
          <div className="flex items-center gap-2 text-sm bg-background/50 backdrop-blur-sm p-3 rounded-lg border border-primary/10">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{reunion.location}</span>
          </div>
        )}

        {/* Big Day Reminder */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border-2 border-dashed border-primary/20">
          <p className="text-lg font-semibold text-primary">
            The Big Day is Almost Here! 🎉
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Get ready for unforgettable moments together
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary">
              <Calendar className="mr-2 h-4 w-4" />
              Edit Reunion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Your Reunion</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || reunion.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.reunion_date || reunion.reunion_date}
                  onChange={(e) => setFormData({ ...formData, reunion_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location || reunion.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Update Reunion</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
