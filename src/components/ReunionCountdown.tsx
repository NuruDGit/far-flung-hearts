import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Heart, MapPin } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    loadReunion();
  }, [pairId]);

  useEffect(() => {
    if (!reunion) return;

    const timer = setInterval(() => {
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
    }, 1000);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
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
    <Card className="bg-gradient-to-br from-love/10 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-love" />
          {reunion.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-love">{timeLeft.days}</div>
            <div className="text-sm text-muted-foreground">Days</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-love">{timeLeft.hours}</div>
            <div className="text-sm text-muted-foreground">Hours</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-love">{timeLeft.minutes}</div>
            <div className="text-sm text-muted-foreground">Minutes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-love">{timeLeft.seconds}</div>
            <div className="text-sm text-muted-foreground">Seconds</div>
          </div>
        </div>
        
        {reunion.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {reunion.location}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
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
