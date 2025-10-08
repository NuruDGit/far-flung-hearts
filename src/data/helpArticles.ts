export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export const helpArticles: HelpArticle[] = [
  // Getting Started Articles
  {
    id: 'getting-started-1',
    category: 'Getting Started',
    title: 'Creating Your Account',
    content: `Welcome to Love Beyond Borders! Creating your account is simple:

1. **Sign Up**: Click the "Get Started" button on the homepage
2. **Enter Your Details**: Provide your email and create a secure password
3. **Verify Email**: Check your inbox for a verification email (check spam if you don't see it)
4. **Complete Your Profile**: Add your name, photo, and relationship details
5. **Invite Your Partner**: Use the unique invite code to connect with your partner

**Tips:**
- Use a strong password with at least 8 characters
- Add a profile photo to personalize your experience
- Complete all profile fields to help your partner get to know you better`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'getting-started-2',
    category: 'Getting Started',
    title: 'Connecting with Your Partner',
    content: `Once you've created your account, here's how to connect with your partner:

1. **Navigate to Pair Setup**: Go to your profile and click "Invite Partner"
2. **Generate Invite Code**: A unique 6-character code will be created
3. **Share the Code**: Send this code to your partner via text, email, or any messaging app
4. **Partner Joins**: Your partner creates an account and enters the code
5. **Connection Complete**: You're now paired and can access all couple features!

**What Happens After Pairing:**
- Access to shared calendar and goals
- Video and audio calling
- Shared mood tracking
- Memory vault for photos and memories
- AI relationship advisor

**Troubleshooting:**
- Codes expire after 24 hours - generate a new one if needed
- Both users must complete their profiles to activate all features
- Only one active pair connection is allowed per user`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'getting-started-3',
    category: 'Getting Started',
    title: 'Understanding Your Dashboard',
    content: `Your dashboard is the heart of Love Beyond Borders. Here's what you'll find:

**Top Section:**
- **Partner Profile**: Quick access to your partner's profile and relationship stats
- **Current Streak**: Days you've both been active
- **Mood Tracker**: Quick mood logging button

**Quick Actions:**
- **Send Love Message**: One-tap to send a pre-written love note
- **Quick Ping**: Instant "thinking of you" notification
- **Share Selfie**: Quick photo sharing to messages

**Main Features:**
- **Messages**: Send text, photos, voice messages
- **Calendar**: Shared events and important dates
- **Goals**: Track relationship and personal goals together
- **Mood**: Daily mood check-ins
- **More**: Access to Memory Vault, Games, Wishlist, and Settings

**Bottom Navigation:**
Stay connected with quick access to Messages, Calendar, Goals, Mood, and More.`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'getting-started-4',
    category: 'Getting Started',
    title: 'Free vs Premium Features',
    content: `Love Beyond Borders offers both free and premium tiers:

**Free Tier Includes:**
- Basic messaging (100 messages/month)
- Profile creation and pairing
- Daily mood logging
- Basic calendar events
- Community access

**Premium Features ($9.99/month):**
- ✨ Unlimited messaging
- 📹 Unlimited HD video calls with call history
- 🤖 AI Love Advisor with unlimited conversations
- 📊 Advanced mood analytics and insights
- 📸 Unlimited Memory Vault storage
- 🎯 Unlimited goals and tasks
- 🎮 All games unlocked
- 🎁 Unlimited wishlist items
- 👑 Priority support
- 📱 Ad-free experience

**How to Upgrade:**
1. Navigate to More → Upgrade to Premium
2. Choose monthly or annual billing
3. Enter payment details (secure Stripe checkout)
4. Instant access to all premium features!

**Subscription Management:**
- Cancel anytime from your profile settings
- Changes take effect at the end of billing period
- No hidden fees or contracts`,
    lastUpdated: '2025-01-15'
  },

  // Video Calls Articles
  {
    id: 'video-calls-1',
    category: 'Video Calls',
    title: 'Starting a Video Call',
    content: `Video calls are available for Premium users. Here's how to start one:

**From Messages Page:**
1. Open the Messages page
2. Look for the video camera icon at the top right
3. Tap the icon to initiate a call
4. Your partner receives an instant notification
5. They can accept to join the call

**Call Features:**
- HD video quality
- Crystal clear audio
- Screen sharing (tap share icon)
- Mute/unmute microphone
- Turn camera on/off
- End call button

**Before Your First Call:**
- Grant camera and microphone permissions
- Test your connection with a trial call
- Ensure good lighting for best video quality
- Use headphones for better audio

**Call Quality Tips:**
- Use WiFi instead of cellular data when possible
- Close other apps to free up bandwidth
- Position camera at eye level
- Find a quiet space with minimal background noise`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'video-calls-2',
    category: 'Video Calls',
    title: 'Troubleshooting Video Call Issues',
    content: `Having trouble with video calls? Try these solutions:

**No Video/Audio:**
1. Check browser permissions for camera/microphone
2. Ensure no other app is using your camera
3. Refresh the page and try again
4. Test with another video app to rule out hardware issues

**Poor Call Quality:**
- Switch to WiFi if on cellular
- Close bandwidth-heavy apps (streaming, downloads)
- Move closer to your WiFi router
- Reduce video quality in settings if needed

**Echo or Feedback:**
- Use headphones or earbuds
- Lower speaker volume
- Check that only one device is connected
- Ensure partner is also using headphones

**Connection Drops:**
- Check your internet speed (minimum 5 Mbps recommended)
- Restart your router
- Update your browser to latest version
- Clear browser cache and cookies

**Partner Can't Join:**
- Verify they have Premium subscription
- Check if they're receiving notifications
- Ensure they're logged in
- Try sending a new call invitation

**Still Having Issues?**
Contact support with:
- Your device and browser type
- Description of the problem
- Screenshot if possible
- Date/time of the issue`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'video-calls-3',
    category: 'Video Calls',
    title: 'Call History and Recording',
    content: `Premium users get access to comprehensive call history:

**Viewing Call History:**
1. Navigate to More → Call History
2. See all past video and audio calls
3. Filter by date, duration, or call type
4. Export history for your records

**Call Details Include:**
- Date and time of call
- Duration (hours:minutes:seconds)
- Call quality rating
- Participants
- Call type (video/audio)

**Call Quality Metrics:**
After each call, you can see:
- Connection quality score
- Video resolution achieved
- Audio clarity rating
- Any dropped connections

**Important Notes:**
- Calls are NOT recorded by default
- We respect your privacy completely
- Only metadata (time, duration) is stored
- You can request data deletion anytime

**Call Analytics:**
Premium users can view:
- Total call time this month
- Average call duration
- Best times for call quality
- Connection success rate

**Privacy & Security:**
- All calls are end-to-end encrypted
- No third-party access
- GDPR compliant
- Data stored securely`,
    lastUpdated: '2025-01-15'
  },

  // Features Guide Articles
  {
    id: 'features-1',
    category: 'Features Guide',
    title: 'Using the Memory Vault',
    content: `The Memory Vault is your private space to store and cherish special moments:

**Uploading Memories:**
1. Navigate to Memory Vault (Premium feature)
2. Click the "+" button
3. Select photos from your device
4. Add a title and description
5. Tag the date and location (optional)
6. Save to your vault

**Organizing Your Memories:**
- **Albums**: Create themed collections
- **Tags**: Add keywords for easy searching
- **Favorites**: Star your most precious moments
- **Timeline**: View memories chronologically
- **Map View**: See where memories were created

**Sharing Memories:**
- Share individual photos with your partner
- Create shared albums
- Set permissions (view only or edit)
- Download full resolution originals

**Bulk Actions:**
- Select multiple photos
- Move to different albums
- Apply tags in bulk
- Download zip archive
- Delete selected

**Search & Filter:**
- Search by title, description, or tags
- Filter by date range
- Sort by newest, oldest, or favorites
- Filter by shared status

**Storage Limits:**
- Free: No Memory Vault access
- Premium: Unlimited photo storage
- High-resolution photos supported
- Videos up to 100MB each`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'features-2',
    category: 'Features Guide',
    title: 'AI Love Advisor',
    content: `Get personalized relationship advice from our AI Love Advisor:

**Starting a Conversation:**
1. Navigate to AI Advisor (Premium feature)
2. Type your question or concern
3. Receive thoughtful, personalized advice
4. Continue the conversation naturally

**What the AI Can Help With:**
- Relationship communication tips
- Date ideas and planning
- Conflict resolution strategies
- Long-distance relationship advice
- Gift suggestions
- Love language understanding
- Quality time ideas
- Conversation starters

**Best Practices:**
- Be specific about your situation
- Provide context when helpful
- Ask follow-up questions
- Apply advice thoughtfully
- Remember it's supplementary to professional help

**Important Disclaimer:**
The AI Advisor provides general relationship suggestions and is NOT a substitute for:
- Professional therapy or counseling
- Crisis intervention
- Mental health treatment
- Legal or medical advice

**For Serious Issues:**
If you're experiencing:
- Abuse of any kind
- Mental health crisis
- Severe relationship conflict
- Trauma-related issues

Please consult a licensed professional immediately.

**Privacy:**
- Conversations are private
- Not shared with your partner
- Used only to improve AI responses
- Can be deleted anytime`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'features-3',
    category: 'Features Guide',
    title: 'Shared Goals and Tasks',
    content: `Work towards your dreams together with shared goals:

**Creating Goals:**
1. Navigate to Goals page
2. Click "New Goal"
3. Add title and description
4. Set target date
5. Choose goal category
6. Invite partner to collaborate

**Goal Categories:**
- Relationship goals
- Travel plans
- Financial goals
- Health & fitness
- Career development
- Home & lifestyle
- Personal growth

**Breaking Down Goals:**
- Add tasks and subtasks
- Assign to yourself or partner
- Set individual due dates
- Track progress percentage
- Add notes and updates

**Task Management:**
- **To Do**: Tasks not started
- **In Progress**: Currently working on
- **Done**: Completed tasks
- **Archived**: Auto-archived after 7 days

**Collaboration Features:**
- Real-time updates
- Task comments
- File attachments
- Progress notifications
- Shared checklist items

**Progress Tracking:**
- Visual progress bars
- Completion percentage
- Milestone celebrations
- Achievement badges
- Monthly reports

**AI Recommendations:**
Premium users get AI-powered:
- Goal suggestions based on interests
- Task breakdown assistance
- Timeline recommendations
- Resource suggestions`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'features-4',
    category: 'Features Guide',
    title: 'Mood Tracking and Analytics',
    content: `Track and understand your emotional well-being together:

**Daily Mood Logging:**
1. Click the Mood icon
2. Select your current mood emoji
3. Add optional notes
4. Choose to share with partner
5. Submit your entry

**Mood Options:**
😊 Happy - Feeling great and positive
😌 Calm - Peaceful and relaxed
😔 Sad - Feeling down
😰 Anxious - Worried or stressed
😡 Frustrated - Annoyed or angry
😍 In Love - Feeling romantic
😴 Tired - Low energy

**Sharing with Partner:**
- Toggle "Share with partner" option
- Partner can see your mood
- Helps them understand how to support you
- Can remain private if preferred

**Mood Analytics (Premium):**
View detailed insights including:
- Mood patterns over time
- Most common moods
- Mood correlation with events
- Partner mood comparison
- Weekly/monthly trends
- Mood triggers and patterns

**Partner Support:**
When your partner shares a difficult mood:
- Receive gentle notification
- See their mood and notes
- Suggested support actions
- Send supportive message

**Mood Insights:**
Premium users get:
- Personalized mood reports
- Pattern recognition
- Recommendations for well-being
- Correlation with calendar events
- Seasonal mood variations

**Privacy:**
- Your data is private by default
- Choose what to share
- Delete entries anytime
- Export your data (GDPR compliant)`,
    lastUpdated: '2025-01-15'
  },

  // Troubleshooting Articles
  {
    id: 'troubleshooting-1',
    category: 'Troubleshooting',
    title: 'Login and Account Issues',
    content: `Having trouble accessing your account? Here's how to fix common issues:

**Forgot Password:**
1. Click "Forgot Password" on login page
2. Enter your registered email
3. Check inbox for reset link (check spam)
4. Click link and create new password
5. Password must be 8+ characters

**Email Not Verified:**
- Check spam/junk folder
- Request new verification email
- Ensure email address is correct
- Contact support if still not received

**Can't Login:**
- Verify email and password are correct
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Ensure caps lock is off
- Try a different browser

**Account Locked:**
If you see "Account locked":
- Too many failed login attempts
- Wait 15 minutes before trying again
- Use password reset if needed
- Contact support if issue persists

**Two-Factor Authentication Issues:**
- Ensure device time is correct
- Use backup codes if available
- Check authenticator app is updated
- Contact support to reset 2FA

**Browser Compatibility:**
Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Still Can't Access?**
Contact support with:
- Your registered email
- Description of the issue
- Screenshots if helpful
- Device and browser info`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'troubleshooting-2',
    category: 'Troubleshooting',
    title: 'Notification Issues',
    content: `Not receiving notifications? Follow these steps:

**Check App Permissions:**
1. Go to your device settings
2. Find Love Beyond Borders app
3. Verify notifications are enabled
4. Allow all notification types

**In-App Settings:**
1. Navigate to More → Notifications
2. Enable desired notification types:
   - Messages
   - Video calls
   - Mood alerts
   - Event reminders
   - Daily questions
   - Task reminders

**Browser Notifications:**
For web app users:
1. Check browser notification settings
2. Ensure site permissions allow notifications
3. Not blocked in system preferences
4. Try different browser if issues persist

**Notification Types:**
- **Push Notifications**: Instant alerts
- **Email Notifications**: Daily summary
- **In-App**: Badge counts and alerts

**Quiet Hours:**
Set quiet hours to pause notifications:
1. Go to notification settings
2. Set start and end times
3. Notifications resume automatically

**Troubleshooting Steps:**
1. Log out and log back in
2. Clear app cache
3. Update to latest version
4. Reinstall app if needed
5. Check device Do Not Disturb mode

**Email Notifications:**
If not receiving emails:
- Check spam/junk folder
- Add noreply@lobebo.com to contacts
- Verify email in profile is correct
- Check email notification preferences

**Partner Not Receiving:**
- Verify they enabled notifications
- Check their quiet hours settings
- Ensure they're paired correctly
- Ask them to check spam folder`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'troubleshooting-3',
    category: 'Troubleshooting',
    title: 'Subscription and Billing',
    content: `Having issues with your subscription? Here's help:

**Payment Failed:**
Common reasons:
- Insufficient funds
- Expired card
- Card declined by bank
- Incorrect billing address

**Solutions:**
1. Update payment method
2. Contact your bank
3. Try different payment method
4. Ensure international transactions allowed

**Managing Subscription:**
1. Navigate to Profile → Subscription Management
2. Opens Stripe Customer Portal
3. Update payment method
4. Change plan or cancel

**Canceling Subscription:**
1. Go to Subscription Management
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Access continues until period ends
5. No refunds for partial months

**Billing Cycle:**
- Monthly: Charged same day each month
- Annual: Charged once per year (save 20%)
- Prorated charges for upgrades
- Cancel anytime, no penalties

**Invoice Issues:**
- View all invoices in portal
- Download PDF receipts
- Update billing email
- Request specific invoice formats

**Refund Policy:**
- 30-day money-back guarantee
- Contact support for refund requests
- Processed within 5-7 business days
- Credited to original payment method

**Subscription Not Active:**
If premium features aren't working:
1. Check subscription status in profile
2. Verify payment processed
3. Log out and back in
4. Clear browser cache
5. Contact support if unresolved

**Changing Payment Method:**
1. Open Customer Portal
2. Click "Update payment method"
3. Enter new card details
4. Save changes
5. Next charge uses new method

**Contact Billing Support:**
For billing issues, email:
billing@lobebo.com with:
- Your account email
- Issue description
- Invoice/receipt if applicable`,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'troubleshooting-4',
    category: 'Troubleshooting',
    title: 'Performance and Loading Issues',
    content: `Is the app running slow or not loading? Try these fixes:

**Slow Loading:**
1. **Check Internet Connection**
   - Ensure stable WiFi or cellular
   - Run speed test (minimum 5 Mbps)
   - Move closer to router if on WiFi

2. **Clear Browser Cache**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Preferences → Privacy → Clear Data
   - Safari: Preferences → Privacy → Manage Website Data

3. **Update Browser**
   - Use latest version of supported browser
   - Enable automatic updates

4. **Disable Extensions**
   - Try incognito/private mode
   - Disable ad blockers temporarily
   - Check for conflicting extensions

**App Won't Load:**
- Refresh the page (Ctrl+R or Cmd+R)
- Hard refresh (Ctrl+Shift+R)
- Clear cache and cookies
- Try different browser
- Check if site is down (status page)

**Images Not Loading:**
- Check internet connection
- Clear image cache
- Try different network
- Verify file isn't corrupted
- Contact support if persistent

**Video Call Lag:**
- Close bandwidth-heavy apps
- Use wired connection if possible
- Reduce video quality
- Ensure minimum 10 Mbps speed
- Update device drivers

**Mobile App Issues:**
- Force close and reopen
- Clear app cache
- Update to latest version
- Restart your device
- Reinstall if necessary

**Memory Issues:**
- Close unused tabs
- Restart browser
- Increase available RAM
- Check for system updates

**Error Messages:**
For any error codes:
1. Note the exact error message
2. Screenshot if possible
3. Try the basic fixes above
4. Contact support with details

**Optimal Performance Tips:**
- Use recommended browsers
- Keep software updated
- Close unnecessary apps
- Regular cache clearing
- Stable internet connection
- Disable unnecessary extensions`,
    lastUpdated: '2025-01-15'
  }
];

export const getArticlesByCategory = (category: string): HelpArticle[] => {
  return helpArticles.filter(article => article.category === category);
};

export const getArticleById = (id: string): HelpArticle | undefined => {
  return helpArticles.find(article => article.id === id);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(helpArticles.map(article => article.category)));
};

export const searchArticles = (query: string): HelpArticle[] => {
  const lowerQuery = query.toLowerCase();
  return helpArticles.filter(article => 
    article.title.toLowerCase().includes(lowerQuery) ||
    article.content.toLowerCase().includes(lowerQuery) ||
    article.category.toLowerCase().includes(lowerQuery)
  );
};