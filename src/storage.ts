import { readFile, writeFile } from 'fs/promises';

const path = 'data.json';

export async function loadData(): Promise<Record<string, any>> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function saveData(data: Record<string, any>) {
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

// === FSM-подобные утилиты ===

const fnPrefix = 'nextFnForUser';

export async function getUserState(userId: number): Promise<string | null> {
  const data = await loadData();
  return data[`${fnPrefix}${userId}`] || null;
}

export async function setUserState(userId: number, state: string): Promise<void> {
  const data = await loadData();
  data[`${fnPrefix}${userId}`] = state;
  await saveData(data);
}

export async function clearUserState(userId: number): Promise<void> {
  const data = await loadData();
  delete data[`${fnPrefix}${userId}`];
  await saveData(data);
}