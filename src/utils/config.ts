// src/utils/config.ts
import fs from 'fs';
import path from 'path';

let cachedConfig: any = null;

export function loadConfig() {
  // Use cached config if available
  if (cachedConfig) return cachedConfig;

  // Determine config path (allow environment override)
  const configPath = process.env.CONFIG_PATH || path.resolve(__dirname, '../../config.json');

  try {
    // Read and parse config file
    const configData = fs.readFileSync(configPath, 'utf8');
    cachedConfig = JSON.parse(configData);
    return cachedConfig;
  } catch (error) {
    console.error('Error loading config:', error);
    throw new Error(`Failed to load configuration from ${configPath}`);
  }
}

export function updateConfig(updatedConfig: any) {
  // Determine config path
  const configPath = process.env.CONFIG_PATH || path.resolve(__dirname, '../../config.json');

  try {
    // Write updated config to file
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8');
    cachedConfig = updatedConfig;
    return true;
  } catch (error) {
    console.error('Error updating config:', error);
    throw new Error('Failed to update configuration');
  }
}
