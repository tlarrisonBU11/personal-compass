
import * as SQLite from 'expo-sqlite';

// Open our local database
const dbPromise = SQLite.openDatabaseAsync('personal-compass.db');

// Define what a task looks like
export type Todo = {
  id: number;
  title: string;
  task_date: string;
  completed: number;
};

// Create our tasks table
export async function initializeTodos() {
  const db = await dbPromise;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      task_date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    );
  `);
}

// Get tasks for a specific day
export async function getTodos(date: string) {
  const db = await dbPromise;

  return db.getAllAsync<Todo>(
    'SELECT * FROM todos WHERE task_date = ? ORDER BY completed ASC, id DESC',
    date
  );
}

// Create a task
export async function addTodo(title: string, date: string) {
  const db = await dbPromise;

  await db.runAsync(
    'INSERT INTO todos (title, task_date) VALUES (?, ?)',
    title,
    date
  );
}

// Check or uncheck a task
export async function updateTodo(id: number, completed: boolean) {
  const db = await dbPromise;

  await db.runAsync(
    'UPDATE todos SET completed = ? WHERE id = ?',
    completed ? 1 : 0,
    id
  );
}

// Delete a task
export async function deleteTodo(id: number) {
  const db = await dbPromise;

  await db.runAsync('DELETE FROM todos WHERE id = ?', id);
}
