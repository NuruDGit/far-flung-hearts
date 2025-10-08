import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Flame, MessageSquareQuote, Heart, MapPin, Calendar } from "lucide-react";
import { AnimatedCounter } from "../AnimatedCounter";

interface PartnerCardProps {
  partner: any;
  userProfile: any;
  currentTime: string;
  streak: number;
  loadingStreak: boolean;
  messageCount: number;
}

export const PartnerCard = ({
  partner,
  userProfile,
  currentTime,
  streak,
  loadingStreak,
  messageCount,
}: PartnerCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className="relative w-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <Card 
          className="glass-medium shadow-elevation-4 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center relative">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-love-heart to-love-deep p-1 shadow-glow-sm">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-love-coral to-love-heart text-white">
                        {userProfile?.first_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="relative -ml-4"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-love-heart to-love-deep p-1 shadow-glow-sm">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={partner.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-love-coral to-love-heart text-white">
                        {partner.first_name?.charAt(0).toUpperCase() || <Heart size={20} />}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Online status ring */}
                  <motion.div
                    className="absolute bottom-0 right-0 w-5 h-5 bg-success rounded-full border-4 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold text-foreground">
                  {partner.first_name || partner.display_name}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <motion.div
                    className="w-2 h-2 bg-success rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Active now
                </p>
              </div>

              <p className="text-xs text-muted-foreground italic">
                Tap to flip
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-3 rounded-lg glass-subtle"
              >
                <Clock className="h-5 w-5 mx-auto mb-2 text-love-coral" />
                <p className="text-xs text-muted-foreground mb-1">Their time</p>
                <p className="font-semibold text-sm">{currentTime}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                className="p-3 rounded-lg glass-subtle"
              >
                <Flame className="h-5 w-5 mx-auto mb-2 text-warning" />
                <p className="text-xs text-muted-foreground mb-1">Streak</p>
                <p className="font-semibold text-sm">
                  {loadingStreak ? '--' : <><AnimatedCounter end={streak} /> {streak === 1 ? 'day' : 'days'}</>}
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                className="p-3 rounded-lg glass-subtle"
              >
                <MessageSquareQuote className="h-5 w-5 mx-auto mb-2 text-love-deep" />
                <p className="text-xs text-muted-foreground mb-1">Messages</p>
                <p className="font-semibold text-sm">
                  <AnimatedCounter end={messageCount} />
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card 
          className="absolute top-0 left-0 w-full glass-medium shadow-elevation-4 backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-display font-bold mb-4 text-center">Partner Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg glass-subtle">
                <MapPin className="w-5 h-5 text-love-heart flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-sm">{partner.city || 'Unknown'}, {partner.country || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg glass-subtle">
                <Calendar className="w-5 h-5 text-love-heart flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Connected Since</p>
                  <p className="font-medium text-sm">
                    {partner.created_at ? new Date(partner.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg glass-subtle">
                <Heart className="w-5 h-5 text-love-heart flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Relationship Status</p>
                  <p className="font-medium text-sm">Together Forever ❤️</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-6 italic">
              Tap again to flip back
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
