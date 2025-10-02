import { useState } from "react";
import { 
  Home, 
  MessageCircle, 
  Calendar, 
  Target, 
  Gamepad2, 
  Gift, 
  User, 
  Settings, 
  LogOut, 
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/AuthProvider";
import { SUBSCRIPTION_TIERS } from "@/config/subscriptionFeatures";

const navItems = [
  { title: "Home", url: "/app", icon: Home },
  { title: "Messages", url: "/app/messages", icon: MessageCircle },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Goals", url: "/app/goals", icon: Target },
  { title: "Games", url: "/app/games", icon: Gamepad2 },
  { title: "Wishlist", url: "/app/wishlist", icon: Gift },
];

const accountItems = [
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/notification-settings", icon: Settings },
];

export function AppSidebar() {
  const { state, openMobile, setOpenMobile, isMobile, open, setOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, subscription } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const collapsed = state === 'collapsed';

  // Fetch user profile for avatar
  useState(() => {
    if (user) {
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setUserProfile(data));
      });
    }
  });

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  const getNavCls = (active: boolean) =>
    active 
      ? "bg-love-heart/10 text-love-heart font-medium hover:bg-love-heart/20" 
      : "hover:bg-muted/50 text-muted-foreground";

  const getTierIcon = () => {
    if (subscription.tier === 'super_premium') return <Sparkles className="w-3 h-3" />;
    if (subscription.tier === 'premium') return <Crown className="w-3 h-3" />;
    return null;
  };

  const getTierColor = () => {
    if (subscription.tier === 'super_premium') return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (subscription.tier === 'premium') return "bg-gradient-to-r from-love-heart to-love-coral";
    return "bg-muted";
  };

  return (
    <Sidebar
      className={`border-r border-love-coral/20 ${collapsed ? "w-16" : "w-64"}`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Love Beyond Borders" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-love-deep">Love Beyond Borders</span>
            </div>
          )}
          {collapsed && (
            <img 
              src="/logo.png" 
              alt="Love Beyond Borders" 
              className="w-8 h-8 object-contain mx-auto"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/app"}
                      className={({ isActive }) => getNavCls(isActive)}
                    >
                      <item.icon className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => getNavCls(isActive)}
                    >
                      <item.icon className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Subscription Badge/Upgrade */}
        {!collapsed && subscription.tier === 'free' && (
          <Button
            variant="outline"
            className="w-full mb-3 bg-gradient-to-r from-love-heart to-love-coral text-white border-0 hover:opacity-90"
            onClick={() => navigate('/app/subscription')}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        )}

        {!collapsed && subscription.tier !== 'free' && (
          <div 
            className={`mb-3 p-3 rounded-lg ${getTierColor()} text-white cursor-pointer`}
            onClick={() => navigate('/app/subscription')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTierIcon()}
                <span className="text-sm font-medium">
                  {SUBSCRIPTION_TIERS[subscription.tier].name}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback className="bg-love-gradient text-white">
              {userProfile?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userProfile?.first_name || userProfile?.display_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="mt-2 w-full"
          onClick={() => setOpen(!open)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
