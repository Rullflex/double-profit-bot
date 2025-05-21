import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ProjectConfig {
  name: string;
  debug: boolean;
  logToFile: boolean;
  schedulerInterval: string;
  ddsPath: string;
}

interface BotConfig {
  token: string;
  endpoint: string;
  port: number;
}

interface FullConfig {
  project: ProjectConfig;
  internalBot: BotConfig;
  externalBot: BotConfig;
}

let configInstance: FullConfig | null = null;

export function getConfig(): FullConfig {
  if (configInstance) return configInstance;

  const filePath = path.resolve(__dirname, '../../config/config.yml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  configInstance = yaml.load(fileContents) as FullConfig;

  return configInstance;
}