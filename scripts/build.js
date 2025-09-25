#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const PERSONAS_DIR = path.join(__dirname, '..', 'personalities_v2');
const DIST_DIR = path.join(PERSONAS_DIR, 'dist');
const INDEX_FILE = path.join(PERSONAS_DIR, 'index', 'manifest.json');

// Category mappings (reverse of migrate.js)
const CATEGORY_DIRS = {
  programmers: ['programmer', 'systems', 'language-creator', 'gaming', 'blockchain'],
  philosophers: ['philosopher'],
  scientists: ['scientist', 'mathematician'],
  religious: ['religious'],
  revolutionaries: ['revolutionary'],
  writers: ['writer', 'poet', 'historian'],
  artists: ['artist', 'musician', 'filmmaker', 'comedian', 'composer'],
  architects: ['architect'],
  athletes: ['athlete'],
  explorers: ['explorer'],
  activists: ['activist'],
  leaders: ['tech_leader', 'leader', 'statesman', 'media'],
  pioneers: ['pioneer'],
  special: ['special', 'master']
};

// Load all personalities from a directory
function loadPersonalities(dirPath) {
  const personalities = [];

  if (!fs.existsSync(dirPath)) {
    return personalities;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
      const personality = JSON.parse(content);
      // Remove the schema reference for the aggregated files
      delete personality.$schema;
      personalities.push(personality);
    } catch (err) {
      console.error(`Error loading ${file}: ${err.message}`);
    }
  });

  return personalities;
}

// Build all personalities file
function buildAllPersonalities() {
  console.log('Building all personalities file...');

  const allPersonalities = [];
  const dirs = fs.readdirSync(PERSONAS_DIR)
    .filter(d => !['dist', 'index', 'schemas', 'scripts'].includes(d))
    .filter(d => fs.statSync(path.join(PERSONAS_DIR, d)).isDirectory());

  dirs.forEach(dir => {
    const personalities = loadPersonalities(path.join(PERSONAS_DIR, dir));
    allPersonalities.push(...personalities);
  });

  // Sort by name
  allPersonalities.sort((a, b) => a.name.localeCompare(b.name));

  // Write the file
  const outputPath = path.join(DIST_DIR, 'all.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    version: '2.0.0',
    generated: new Date().toISOString(),
    total: allPersonalities.length,
    personalities: allPersonalities
  }, null, 2));

  console.log(`  Created: dist/all.json (${allPersonalities.length} personalities)`);

  return allPersonalities;
}

// Build category-specific files
function buildCategoryFiles() {
  console.log('\nBuilding category files...');

  const categoryDir = path.join(DIST_DIR, 'by-category');
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  Object.entries(CATEGORY_DIRS).forEach(([dirName, categories]) => {
    const dirPath = path.join(PERSONAS_DIR, dirName);
    const personalities = loadPersonalities(dirPath);

    if (personalities.length > 0) {
      const outputPath = path.join(categoryDir, `${dirName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify({
        version: '2.0.0',
        generated: new Date().toISOString(),
        category: dirName,
        categories: categories,
        total: personalities.length,
        personalities: personalities
      }, null, 2));

      console.log(`  Created: dist/by-category/${dirName}.json (${personalities.length} personalities)`);
    }
  });
}

// Build tag-based collections
function buildTagFiles(allPersonalities) {
  console.log('\nBuilding tag files...');

  const tagDir = path.join(DIST_DIR, 'by-tag');
  if (!fs.existsSync(tagDir)) {
    fs.mkdirSync(tagDir, { recursive: true });
  }

  // Collect all tags
  const tagMap = new Map();

  allPersonalities.forEach(p => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag).push(p);
      });
    }
  });

  // Write files for tags with 3+ personalities
  let tagCount = 0;
  tagMap.forEach((personalities, tag) => {
    if (personalities.length >= 3) {
      const sanitizedTag = tag.replace(/[^a-z0-9_-]/gi, '_');
      const outputPath = path.join(tagDir, `${sanitizedTag}.json`);

      fs.writeFileSync(outputPath, JSON.stringify({
        version: '2.0.0',
        generated: new Date().toISOString(),
        tag: tag,
        total: personalities.length,
        personalities: personalities
      }, null, 2));

      tagCount++;
    }
  });

  console.log(`  Created ${tagCount} tag files (tags with 3+ personalities)`);
}

// Generate TypeScript types
function generateTypes(allPersonalities) {
  console.log('\nGenerating TypeScript types...');

  const types = `// Auto-generated TypeScript types for personalities
// Generated: ${new Date().toISOString()}

export interface OceanScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PersonalityMetadata {
  born?: string;
  died?: string;
  nationality?: string;
  active?: boolean;
  company?: string;
  achievements?: string[];
}

export interface PersonalityInfo {
  summary: string;
  philosophy: string;
  approach?: string;
  communication?: string;
  values?: string[];
}

export interface TechnicalInfo {
  languages?: string[];
  domains?: string[];
  tools?: {
    essential?: string[];
    preferred?: string[];
    created?: string[];
  };
}

export interface BehavioralTraits {
  codeStyle?: string;
  reviewStyle?: string;
  workStyle?: string;
  collaboration?: string;
}

export interface Personality {
  id: string;
  name: string;
  fullName?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  metadata?: PersonalityMetadata;
  ocean: OceanScores;
  personality: PersonalityInfo;
  technical?: TechnicalInfo;
  quotes?: string[];
  behavioral?: BehavioralTraits;
}

export interface PersonalityCollection {
  version: string;
  generated: string;
  total: number;
  personalities: Personality[];
  category?: string;
  tag?: string;
}

// Personality ID union type
export type PersonalityId = ${allPersonalities.map(p => `'${p.id}'`).join(' | ')};

// Category union type
export type PersonalityCategory = ${[...new Set(allPersonalities.map(p => `'${p.category}'`))].join(' | ')};
`;

  const outputPath = path.join(DIST_DIR, 'types.ts');
  fs.writeFileSync(outputPath, types);
  console.log('  Created: dist/types.ts');
}

// Generate index file for easy imports
function generateIndex() {
  console.log('\nGenerating index file...');

  const indexContent = `// Auto-generated index for personality imports
// Generated: ${new Date().toISOString()}

// Individual personality imports
${Object.entries(CATEGORY_DIRS).map(([dir, cats]) => {
  const dirPath = path.join(PERSONAS_DIR, dir);
  if (!fs.existsSync(dirPath)) return '';

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const id = f.replace('.json', '');
    return `export { default as ${id} } from '../${dir}/${f}';`;
  }).join('\n');
}).filter(Boolean).join('\n')}

// Category collections
export { default as allPersonalities } from './all.json';
${Object.keys(CATEGORY_DIRS).map(dir =>
  `export { default as ${dir} } from './by-category/${dir}.json';`
).join('\n')}

// Type exports
export * from './types';
`;

  const outputPath = path.join(DIST_DIR, 'index.js');
  fs.writeFileSync(outputPath, indexContent);
  console.log('  Created: dist/index.js');
}

// Update package.json exports
function updatePackageJson() {
  console.log('\nUpdating package.json exports...');

  const packagePath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('  No package.json found, skipping...');
    return;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Add exports field for modern module resolution
    pkg.exports = {
      '.': './personalities_v2/dist/index.js',
      './all': './personalities_v2/dist/all.json',
      './types': './personalities_v2/dist/types.ts',
      './by-category/*': './personalities_v2/dist/by-category/*.json',
      './by-tag/*': './personalities_v2/dist/by-tag/*.json',
      './personalities/*': './personalities_v2/*/*.json'
    };

    // Add files field to include in npm package
    pkg.files = [
      'personalities_v2/**/*.json',
      'personalities_v2/dist/**/*',
      'personalities_v2/schemas/*.json',
      '!personalities_v2/scripts'
    ];

    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('  Updated package.json with exports field');
  } catch (err) {
    console.error(`  Error updating package.json: ${err.message}`);
  }
}

// Main build function
async function build() {
  console.log('Starting build process...\n');

  // Ensure dist directories exist
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Build all files
  const allPersonalities = buildAllPersonalities();
  buildCategoryFiles();
  buildTagFiles(allPersonalities);
  generateTypes(allPersonalities);
  generateIndex();
  updatePackageJson();

  console.log('\nBuild complete!');
  console.log(`Total personalities: ${allPersonalities.length}`);
}

// Run build
if (require.main === module) {
  build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
}

module.exports = { build };