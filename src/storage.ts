import { readFile, writeFile } from 'fs/promises';

const path = 'data.json';

export async function loadData(): Promise<Record<string, number>> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function saveData(data: Record<string, number>) {
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}