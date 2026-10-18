import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function DailyReminder() {
  return (
    <ThemedView
      type="backgroundElement"
      style={{
        padding: 20,
        borderRadius: 16,
        alignSelf: 'stretch',
        gap: 12,
      }}
    >
      <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
        Daily Reminder
      </ThemedText>

      <ThemedText style={{ textAlign: 'center' }}>
        How many hours of today am I willing to waste,
        and how many am I willing to be productive?
      </ThemedText>
    </ThemedView>
  );
}