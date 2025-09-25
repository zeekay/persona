/**
 * Personality Profile Loader
 * Easy utilities for loading personality profiles
 */

import index from './index.json' assert { type: 'json' };
import categories from './categories.json' assert { type: 'json' };

/**
 * Load a single personality by ID
 * @param {string} id - The personality ID (e.g., 'einstein', 'zeekay')
 * @returns {Promise<Object>} The personality data
 */
export async function loadPersonality(id) {
  try {
    const personality = index.personalities.find(p => p.id === id);
    if (!personality) {
      throw new Error(`Personality '${id}' not found`);
    }
    const data = await import(`./${personality.file}`, { assert: { type: 'json' } });
    return data.default;
  } catch (error) {
    console.error(`Failed to load personality '${id}':`, error);
    throw error;
  }
}

/**
 * Load multiple personalities by IDs
 * @param {string[]} ids - Array of personality IDs
 * @returns {Promise<Object[]>} Array of personality data
 */
export async function loadPersonalities(ids) {
  return Promise.all(ids.map(id => loadPersonality(id)));
}

/**
 * Load all personalities in a category
 * @param {string} category - The category name (e.g., 'philosopher', 'programmer')
 * @returns {Promise<Object[]>} Array of personality data
 */
export async function loadCategory(category) {
  const categoryPersonalities = categories[category];
  if (!categoryPersonalities) {
    throw new Error(`Category '${category}' not found`);
  }
  
  return Promise.all(
    categoryPersonalities.map(async (p) => {
      const data = await import(`./${p.file}`, { assert: { type: 'json' } });
      return data.default;
    })
  );
}

/**
 * Get list of all available personalities
 * @returns {Object[]} Array of personality metadata
 */
export function listPersonalities() {
  return index.personalities;
}

/**
 * Get list of all categories
 * @returns {string[]} Array of category names
 */
export function listCategories() {
  return index.categories;
}

/**
 * Search personalities by name
 * @param {string} query - Search query
 * @returns {Object[]} Array of matching personality metadata
 */
export function searchPersonalities(query) {
  const lowerQuery = query.toLowerCase();
  return index.personalities.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get random personality
 * @param {string} [category] - Optional category filter
 * @returns {Promise<Object>} Random personality data
 */
export async function getRandomPersonality(category) {
  let pool = index.personalities;
  
  if (category && categories[category]) {
    pool = categories[category];
  }
  
  const random = pool[Math.floor(Math.random() * pool.length)];
  return loadPersonality(random.id);
}

// Export index and categories for direct access
export { index, categories };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadPersonality,
    loadPersonalities,
    loadCategory,
    listPersonalities,
    listCategories,
    searchPersonalities,
    getRandomPersonality,
    index,
    categories
  };
}