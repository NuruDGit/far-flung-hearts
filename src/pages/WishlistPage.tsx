import { useState, useEffect } from "react";
import AppNavigation from "@/components/AppNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Plus, Check, ExternalLink, Sparkles, Heart, Star, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  link?: string;
  price?: number;
  priority: 'low' | 'medium' | 'high';
  purchased: boolean;
  purchased_by?: string;
  user_id: string;
}

interface Profile {
  id: string;
  display_name?: string;
  first_name?: string;
  avatar_url?: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [pairId, setPairId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    price: "",
    priority: "medium"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Fetch current user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, avatar_url')
      .eq('id', user.id)
      .single();
    
    if (userProfile) setCurrentUserProfile(userProfile);

    const { data: pairData } = await supabase
      .from('pairs')
      .select('id, user_a, user_b')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .single();

    if (pairData) {
      setPairId(pairData.id);
      
      // Fetch partner profile
      const partnerId = pairData.user_a === user.id ? pairData.user_b : pairData.user_a;
      const { data: partnerProfileData } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, avatar_url')
        .eq('id', partnerId)
        .single();
      
      if (partnerProfileData) setPartnerProfile(partnerProfileData);
      
      loadWishlist(pairData.id);
    }
  };

  const loadWishlist = async (pairIdToLoad: string) => {
    const { data } = await supabase
      .from('gift_wishlist')
      .select('*')
      .eq('pair_id', pairIdToLoad)
      .order('created_at', { ascending: false });

    if (data) setItems(data as WishlistItem[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairId || !currentUserId) return;

    const { error } = await supabase.from('gift_wishlist').insert({
      pair_id: pairId,
      user_id: currentUserId,
      title: formData.title,
      description: formData.description || null,
      link: formData.link || null,
      price: formData.price ? parseFloat(formData.price) : null,
      priority: formData.priority as 'low' | 'medium' | 'high'
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Item added to wishlist!" });
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", link: "", price: "", priority: "medium" });
      loadWishlist(pairId);
    }
  };

  const togglePurchased = async (item: WishlistItem) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from('gift_wishlist')
      .update({
        purchased: !item.purchased,
        purchased_by: !item.purchased ? currentUserId : null,
        purchased_at: !item.purchased ? new Date().toISOString() : null
      })
      .eq('id', item.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
    } else {
      if (pairId) loadWishlist(pairId);
    }
  };

  const myItems = items.filter(i => i.user_id === currentUserId);
  const partnerItems = items.filter(i => i.user_id !== currentUserId);

  // Calculate stats
  const myGrantedWishes = partnerItems.filter(i => i.purchased && i.purchased_by === currentUserId).length;
  const partnerGrantedWishes = myItems.filter(i => i.purchased && i.purchased_by !== currentUserId).length;

  const getUserName = (profile: Profile | null) => {
    return profile?.display_name || profile?.first_name || 'Partner';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Sparkles className="h-64 w-64 text-primary animate-pulse" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Gift className="h-10 w-10 text-primary animate-bounce" />
              <Heart className="h-8 w-8 text-accent animate-pulse" />
              <Sparkles className="h-10 w-10 text-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Where Wishes Come True
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share your dreams and make {getUserName(partnerProfile)}'s wishes a reality. Every gift tells a story of love.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        {(myGrantedWishes > 0 || partnerGrantedWishes > 0) && (
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Wishes You Granted</p>
                </div>
                <p className="text-4xl font-bold text-primary">{myGrantedWishes}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-accent" />
                  <p className="text-sm text-muted-foreground">{getUserName(partnerProfile)} Granted</p>
                </div>
                <p className="text-4xl font-bold text-accent">{partnerGrantedWishes}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-center mb-12">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                Add Wish
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Star className="h-6 w-6 text-primary" />
                  Make a Wish
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Item Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add to Wishlist</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* My Wishlist */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              {currentUserProfile?.avatar_url ? (
                <img 
                  src={currentUserProfile.avatar_url} 
                  alt={getUserName(currentUserProfile)}
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary shadow-lg"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{getUserName(currentUserProfile)}'s Wishlist</h2>
                <p className="text-sm text-muted-foreground">Dreams waiting to come true</p>
              </div>
            </div>
            <div className="space-y-4">
              {myItems.length === 0 ? (
                <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-12 text-center">
                    <Star className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">Your wishlist is empty. Add your first wish!</p>
                  </CardContent>
                </Card>
              ) : (
                myItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`group hover:shadow-xl transition-all duration-300 border-2 ${
                      item.purchased 
                        ? 'border-success/50 bg-success/5' 
                        : 'border-primary/20 hover:border-primary/50'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.purchased ? 'bg-success/20' : 'bg-gradient-to-br from-primary/20 to-accent/20'
                          }`}>
                            {item.purchased ? (
                              <Check className="h-5 w-5 text-success" />
                            ) : (
                              <Gift className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {item.title}
                            </CardTitle>
                            {item.purchased && (
                              <p className="text-sm text-success font-medium mt-1 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Wish granted by partner!
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={getPriorityColor(item.priority)}
                          className="flex-shrink-0"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {item.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        {item.price && (
                          <p className="text-lg font-bold text-primary">
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                        {item.link && (
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-primary hover:text-accent transition-colors flex items-center gap-1 font-medium"
                          >
                            View Item <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Partner's Wishlist */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              {partnerProfile?.avatar_url ? (
                <img 
                  src={partnerProfile.avatar_url} 
                  alt={getUserName(partnerProfile)}
                  className="h-12 w-12 rounded-full object-cover border-2 border-accent shadow-lg"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{getUserName(partnerProfile)}'s Wishlist</h2>
                <p className="text-sm text-muted-foreground">Make their dreams come true</p>
              </div>
            </div>
            <div className="space-y-4">
              {partnerItems.length === 0 ? (
                <Card className="border-dashed border-2 border-accent/20 bg-accent/5">
                  <CardContent className="p-12 text-center">
                    <Heart className="h-12 w-12 text-accent/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">{getUserName(partnerProfile)} hasn't added any wishes yet.</p>
                  </CardContent>
                </Card>
              ) : (
                partnerItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`group hover:shadow-xl transition-all duration-300 border-2 ${
                      item.purchased 
                        ? 'border-success bg-success/10 shadow-success/20' 
                        : 'border-accent/20 hover:border-accent/50 hover:shadow-accent/10'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.purchased 
                              ? 'bg-success shadow-success/30 shadow-lg' 
                              : 'bg-gradient-to-br from-accent/20 to-primary/20'
                          }`}>
                            {item.purchased ? (
                              <Check className="h-5 w-5 text-white" />
                            ) : (
                              <Star className="h-5 w-5 text-accent" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-accent transition-colors">
                              {item.title}
                            </CardTitle>
                            {item.purchased && (
                              <p className="text-sm text-success font-medium mt-1 flex items-center gap-1">
                                <Heart className="h-3 w-3 fill-current" />
                                You made this wish come true!
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={getPriorityColor(item.priority)}
                          className="flex-shrink-0"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {item.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        {item.price && (
                          <p className="text-lg font-bold text-accent">
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                        {item.link && (
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-accent hover:text-primary transition-colors flex items-center gap-1 font-medium"
                          >
                            View Item <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <Button
                        onClick={() => togglePurchased(item)}
                        variant={item.purchased ? "outline" : "default"}
                        size="lg"
                        className={`w-full transition-all duration-300 ${
                          item.purchased 
                            ? 'border-success text-success hover:bg-success/10' 
                            : 'bg-gradient-to-r from-accent to-primary hover:shadow-lg hover:scale-[1.02]'
                        }`}
                      >
                        {item.purchased ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Wish Granted
                            <Sparkles className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <Gift className="mr-2 h-5 w-5" />
                            Grant This Wish
                            <Heart className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
