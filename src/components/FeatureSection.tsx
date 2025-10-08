import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, HelpCircle, Clock, Vault, Globe, Target, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { TestimonialCarousel } from "./landing/TestimonialCarousel";

const FeatureSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Real-Time Messaging",
      description: "Chat with your partner instantly with message reactions, replies, and media sharing.",
      color: "love-heart"
    },
    {
      icon: Calendar,
      title: "Shared Calendar",
      description: "Sync your schedules across time zones and never miss a special moment together.",
      color: "love-deep"
    },
    {
      icon: HelpCircle,
      title: "Mood Tracking",
      description: "Track your emotional journey together with insights and partner support features.",
      color: "love-coral"
    },
    {
      icon: Target,
      title: "Goals & Tasks",
      description: "Set and achieve relationship goals together with shared task management.",
      color: "love-heart"
    },
    {
      icon: Vault,
      title: "Memory Vault",
      description: "Securely store your precious photos and messages in an encrypted vault.",
      color: "love-deep"
    },
    {
      icon: Brain,
      title: "AI Love Advisor",
      description: "Get personalized relationship advice and book recommendations powered by AI.",
      color: "love-coral"
    },
    {
      icon: Globe,
      title: "Timezone Intelligence",
      description: "Smart notifications that respect both your schedules and time zones.",
      color: "love-heart"
    },
    {
      icon: Clock,
      title: "Daily Questions",
      description: "Deepen your connection with thoughtful daily prompts tailored to your relationship.",
      color: "love-deep"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-secondary/30 to-transparent -z-10" />
      
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
            Everything You Need to Stay Connected
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built specifically for long-distance couples, our features help you feel closer even when you're miles apart.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full border-2 border-border hover:border-love-heart/50 transition-all shadow-elevation-2 hover:shadow-elevation-4 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-love-coral to-love-heart flex items-center justify-center shadow-glow-sm`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl md:text-4xl font-display font-bold text-center mb-4 bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
            Loved by Couples Worldwide
          </h3>
          <p className="text-center text-muted-foreground mb-12">
            See what couples are saying about their Lobebo experience
          </p>
          <TestimonialCarousel />
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
