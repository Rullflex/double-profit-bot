export class DataStorage {
  private data: Map<string, any> = new Map();

  store<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  load<T>(key: string): T | undefined {
    return this.data.get(key) as T;
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  deleteAll(partOfKey: string): void {
    for (const key of this.data.keys()) {
      if (key.includes(partOfKey)) {
        this.data.delete(key);
      }
    }
  }
}

export const globalStorage = new DataStorage();
