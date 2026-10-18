
import { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import {
    Todo,
    addTodo,
    deleteTodo,
    getTodos,
    initializeTodos,
    updateTodo,
} from '@/lib/todos';

// Use the iPhone's local date, not UTC.
function getLocalDate(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function MoreScreen() {
  const [day, setDay] = useState(0);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  const date = getLocalDate(day);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  async function refreshTasks() {
    const savedTasks = await getTodos(date);
    setTasks(savedTasks);
  }

  // Load tasks when the screen opens or the day changes.
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        await initializeTodos();
        const savedTasks = await getTodos(date);

        if (active) setTasks(savedTasks);
      } catch {
        Alert.alert('Error', 'Could not load your tasks.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [date]);

  async function handleAdd() {
    const title = newTask.trim();
    if (!title) return;

    try {
      await addTodo(title, date);
      setNewTask('');
      await refreshTasks();
    } catch {
      Alert.alert('Error', 'Could not save your task.');
    }
  }

  async function handleToggle(task: Todo) {
    try {
      await updateTodo(task.id, task.completed === 0);
      await refreshTasks();
    } catch {
      Alert.alert('Error', 'Could not update your task.');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTodo(id);
      await refreshTasks();
    } catch {
      Alert.alert('Error', 'Could not delete your task.');
    }
  }

  const remaining = tasks.filter((task) => task.completed === 0).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">More</ThemedText>
        <ThemedText type="subtitle">Daily To-Do</ThemedText>

        <View style={styles.daySelector}>
          {[0, 1].map((offset) => (
            <Pressable
              key={offset}
              onPress={() => setDay(offset)}
              style={[
                styles.dayButton,
                {
                  backgroundColor:
                    day === offset ? colors.backgroundElement : 'transparent',
                },
              ]}
            >
              <ThemedText>{offset === 0 ? 'Today' : 'Tomorrow'}</ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText>
          {remaining} {remaining === 1 ? 'task' : 'tasks'} remaining
        </ThemedText>

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.text },
            ]}
            placeholder="Add a task..."
            placeholderTextColor="#888888"
            value={newTask}
            onChangeText={setNewTask}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />

          <Pressable
            onPress={handleAdd}
            style={[styles.addButton, { backgroundColor: colors.backgroundElement }]}
          >
            <ThemedText>Add</ThemedText>
          </Pressable>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled">
          {loading ? (
            <ThemedText>Loading tasks...</ThemedText>
          ) : tasks.length === 0 ? (
            <ThemedText>No tasks yet. Add your first one.</ThemedText>
          ) : (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <Pressable
                  onPress={() => handleToggle(task)}
                  style={styles.taskContent}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.completed === 1 }}
                >
                  <ThemedText>
                    {task.completed === 1 ? '☑' : '☐'}
                  </ThemedText>
                  <ThemedText
                    style={{
                      flex: 1,
                      textDecorationLine:
                        task.completed === 1 ? 'line-through' : 'none',
                      opacity: task.completed === 1 ? 0.5 : 1,
                    }}
                  >
                    {task.title}
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(task.id)}
                  accessibilityLabel={`Delete ${task.title}`}
                >
                  <ThemedText>Delete</ThemedText>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 20,
    gap: 18,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  dayButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  addButton: {
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
