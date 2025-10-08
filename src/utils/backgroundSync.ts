// Background sync utilities for offline message sending
export class BackgroundSync {
  private static QUEUE_NAME = 'message-queue';

  static async registerSync(tag: string): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.log('Background sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Failed to register background sync:', error);
      return false;
    }
  }

  static async queueMessage(message: {
    content: string;
    pairId: string;
    userId: string;
  }): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      ...message,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    });
    await this.saveQueue(queue);
    await this.registerSync('sync-messages');
  }

  static async getQueue(): Promise<any[]> {
    const stored = localStorage.getItem(this.QUEUE_NAME);
    return stored ? JSON.parse(stored) : [];
  }

  static async saveQueue(queue: any[]): Promise<void> {
    localStorage.setItem(this.QUEUE_NAME, JSON.stringify(queue));
  }

  static async clearQueue(): Promise<void> {
    localStorage.removeItem(this.QUEUE_NAME);
  }

  static async processQueue(
    processor: (item: any) => Promise<boolean>
  ): Promise<void> {
    const queue = await this.getQueue();
    const remaining = [];

    for (const item of queue) {
      try {
        const success = await processor(item);
        if (!success) {
          remaining.push(item);
        }
      } catch (error) {
        console.error('Failed to process queued item:', error);
        remaining.push(item);
      }
    }

    await this.saveQueue(remaining);
  }
}
