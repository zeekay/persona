/**
 * Unified personality loader for Hanzo ecosystem.
 * Loads personalities from the centralized JSON file.
 */

import * as fs from 'fs';
import * as path from 'path';

// Import the JSON directly if using module resolution
import personalityData from './all_personalities.json';

export interface Personality {
  name: string;
  programmer: string;
  description: string;
  philosophy?: string;
  tools: string[];
  tags: string[];
  environment?: Record<string, string>;
}

export class PersonalityLoader {
  private personalities: Map<string, Personality>;

  constructor(data?: Personality[]) {
    this.personalities = new Map();
    this.load(data || personalityData);
  }

  private load(data: Personality[]): void {
    for (const personality of data) {
      this.personalities.set(personality.name, personality);
    }
  }

  /**
   * Get all personalities as an array
   */
  getAll(): Personality[] {
    return Array.from(this.personalities.values());
  }

  /**
   * Get a specific personality by name
   */
  get(name: string): Personality | undefined {
    return this.personalities.get(name);
  }

  /**
   * Filter personalities by tags
   */
  filterByTags(tags: string[]): Personality[] {
    return this.getAll().filter(p =>
      tags.some(tag => p.tags.includes(tag))
    );
  }

  /**
   * Get all personality names
   */
  getNames(): string[] {
    return Array.from(this.personalities.keys());
  }

  /**
   * Get total count of personalities
   */
  count(): number {
    return this.personalities.size;
  }
}

// Create singleton instance
export const loader = new PersonalityLoader();

// Convenience exports
export const getAllPersonalities = () => loader.getAll();
export const getPersonality = (name: string) => loader.get(name);
export const listPersonalityNames = () => loader.getNames();
export const countPersonalities = () => loader.count();

// For Node.js environments that can't import JSON directly
export function loadFromFile(filePath?: string): PersonalityLoader {
  const file = filePath || path.join(__dirname, 'all_personalities.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return new PersonalityLoader(data);
}

// Export default personalities data for convenience
export const personalities = personalityData;
export default loader;