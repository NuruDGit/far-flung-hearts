import { useState, useEffect } from "react";
import AppNavigation from "@/components/AppNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Plus, Check, ExternalLink } from "lucide-react";
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

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [pairId, setPairId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

    const { data: pairData } = await supabase
      .from('pairs')
      .select('id')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .single();

    if (pairData) {
      setPairId(pairData.id);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-love" />
            <h1 className="text-3xl font-bold">Gift Wishlist</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Wishlist Item</DialogTitle>
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

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
            <div className="space-y-3">
              {myItems.map((item) => (
                <Card key={item.id} className={item.purchased ? 'opacity-50' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    {item.price && <p className="font-semibold">${item.price}</p>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-love hover:underline flex items-center gap-1">
                        View Item <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {item.purchased && <p className="text-sm text-success">✓ Purchased by partner</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Partner's Wishlist</h2>
            <div className="space-y-3">
              {partnerItems.map((item) => (
                <Card key={item.id} className={item.purchased ? 'border-success' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    {item.price && <p className="font-semibold">${item.price}</p>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-love hover:underline flex items-center gap-1">
                        View Item <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <Button
                      onClick={() => togglePurchased(item)}
                      variant={item.purchased ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                    >
                      {item.purchased ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Purchased
                        </>
                      ) : (
                        "Mark as Purchased"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
