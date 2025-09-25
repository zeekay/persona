#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the mega personalities file
const megaFile = path.join(__dirname, '../personalities/mega-personalities.json');
const data = JSON.parse(fs.readFileSync(megaFile, 'utf8'));

// Create profiles directory
const profilesDir = path.join(__dirname, '../profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Standard template for each personality
function createPersonalityFile(person) {
  // Clean up the ID to make a valid filename
  const filename = person.id.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  
  const personalityData = {
    id: person.id,
    name: person.name,
    category: person.category,
    ocean: person.ocean,
    description: person.description || null,
    philosophy: person.philosophy || null,
    tools: person.tools || null,
    programmer: person.programmer || null
  };
  
  // Remove null fields
  Object.keys(personalityData).forEach(key => {
    if (personalityData[key] === null) {
      delete personalityData[key];
    }
  });
  
  return { filename, data: personalityData };
}

// Process all personalities
let index = [];
let categories = {};

data.personalities.forEach(person => {
  const { filename, data: personalityData } = createPersonalityFile(person);
  const filepath = path.join(profilesDir, `${filename}.json`);
  
  // Write individual file
  fs.writeFileSync(filepath, JSON.stringify(personalityData, null, 2));
  
  // Add to index
  index.push({
    id: person.id,
    name: person.name,
    category: person.category,
    file: `${filename}.json`
  });
  
  // Track categories
  if (!categories[person.category]) {
    categories[person.category] = [];
  }
  categories[person.category].push({
    id: person.id,
    name: person.name,
    file: `${filename}.json`
  });
  
  console.log(`Created: ${filename}.json`);
});

// Create index.json
const indexData = {
  total: index.length,
  categories: Object.keys(categories).sort(),
  personalities: index.sort((a, b) => a.name.localeCompare(b.name))
};

fs.writeFileSync(
  path.join(profilesDir, 'index.json'),
  JSON.stringify(indexData, null, 2)
);

// Create categories.json
fs.writeFileSync(
  path.join(profilesDir, 'categories.json'),
  JSON.stringify(categories, null, 2)
);

console.log(`\n✅ Created ${index.length} personality files`);
console.log(`📁 Files saved to: ${profilesDir}`);
console.log(`📋 Index created: index.json`);
console.log(`📊 Categories: ${Object.keys(categories).join(', ')}`);