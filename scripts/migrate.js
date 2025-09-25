#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '..', 'personalities');
const TARGET_DIR = path.join(__dirname, '..', 'personalities_v2');
const SCHEMA_PATH = path.join(__dirname, '..', 'schemas', 'personality.schema.json');

// Category mappings
const CATEGORY_DIRS = {
  programmer: 'programmers',
  philosopher: 'philosophers',
  scientist: 'scientists',
  religious: 'religious',
  revolutionary: 'revolutionaries',
  writer: 'writers',
  artist: 'artists',
  musician: 'artists',
  filmmaker: 'artists',
  comedian: 'artists',
  architect: 'architects',
  athlete: 'athletes',
  explorer: 'explorers',
  activist: 'activists',
  tech_leader: 'leaders',
  leader: 'leaders',
  statesman: 'leaders',
  pioneer: 'pioneers',
  mathematician: 'scientists',
  special: 'special',
  systems: 'programmers',
  master: 'programmers',
  'language-creator': 'programmers',
  historian: 'writers',
  gaming: 'programmers',
  blockchain: 'programmers',
  media: 'leaders',
  poet: 'writers'
};

// Initialize directories
function initDirectories() {
  // Create main directories
  const dirs = [
    TARGET_DIR,
    path.join(TARGET_DIR, 'index'),
    path.join(TARGET_DIR, 'schemas'),
    path.join(TARGET_DIR, 'scripts'),
    path.join(TARGET_DIR, 'dist'),
    path.join(TARGET_DIR, 'dist', 'by-category'),
    path.join(TARGET_DIR, 'dist', 'by-tag')
  ];

  // Create category directories
  const uniqueDirs = [...new Set(Object.values(CATEGORY_DIRS))];
  uniqueDirs.forEach(dir => {
    dirs.push(path.join(TARGET_DIR, dir));
  });

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  // Copy schema
  const schemaTarget = path.join(TARGET_DIR, 'schemas', 'personality.schema.json');
  if (fs.existsSync(SCHEMA_PATH) && !fs.existsSync(schemaTarget)) {
    fs.copyFileSync(SCHEMA_PATH, schemaTarget);
    console.log('Copied schema file');
  }
}

// Convert OCEAN scores to 0-100 scale if needed
function normalizeOcean(ocean) {
  const normalized = {};
  for (const [key, value] of Object.entries(ocean)) {
    // If any value is greater than 100, assume it's on a different scale
    normalized[key] = value > 100 ? Math.round(value / 10) : value;
  }
  return normalized;
}

// Generate ID from name
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .substring(0, 50);
}

// Convert old format to new format
function convertPersonality(oldData, source) {
  const id = oldData.id || generateId(oldData.name);
  const category = oldData.category || 'special';

  // Build new format
  const newFormat = {
    "$schema": "../schemas/personality.schema.json",
    id: id,
    name: oldData.name || oldData.display_name,
    category: category
  };

  // Add full name if available
  if (oldData.fullName || oldData.programmer) {
    newFormat.fullName = oldData.fullName || oldData.programmer;
  }

  // Add subcategory if makes sense
  if (oldData.subcategory) {
    newFormat.subcategory = oldData.subcategory;
  }

  // Generate tags
  const tags = [];
  if (oldData.tags) {
    tags.push(...oldData.tags);
  } else {
    // Auto-generate some tags
    if (category) tags.push(category);
    if (oldData.primary_tech) tags.push(...oldData.primary_tech.map(t => t.toLowerCase()));
    if (oldData.role) tags.push(...oldData.role.toLowerCase().split(/[&,\s]+/).filter(t => t.length > 2));
  }
  if (tags.length > 0) {
    newFormat.tags = [...new Set(tags)];
  }

  // Add metadata
  const metadata = {};
  if (oldData.born || oldData.lived) metadata.born = oldData.born || oldData.lived;
  if (oldData.died) metadata.died = oldData.died;
  if (oldData.nationality) metadata.nationality = oldData.nationality;
  if (oldData.company) metadata.company = oldData.company;
  if (oldData.achievements) metadata.achievements = oldData.achievements;
  if (oldData.active !== undefined) metadata.active = oldData.active;

  if (Object.keys(metadata).length > 0) {
    newFormat.metadata = metadata;
  }

  // OCEAN scores (normalize to 0-100)
  if (oldData.ocean) {
    newFormat.ocean = normalizeOcean(oldData.ocean);
  } else if (oldData.personality && typeof oldData.personality === 'object' && oldData.personality.openness) {
    newFormat.ocean = normalizeOcean(oldData.personality);
  } else {
    // Default OCEAN scores
    newFormat.ocean = {
      openness: 70,
      conscientiousness: 70,
      extraversion: 50,
      agreeableness: 60,
      neuroticism: 40
    };
  }

  // Personality info
  const personality = {
    summary: oldData.description || oldData.summary || `${category} personality`,
    philosophy: oldData.philosophy || oldData.quote || "No philosophy recorded"
  };

  if (oldData.approach) personality.approach = oldData.approach;
  if (oldData.communication) personality.communication = oldData.communication;
  if (oldData.style?.communication) personality.communication = oldData.style.communication;
  if (oldData.values) personality.values = oldData.values;
  if (oldData.principles) personality.values = oldData.principles;

  newFormat.personality = personality;

  // Technical info (for programmers)
  if (category === 'programmer' || category === 'tech_leader' || oldData.primary_tech) {
    const technical = {};

    if (oldData.languages || oldData.primary_tech) {
      technical.languages = oldData.languages || oldData.primary_tech;
    }

    if (oldData.domains || oldData.tools?.domains) {
      technical.domains = oldData.domains || oldData.tools.domains;
    }

    if (oldData.tools) {
      technical.tools = {};
      if (oldData.tools.essential) technical.tools.essential = oldData.tools.essential;
      if (oldData.tools.preferred) technical.tools.preferred = oldData.tools.preferred;
      if (oldData.tools.created) technical.tools.created = oldData.tools.created;
      if (oldData.style?.tools) technical.tools.preferred = oldData.style.tools;
    }

    if (Object.keys(technical).length > 0) {
      newFormat.technical = technical;
    }
  }

  // Quotes
  if (oldData.quotes) {
    newFormat.quotes = oldData.quotes;
  } else if (oldData.quote) {
    newFormat.quotes = [oldData.quote];
  }

  // Behavioral traits
  if (oldData.behavioral || oldData.contribution_style || oldData.style) {
    const behavioral = {};

    if (oldData.behavioral?.codeStyle || oldData.style?.code) {
      behavioral.codeStyle = oldData.behavioral?.codeStyle || oldData.style.code;
    }
    if (oldData.behavioral?.reviewStyle || oldData.contribution_style?.review) {
      behavioral.reviewStyle = oldData.behavioral?.reviewStyle || oldData.contribution_style.review;
    }
    if (oldData.behavioral?.workStyle || oldData.style?.approach) {
      behavioral.workStyle = oldData.behavioral?.workStyle || oldData.style.approach;
    }
    if (oldData.behavioral?.collaboration) {
      behavioral.collaboration = oldData.behavioral.collaboration;
    }

    if (Object.keys(behavioral).length > 0) {
      newFormat.behavioral = behavioral;
    }
  }

  return newFormat;
}

// Process a single JSON file
function processFile(filePath) {
  console.log(`\nProcessing: ${path.basename(filePath)}`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    let personalities = [];

    // Handle different formats
    if (data.personalities && Array.isArray(data.personalities)) {
      personalities = data.personalities;
    } else if (data.personas && Array.isArray(data.personas)) {
      personalities = data.personas;
    } else if (data.name) {
      // Single personality file
      personalities = [data];
    } else {
      console.log(`  Skipping - unknown format`);
      return 0;
    }

    let count = 0;
    personalities.forEach(person => {
      try {
        const converted = convertPersonality(person, path.basename(filePath));
        const targetDir = CATEGORY_DIRS[converted.category] || 'special';
        const targetPath = path.join(TARGET_DIR, targetDir, `${converted.id}.json`);

        // Check for duplicates
        if (fs.existsSync(targetPath)) {
          console.log(`  Skipping duplicate: ${converted.id}`);
          return;
        }

        // Write the file
        fs.writeFileSync(targetPath, JSON.stringify(converted, null, 2));
        console.log(`  Created: ${targetDir}/${converted.id}.json`);
        count++;
      } catch (err) {
        console.error(`  Error converting ${person.name || 'unknown'}: ${err.message}`);
      }
    });

    return count;
  } catch (err) {
    console.error(`  Error reading file: ${err.message}`);
    return 0;
  }
}

// Generate manifest
function generateManifest() {
  console.log('\nGenerating manifest...');

  const manifest = {
    version: "2.0.0",
    generated: new Date().toISOString(),
    total: 0,
    categories: {},
    index: {}
  };

  // Scan all category directories
  const categoryDirs = [...new Set(Object.values(CATEGORY_DIRS))];

  categoryDirs.forEach(dir => {
    const dirPath = path.join(TARGET_DIR, dir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    if (files.length === 0) return;

    const categoryName = Object.keys(CATEGORY_DIRS).find(key => CATEGORY_DIRS[key] === dir) || dir;
    const ids = [];

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        ids.push(content.id);

        manifest.index[content.id] = {
          path: path.relative(TARGET_DIR, filePath),
          name: content.name,
          category: content.category,
          tags: content.tags || []
        };

        manifest.total++;
      } catch (err) {
        console.error(`Error reading ${file}: ${err.message}`);
      }
    });

    manifest.categories[categoryName] = {
      count: ids.length,
      path: dir,
      ids: ids
    };
  });

  // Write manifest
  const manifestPath = path.join(TARGET_DIR, 'index', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated manifest with ${manifest.total} personalities`);

  return manifest;
}

// Main migration function
async function migrate() {
  console.log('Starting migration...\n');

  // Initialize directory structure
  initDirectories();

  // Process all JSON files
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
  let totalConverted = 0;

  files.forEach(file => {
    const filePath = path.join(SOURCE_DIR, file);
    totalConverted += processFile(filePath);
  });

  console.log(`\nTotal personalities converted: ${totalConverted}`);

  // Generate manifest
  const manifest = generateManifest();

  // Generate category summary
  console.log('\nCategory Summary:');
  Object.entries(manifest.categories).forEach(([cat, info]) => {
    console.log(`  ${cat}: ${info.count} personalities`);
  });

  console.log('\nMigration complete!');
  console.log(`Output directory: ${TARGET_DIR}`);
}

// Run migration
if (require.main === module) {
  migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { migrate, convertPersonality };