#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to ask questions
const question = (q) => new Promise(resolve => rl.question(q, resolve));

// Categories and their directories
const CATEGORIES = {
  programmer: 'programmers',
  philosopher: 'philosophers',
  scientist: 'scientists',
  religious: 'religious',
  revolutionary: 'revolutionaries',
  writer: 'writers',
  artist: 'artists',
  architect: 'architects',
  athlete: 'athletes',
  explorer: 'explorers',
  activist: 'activists',
  tech_leader: 'leaders',
  leader: 'leaders',
  pioneer: 'pioneers',
  special: 'special'
};

// Generate ID from name
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .substring(0, 50);
}

// Main function
async function addPersonality() {
  console.log('\n=== Add New Personality ===\n');

  try {
    // Basic info
    const name = await question('Name (display name): ');
    const fullName = await question('Full name (optional, press Enter to skip): ');
    const id = await question(`ID (press Enter for "${generateId(name)}"): `) || generateId(name);

    // Category
    console.log('\nCategories:', Object.keys(CATEGORIES).join(', '));
    const category = await question('Category: ');

    if (!CATEGORIES[category]) {
      console.error(`Invalid category: ${category}`);
      process.exit(1);
    }

    // Tags
    const tagsInput = await question('Tags (comma-separated, optional): ');
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

    // OCEAN scores
    console.log('\n=== OCEAN Scores (0-100) ===');
    const openness = parseInt(await question('Openness (creativity, curiosity): ')) || 50;
    const conscientiousness = parseInt(await question('Conscientiousness (organization, discipline): ')) || 50;
    const extraversion = parseInt(await question('Extraversion (sociability, energy): ')) || 50;
    const agreeableness = parseInt(await question('Agreeableness (cooperation, trust): ')) || 50;
    const neuroticism = parseInt(await question('Neuroticism (emotional instability): ')) || 50;

    // Personality
    console.log('\n=== Personality ===');
    const summary = await question('Summary (brief description): ');
    const philosophy = await question('Philosophy (core belief/motto): ');
    const approach = await question('Approach (optional): ');
    const communication = await question('Communication style (optional): ');

    // Values
    const valuesInput = await question('Core values (comma-separated, optional): ');
    const values = valuesInput ? valuesInput.split(',').map(v => v.trim()).filter(Boolean) : undefined;

    // Quotes
    console.log('\n=== Quotes (optional, enter empty line to finish) ===');
    const quotes = [];
    let quoteNum = 1;
    while (true) {
      const quote = await question(`Quote ${quoteNum}: `);
      if (!quote) break;
      quotes.push(quote);
      quoteNum++;
    }

    // For programmers, add technical info
    let technical;
    if (category === 'programmer' || category === 'tech_leader') {
      console.log('\n=== Technical Info (optional) ===');
      const languagesInput = await question('Programming languages (comma-separated): ');
      const languages = languagesInput ? languagesInput.split(',').map(l => l.trim()).filter(Boolean) : undefined;

      const domainsInput = await question('Domains (comma-separated): ');
      const domains = domainsInput ? domainsInput.split(',').map(d => d.trim()).filter(Boolean) : undefined;

      const essentialTools = await question('Essential tools (comma-separated): ');
      const essential = essentialTools ? essentialTools.split(',').map(t => t.trim()).filter(Boolean) : undefined;

      if (languages || domains || essential) {
        technical = {};
        if (languages) technical.languages = languages;
        if (domains) technical.domains = domains;
        if (essential) technical.tools = { essential };
      }
    }

    // Build the personality object
    const personality = {
      "$schema": "../schemas/personality.schema.json",
      id,
      name,
      category
    };

    if (fullName) personality.fullName = fullName;
    if (tags.length > 0) personality.tags = tags;

    personality.ocean = {
      openness: Math.min(100, Math.max(0, openness)),
      conscientiousness: Math.min(100, Math.max(0, conscientiousness)),
      extraversion: Math.min(100, Math.max(0, extraversion)),
      agreeableness: Math.min(100, Math.max(0, agreeableness)),
      neuroticism: Math.min(100, Math.max(0, neuroticism))
    };

    personality.personality = {
      summary: summary || `${category} personality`,
      philosophy: philosophy || 'No philosophy recorded'
    };

    if (approach) personality.personality.approach = approach;
    if (communication) personality.personality.communication = communication;
    if (values) personality.personality.values = values;
    if (technical) personality.technical = technical;
    if (quotes.length > 0) personality.quotes = quotes;

    // Determine target directory
    const targetDir = CATEGORIES[category];
    const baseDir = path.join(__dirname, '..', 'personalities_v2');
    const dirPath = path.join(baseDir, targetDir);

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Check if file already exists
    const filePath = path.join(dirPath, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const overwrite = await question(`\nFile ${id}.json already exists. Overwrite? (y/N): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    // Write the file
    fs.writeFileSync(filePath, JSON.stringify(personality, null, 2));
    console.log(`\n✅ Created: ${targetDir}/${id}.json`);

    // Update manifest
    const manifestPath = path.join(baseDir, 'index', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Update index
      manifest.index[id] = {
        path: `${targetDir}/${id}.json`,
        name: name,
        category: category,
        tags: tags
      };

      // Update category
      if (!manifest.categories[category]) {
        manifest.categories[category] = {
          count: 0,
          path: targetDir,
          ids: []
        };
      }

      if (!manifest.categories[category].ids.includes(id)) {
        manifest.categories[category].ids.push(id);
        manifest.categories[category].count++;
        manifest.total++;
      }

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('✅ Updated manifest.json');
    }

    // Suggest rebuilding
    console.log('\nTo rebuild aggregated files, run: npm run build');

  } catch (err) {
    console.error('\nError:', err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  addPersonality();
}

module.exports = { addPersonality };