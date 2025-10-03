import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // This would normally come from a database or CMS
  const blogPosts: Record<string, any> = {
    "keep-spark-alive-ldr": {
      title: "10 Ways to Keep the Spark Alive in Long-Distance Relationships",
      content: `Distance doesn't have to mean disconnection. Here are ten proven strategies to maintain intimacy and excitement in your long-distance relationship.

## 1. Schedule Regular Video Dates
Make video calls a non-negotiable part of your routine. Whether it's daily check-ins or weekly date nights, consistency builds connection.

## 2. Send Unexpected Surprises
Random gifts, handwritten letters, or care packages show you're thinking of them even when apart.

## 3. Share Daily Experiences
Use photos, voice notes, or quick texts to share the little moments of your day. It helps your partner feel included in your life.

## 4. Plan Future Visits
Having something to look forward to makes the distance more bearable. Mark calendars and count down together.

## 5. Create Shared Experiences
Watch movies together online, play games, or cook the same recipe while on video call.

## 6. Maintain Physical Intimacy
Be creative with ways to maintain physical connection, even from afar. Flirty texts and intimate video calls can help.

## 7. Trust and Communication
Build a foundation of trust through honest, open communication about feelings, concerns, and expectations.

## 8. Pursue Individual Growth
Use the distance as an opportunity for personal development. Share your growth with your partner.

## 9. Stay Positive
Focus on the benefits of your relationship rather than dwelling on the distance. Maintain an optimistic outlook.

## 10. Make the Most of Reunions
When you do get together, create memorable experiences and cherish every moment.

Remember, distance is just a test of how far love can travel. With effort, creativity, and commitment, your long-distance relationship can thrive.`,
      author: "Dr. Sarah Johnson",
      date: "March 15, 2024",
      readTime: "8 min read",
      category: "Relationship Tips",
      image: "💕"
    },
    "time-zone-challenges": {
      title: "Time Zone Challenges: How to Sync Your Schedules",
      content: `Managing different time zones is one of the biggest practical challenges in long-distance relationships. Here's how to make it work.

## Understanding the Challenge
When you're separated by multiple time zones, finding overlap in your schedules can feel impossible. One person's morning might be the other's bedtime.

## Strategies for Success

### Create a Shared Calendar
Use tools like Google Calendar to visualize both schedules in each other's time zones. Mark important times when you're both available.

### Find Your Golden Hours
Identify the times that work for both of you, even if they're not perfect. Maybe you wake up early and they stay up late.

### Be Flexible
Take turns making sacrifices. Alternate who adjusts their schedule to accommodate the other.

### Use Asynchronous Communication
Voice notes, videos, and thoughtful messages let you communicate when live conversation isn't possible.

### Weekend Advantage
Weekends often provide more flexibility for longer calls when schedules don't have to work around jobs.

## Making It Work
The key is respecting each other's sleep schedules while finding creative ways to stay connected across the time difference.`,
      author: "Mark Chen",
      date: "March 10, 2024",
      readTime: "5 min read",
      category: "Practical Advice",
      image: "🌍"
    },
    "psychology-of-missing": {
      title: "The Psychology of Missing Someone",
      content: `Understanding the emotional aspects of being apart can help you cope more healthily with the distance.

## The Science of Longing
Missing someone activates the same brain regions associated with physical pain. It's not just emotional—it's neurological.

## Normal Responses
Feeling sad, anxious, or distracted when missing your partner is completely normal. These feelings validate the importance of your relationship.

## Healthy Coping Mechanisms

### Stay Connected to Your Emotions
Don't suppress your feelings. Acknowledge them, journal about them, talk about them with your partner.

### Maintain Your Own Life
While it's normal to miss your partner, maintaining your own friendships, hobbies, and routines is crucial.

### Physical Self-Care
Exercise, proper sleep, and nutrition can significantly impact your emotional well-being during separation.

### Creative Expression
Channel your feelings into art, music, writing, or other creative outlets.

## When to Seek Help
If feelings of sadness persist and interfere with daily functioning, consider speaking with a mental health professional.

## The Silver Lining
Missing someone can deepen your appreciation for them and strengthen your emotional connection when you're together.`,
      author: "Dr. Emily Roberts",
      date: "March 8, 2024",
      readTime: "7 min read",
      category: "Mental Health",
      image: "🧠"
    },
    "virtual-date-ideas": {
      title: "Virtual Date Ideas That Actually Work",
      content: `Creative ways to enjoy meaningful dates when you can't be physically together.

## Movie Night
Use browser extensions like Teleparty to watch movies simultaneously. Make popcorn, dim the lights, and enjoy together.

## Cook Together
Choose a recipe, video call, and cook the same meal together. Enjoy dinner "together" at the end.

## Online Games
From multiplayer video games to online board games, playing together creates shared fun experiences.

## Virtual Museum Tours
Many museums offer free virtual tours. Explore art and culture together from your separate homes.

## Book Club for Two
Read the same book and discuss it together. It gives you something to talk about beyond daily updates.

## Stargazing
Use apps to identify constellations and look at the same night sky together, even if hours apart.

## Workout Buddies
Do the same workout routine over video call. Encourage each other and stay healthy together.

## Virtual Escape Rooms
Online escape rooms provide challenging puzzles you can solve together.

## The Key to Success
What matters most isn't the activity itself, but the quality time and attention you give each other.`,
      author: "Jessica Martinez",
      date: "March 5, 2024",
      readTime: "6 min read",
      category: "Date Ideas",
      image: "🎬"
    },
    "communication-tips-busy-couples": {
      title: "Communication Tips for Busy Couples",
      content: `How to maintain meaningful connection when life gets hectic.

## Quality Over Quantity
You don't need to talk for hours every day. Focused, meaningful conversations are better than constant distracted chatting.

## Schedule Check-Ins
Set specific times for calls so you both know when to prioritize each other.

## Voice Notes Revolution
When schedules don't align, voice notes let you share your day conversationally without needing real-time availability.

## Morning and Night Rituals
A quick "good morning" and "goodnight" message creates daily touchpoints.

## Share Your Calendar
Knowing what your partner is doing helps you understand their availability and feel connected to their life.

## Be Present When You Connect
Put away distractions. Give your full attention during your time together.

## Communicate About Communication
Talk about what's working and what isn't. Adjust your communication style as needed.

## Remember: It's a Season
Busy periods come and go. Maintain connection through the chaos, and look forward to calmer times.`,
      author: "David Thompson",
      date: "March 1, 2024",
      readTime: "5 min read",
      category: "Communication",
      image: "💬"
    },
    "success-story-sarah-ahmed": {
      title: "Success Story: From 5,000 Miles Apart to Married",
      content: `How Sarah and Ahmed overcame distance, visa challenges, and cultural differences.

## The Beginning
Sarah met Ahmed through a mutual friend's online gaming group. She was in Seattle, he was in Cairo. Neither expected to fall in love.

## The Challenges

### Distance
At 5,000 miles apart with a 10-hour time zone difference, finding time to connect was the first hurdle.

### Visa Complications
Navigating immigration requirements for international couples presented bureaucratic nightmares.

### Cultural Differences
Blending American and Egyptian cultural expectations required patience, understanding, and compromise.

### Family Concerns
Both families initially had reservations about the long-distance, international nature of the relationship.

## What Made It Work

### Communication
They video-called daily, sent voice notes throughout the day, and made each other a priority.

### Visits
They saved aggressively and visited every 3-4 months, alternating who traveled.

### Future Planning
From early on, they discussed long-term goals and created a roadmap for closing the distance.

### Cultural Learning
Both made efforts to understand and respect each other's backgrounds, learning languages and traditions.

## The Happy Ending
After two years of long-distance dating and navigating the K-1 visa process, Ahmed moved to Seattle. They married six months later.

## Their Advice
"Distance is temporary if you both want it to be. Stay committed to your shared future, communicate constantly, and trust each other completely."`,
      author: "Love Beyond Borders Team",
      date: "February 28, 2024",
      readTime: "10 min read",
      category: "Success Stories",
      image: "💍"
    },
    "managing-jealousy-ldr": {
      title: "Managing Jealousy in Long-Distance Relationships",
      content: `Expert advice on building trust and handling insecurity when apart.

## Understanding Jealousy in LDRs
Distance amplifies insecurity. Not seeing your partner's daily life can trigger imagination and worry.

## Root Causes
- Lack of physical presence
- Limited information about daily activities
- Previous relationship trauma
- Inherent personality tendencies

## Building Trust

### Transparency
Share your life openly. Post about your day, introduce your partner (virtually) to your friends.

### Consistency
Reliable communication patterns create security. Unexpected silence breeds worry.

### Reassurance
Regularly affirm your commitment and feelings for each other.

### Social Media Clarity
Discuss boundaries around social media, posting about each other, and interactions with others.

## Handling Jealous Feelings

### Communicate
Don't let jealousy fester. Address concerns directly and calmly with your partner.

### Self-Reflect
Ask yourself if your jealousy is based on facts or fears. Often it's the latter.

### Trust Until Given Reason Not To
Start from a foundation of trust rather than suspicion.

### Work on Self-Esteem
Sometimes jealousy stems from personal insecurity. Work on your own confidence.

## When It's a Problem
If jealousy controls the relationship, becomes accusatory without cause, or creates constant conflict, consider couples counseling.

## The Goal
Healthy LDRs balance care and connection with independence and trust.`,
      author: "Dr. Sarah Johnson",
      date: "February 25, 2024",
      readTime: "8 min read",
      category: "Relationship Tips",
      image: "💚"
    }
  };

  const post = blogPosts[slug || ""];

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
        <Header />
        <main className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-love-deep mb-4">Post Not Found</h1>
          <Button onClick={() => navigate("/blog")} className="bg-gradient-to-r from-love-heart to-love-coral">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-love-light/20">
      <Header />
      <main className="container mx-auto px-6 py-24">
        <Button 
          onClick={() => navigate("/blog")} 
          variant="ghost"
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        <article className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <Card className="mb-8 overflow-hidden border-2 border-love-coral/30">
            <div className="bg-gradient-to-br from-love-heart/10 to-love-coral/10 h-64 flex items-center justify-center">
              <div className="text-9xl">{post.image}</div>
            </div>
          </Card>

          {/* Meta Info */}
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-love-heart to-love-coral mb-4">
              {post.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-love-deep mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <Card>
            <CardContent className="pt-8 space-y-6">
              {post.content.split('\n\n').map((paragraph: string, idx: number) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-3xl font-bold text-love-deep mt-8 mb-4 first:mt-0">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                } else if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-xl font-semibold text-love-deep mt-6 mb-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                } else if (paragraph.trim()) {
                  return (
                    <p key={idx} className="text-foreground/80 leading-relaxed text-base">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Button 
              onClick={() => navigate("/blog")}
              className="bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Posts
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
