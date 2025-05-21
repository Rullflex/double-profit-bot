import fs from "fs/promises";

export class DataStorage {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async store<T>(data: T): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async load<T>(): Promise<T | null> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(content) as T;
    } catch (err) {
      return null;
    }
  }

  async delete(): Promise<void> {
    await fs.unlink(this.filePath).catch(() => {});
  }
}
