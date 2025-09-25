#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const PERSONAS_DIR = path.join(__dirname, '..', 'personalities_v2');
const SCHEMA_PATH = path.join(PERSONAS_DIR, 'schemas', 'personality.schema.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Validation results
let totalFiles = 0;
let validFiles = 0;
let errors = [];
let warnings = [];

// Validate OCEAN scores
function validateOcean(ocean, id) {
  const issues = [];

  if (!ocean) {
    issues.push(`Missing OCEAN scores`);
    return issues;
  }

  const requiredFields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

  requiredFields.forEach(field => {
    if (ocean[field] === undefined) {
      issues.push(`Missing OCEAN.${field}`);
    } else if (typeof ocean[field] !== 'number') {
      issues.push(`OCEAN.${field} must be a number (got ${typeof ocean[field]})`);
    } else if (ocean[field] < 0 || ocean[field] > 100) {
      issues.push(`OCEAN.${field} must be between 0-100 (got ${ocean[field]})`);
    }
  });

  return issues;
}

// Validate a single personality file
function validateFile(filePath) {
  const filename = path.basename(filePath);
  const fileErrors = [];
  const fileWarnings = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let data;

    // Parse JSON
    try {
      data = JSON.parse(content);
    } catch (err) {
      fileErrors.push(`Invalid JSON: ${err.message}`);
      return { errors: fileErrors, warnings: fileWarnings };
    }

    // Check required fields
    const requiredFields = ['id', 'name', 'category', 'ocean', 'personality'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        fileErrors.push(`Missing required field: ${field}`);
      }
    });

    // Validate ID
    if (data.id) {
      const expectedFilename = `${data.id}.json`;
      if (filename !== expectedFilename) {
        fileErrors.push(`Filename mismatch: expected ${expectedFilename}, got ${filename}`);
      }

      if (!/^[a-z0-9_-]+$/.test(data.id)) {
        fileErrors.push(`Invalid ID format: ${data.id} (must be lowercase alphanumeric with - or _)`);
      }
    }

    // Validate category
    const validCategories = [
      'programmer', 'philosopher', 'scientist', 'religious', 'revolutionary',
      'writer', 'artist', 'musician', 'filmmaker', 'comedian', 'architect',
      'athlete', 'explorer', 'activist', 'tech_leader', 'leader', 'pioneer',
      'special', 'systems', 'master', 'language-creator', 'historian',
      'gaming', 'blockchain', 'media', 'poet', 'statesman', 'mathematician',
      'composer'
    ];

    if (data.category && !validCategories.includes(data.category)) {
      fileWarnings.push(`Unknown category: ${data.category}`);
    }

    // Validate OCEAN scores
    const oceanIssues = validateOcean(data.ocean, data.id);
    fileErrors.push(...oceanIssues);

    // Validate personality object
    if (data.personality) {
      if (!data.personality.summary) {
        fileWarnings.push(`Missing personality.summary`);
      }
      if (!data.personality.philosophy) {
        fileWarnings.push(`Missing personality.philosophy`);
      }
    }

    // Check for recommended fields
    if (!data.tags || data.tags.length === 0) {
      fileWarnings.push(`No tags defined`);
    }

    if (!data.quotes || data.quotes.length === 0) {
      fileWarnings.push(`No quotes defined`);
    }

    // For programmers, check technical info
    if ((data.category === 'programmer' || data.category === 'tech_leader') && !data.technical) {
      fileWarnings.push(`Programmer/tech_leader without technical info`);
    }

    // Check for duplicate fields or typos
    const knownFields = [
      '$schema', 'id', 'name', 'fullName', 'category', 'subcategory', 'tags',
      'metadata', 'ocean', 'personality', 'technical', 'quotes', 'behavioral'
    ];

    Object.keys(data).forEach(key => {
      if (!knownFields.includes(key)) {
        fileWarnings.push(`Unknown field: ${key}`);
      }
    });

  } catch (err) {
    fileErrors.push(`Error reading file: ${err.message}`);
  }

  return { errors: fileErrors, warnings: fileWarnings };
}

// Validate all files in a directory
function validateDirectory(dirPath, dirName) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

  console.log(`\n${colors.blue}Validating ${dirName}/${colors.reset} (${files.length} files)`);

  files.forEach(file => {
    totalFiles++;
    const filePath = path.join(dirPath, file);
    const result = validateFile(filePath);

    if (result.errors.length === 0 && result.warnings.length === 0) {
      validFiles++;
      process.stdout.write(colors.green + '.' + colors.reset);
    } else if (result.errors.length > 0) {
      process.stdout.write(colors.red + 'E' + colors.reset);
      errors.push({
        file: `${dirName}/${file}`,
        errors: result.errors
      });
      if (result.warnings.length > 0) {
        warnings.push({
          file: `${dirName}/${file}`,
          warnings: result.warnings
        });
      }
    } else {
      validFiles++;
      process.stdout.write(colors.yellow + 'W' + colors.reset);
      warnings.push({
        file: `${dirName}/${file}`,
        warnings: result.warnings
      });
    }
  });
}

// Check for duplicate IDs
function checkDuplicates() {
  console.log('\n\n' + colors.blue + 'Checking for duplicate IDs...' + colors.reset);

  const idMap = new Map();
  const duplicates = [];

  // Scan all directories
  const dirs = fs.readdirSync(PERSONAS_DIR)
    .filter(d => !['dist', 'index', 'schemas', 'scripts'].includes(d))
    .filter(d => fs.statSync(path.join(PERSONAS_DIR, d)).isDirectory());

  dirs.forEach(dir => {
    const dirPath = path.join(PERSONAS_DIR, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8'));
        const id = content.id;

        if (idMap.has(id)) {
          duplicates.push({
            id,
            files: [idMap.get(id), `${dir}/${file}`]
          });
        } else {
          idMap.set(id, `${dir}/${file}`);
        }
      } catch (err) {
        // Ignore parse errors (handled elsewhere)
      }
    });
  });

  if (duplicates.length > 0) {
    console.log(colors.red + '\n✗ Found duplicate IDs:' + colors.reset);
    duplicates.forEach(dup => {
      console.log(`  ID "${dup.id}" appears in:`);
      dup.files.forEach(f => console.log(`    - ${f}`));
    });
  } else {
    console.log(colors.green + '✓ No duplicate IDs found' + colors.reset);
  }

  return duplicates.length === 0;
}

// Main validation function
async function validate() {
  console.log(colors.blue + '=== Personality Validation ===' + colors.reset);

  // Check if schema exists
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(colors.red + 'Schema file not found at:' + colors.reset, SCHEMA_PATH);
    process.exit(1);
  }

  // Validate each directory
  const dirs = [
    'programmers', 'philosophers', 'scientists', 'religious',
    'revolutionaries', 'writers', 'artists', 'architects',
    'athletes', 'explorers', 'activists', 'leaders',
    'pioneers', 'special'
  ];

  dirs.forEach(dir => {
    validateDirectory(path.join(PERSONAS_DIR, dir), dir);
  });

  // Check for duplicates
  const noDuplicates = checkDuplicates();

  // Print results
  console.log('\n\n' + colors.blue + '=== Validation Results ===' + colors.reset);
  console.log(`Total files: ${totalFiles}`);
  console.log(`Valid files: ${colors.green}${validFiles}${colors.reset}`);
  console.log(`Files with errors: ${colors.red}${errors.length}${colors.reset}`);
  console.log(`Files with warnings: ${colors.yellow}${warnings.length}${colors.reset}`);

  // Print errors
  if (errors.length > 0) {
    console.log('\n' + colors.red + '=== Errors ===' + colors.reset);
    errors.forEach(err => {
      console.log(`\n${err.file}:`);
      err.errors.forEach(e => console.log(`  ✗ ${e}`));
    });
  }

  // Print warnings (optional)
  if (warnings.length > 0 && process.argv.includes('--warnings')) {
    console.log('\n' + colors.yellow + '=== Warnings ===' + colors.reset);
    warnings.forEach(warn => {
      console.log(`\n${warn.file}:`);
      warn.warnings.forEach(w => console.log(`  ⚠ ${w}`));
    });
  } else if (warnings.length > 0) {
    console.log(`\n${colors.yellow}Run with --warnings to see ${warnings.length} warnings${colors.reset}`);
  }

  // Exit with error if validation failed
  if (errors.length > 0 || !noDuplicates) {
    console.log('\n' + colors.red + '✗ Validation failed' + colors.reset);
    process.exit(1);
  } else {
    console.log('\n' + colors.green + '✓ All validations passed!' + colors.reset);
  }
}

// Run validation
if (require.main === module) {
  validate().catch(err => {
    console.error('Validation failed:', err);
    process.exit(1);
  });
}

module.exports = { validate, validateFile };