/**
 * Event notification utilities for calendar reminders
 */

export interface EventReminderOptions {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  reminderTime: string; // e.g., '15min', '1hour', '1day', '1week'
}

/**
 * Calculate when to show reminder based on event time and reminder setting
 */
export function calculateReminderTime(eventDate: Date, reminderType: string): Date {
  const reminderDate = new Date(eventDate);
  
  switch (reminderType) {
    case '15min':
      reminderDate.setMinutes(reminderDate.getMinutes() - 15);
      break;
    case '30min':
      reminderDate.setMinutes(reminderDate.getMinutes() - 30);
      break;
    case '1hour':
      reminderDate.setHours(reminderDate.getHours() - 1);
      break;
    case '1day':
      reminderDate.setDate(reminderDate.getDate() - 1);
      break;
    case '1week':
      reminderDate.setDate(reminderDate.getDate() - 7);
      break;
    default:
      return reminderDate;
  }
  
  return reminderDate;
}

/**
 * Check if we should show a reminder now
 */
export function shouldShowReminder(eventDate: Date, reminderType: string): boolean {
  const now = new Date();
  const reminderTime = calculateReminderTime(eventDate, reminderType);
  
  // Show reminder if current time is past the reminder time but before the event
  return now >= reminderTime && now < eventDate;
}

/**
 * Show browser notification for upcoming event
 */
export async function showEventReminder(
  eventTitle: string,
  eventDate: Date,
  eventLocation?: string
): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return;
  }

  // Request permission if not granted
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    const timeUntilEvent = Math.floor((eventDate.getTime() - Date.now()) / 60000); // minutes
    let body = `Starting in ${timeUntilEvent} minutes`;
    
    if (eventLocation) {
      body += `\n📍 ${eventLocation}`;
    }

    new Notification(`Upcoming: ${eventTitle}`, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `event-reminder-${eventTitle}`,
      requireInteraction: true,
    });
  }
}

/**
 * Format time until event for display
 */
export function getTimeUntilEvent(eventDate: Date): string {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  
  if (diff < 0) return 'Event started';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  
  return 'Starting now';
}
