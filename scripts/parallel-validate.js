#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROFILES_DIR = path.join(__dirname, '../profiles');
const NUM_WORKERS = os.cpus().length;

// Validation checks
const ValidationChecks = {
  // Structure checks
  hasRequiredFields: (data) => {
    const required = ['id', 'name', 'category', 'ocean'];
    const missing = required.filter(f => !data[f]);
    return missing.length === 0 ? null : `Missing fields: ${missing.join(', ')}`;
  },

  // OCEAN validation
  oceanScoresValid: (data) => {
    if (!data.ocean) return 'Missing OCEAN scores';

    const fields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const errors = [];

    fields.forEach(field => {
      const value = data.ocean[field];
      if (value === undefined) {
        errors.push(`Missing ${field}`);
      } else if (typeof value !== 'number') {
        errors.push(`${field} not a number`);
      } else if (value < 0 || value > 100) {
        errors.push(`${field}=${value} out of range [0-100]`);
      }
    });

    const total = fields.reduce((sum, f) => sum + (data.ocean[f] || 0), 0);
    if (total === 0) errors.push('All OCEAN scores are 0');
    if (total === 500) errors.push('All OCEAN scores are 100');

    return errors.length > 0 ? errors.join(', ') : null;
  },

  // ID format check
  idFormat: (data) => {
    if (!data.id) return 'Missing ID';
    if (!/^[a-z0-9_-]+$/.test(data.id)) {
      return `Invalid ID format: ${data.id} (must be lowercase alphanumeric with - or _)`;
    }
    return null;
  },

  // Category validation
  categoryValid: (data) => {
    const validCategories = [
      'philosopher', 'scientist', 'artist', 'musician', 'writer', 'poet',
      'programmer', 'architect', 'revolutionary', 'activist', 'religious',
      'explorer', 'filmmaker', 'comedian', 'athlete', 'tech_leader',
      'leader', 'statesman', 'mathematician', 'composer', 'historian',
      'pioneer', 'special'
    ];

    if (!data.category) return 'Missing category';
    if (!validCategories.includes(data.category)) {
      return `Invalid category: ${data.category}`;
    }
    return null;
  },

  // Enhanced fields for specific categories
  categorySpecificFields: (data) => {
    const warnings = [];

    if (data.category === 'programmer' || data.category === 'tech_leader') {
      if (!data.tools) warnings.push('Programmer without tools defined');
      if (!data.programmer) warnings.push('Missing programmer username');
    }

    if (data.category === 'scientist') {
      if (!data.contributions) warnings.push('Scientist without contributions');
      if (!data.philosophy) warnings.push('Scientist without philosophy');
    }

    if (data.category === 'philosopher') {
      if (!data.philosophy) warnings.push('Philosopher without philosophy');
    }

    return warnings.length > 0 ? warnings.join(', ') : null;
  },

  // Check for suspicious patterns
  detectAnomalies: (data) => {
    const anomalies = [];

    // Check for extreme OCEAN patterns
    if (data.ocean) {
      const values = Object.values(data.ocean);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;

      if (variance < 25) {
        anomalies.push('OCEAN scores too similar (low variance)');
      }

      // Check for contradictory scores
      if (data.ocean.extraversion > 80 && data.ocean.agreeableness < 20) {
        anomalies.push('High extraversion with very low agreeableness is unusual');
      }

      if (data.ocean.conscientiousness > 90 && data.ocean.openness < 10) {
        anomalies.push('Very high conscientiousness with very low openness is unusual');
      }
    }

    return anomalies.length > 0 ? anomalies.join(', ') : null;
  },

  // Filename consistency
  filenameMatch: (data, filename) => {
    const expectedFilename = `${data.id}.json`;
    if (filename !== expectedFilename) {
      return `Filename mismatch: expected ${expectedFilename}, got ${filename}`;
    }
    return null;
  }
};

// Worker function to validate a batch of files
function validateBatch(files) {
  const results = [];

  files.forEach(filename => {
    const filepath = path.join(PROFILES_DIR, filename);
    const errors = [];
    const warnings = [];

    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const data = JSON.parse(content);

      // Run all validation checks
      for (const [checkName, checkFn] of Object.entries(ValidationChecks)) {
        const result = checkName === 'filenameMatch'
          ? checkFn(data, filename)
          : checkFn(data);

        if (result) {
          if (checkName === 'categorySpecificFields' || checkName === 'detectAnomalies') {
            warnings.push(result);
          } else {
            errors.push(result);
          }
        }
      }

      results.push({
        file: filename,
        id: data.id,
        name: data.name,
        category: data.category,
        errors,
        warnings,
        valid: errors.length === 0
      });

    } catch (err) {
      results.push({
        file: filename,
        errors: [`Parse error: ${err.message}`],
        warnings: [],
        valid: false
      });
    }
  });

  return results;
}

// Main parallel validation
async function parallelValidate() {
  console.log('🔍 Running parallel validation on all personality profiles...\n');

  // Get all JSON files
  const files = fs.readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'categories.json');

  console.log(`📁 Found ${files.length} profiles to validate`);
  console.log(`🔧 Using ${NUM_WORKERS} parallel workers\n`);

  // Split files into batches
  const batchSize = Math.ceil(files.length / NUM_WORKERS);
  const batches = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }

  // Process batches in parallel
  const startTime = Date.now();
  const allResults = [];

  for (let i = 0; i < batches.length; i++) {
    const results = validateBatch(batches[i]);
    allResults.push(...results);
    process.stdout.write(`✓ Batch ${i + 1}/${batches.length} complete\n`);
  }

  const duration = Date.now() - startTime;

  // Analyze results
  const validFiles = allResults.filter(r => r.valid);
  const filesWithErrors = allResults.filter(r => !r.valid);
  const filesWithWarnings = allResults.filter(r => r.warnings.length > 0);

  // Group by category
  const byCategory = {};
  allResults.forEach(r => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { total: 0, valid: 0, errors: 0 };
    }
    byCategory[r.category].total++;
    if (r.valid) byCategory[r.category].valid++;
    else byCategory[r.category].errors++;
  });

  // Check for duplicate IDs
  const idCounts = {};
  allResults.forEach(r => {
    if (r.id) {
      idCounts[r.id] = (idCounts[r.id] || 0) + 1;
    }
  });
  const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION RESULTS');
  console.log('='.repeat(60));

  console.log(`\n⏱️  Completed in ${duration}ms`);
  console.log(`✅ Valid files: ${validFiles.length}/${files.length} (${(validFiles.length/files.length*100).toFixed(1)}%)`);
  console.log(`❌ Files with errors: ${filesWithErrors.length}`);
  console.log(`⚠️  Files with warnings: ${filesWithWarnings.length}`);

  if (duplicates.length > 0) {
    console.log(`\n🔴 DUPLICATE IDS FOUND:`);
    duplicates.forEach(([id, count]) => {
      console.log(`   - "${id}" appears ${count} times`);
    });
  }

  console.log(`\n📁 By Category:`);
  Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([cat, stats]) => {
      const pct = (stats.valid/stats.total*100).toFixed(0);
      const status = stats.errors === 0 ? '✅' : '⚠️';
      console.log(`   ${status} ${cat.padEnd(15)} ${stats.valid}/${stats.total} (${pct}%)`);
    });

  if (filesWithErrors.length > 0) {
    console.log(`\n❌ FILES WITH ERRORS:`);
    filesWithErrors.slice(0, 10).forEach(r => {
      console.log(`\n   ${r.file}:`);
      r.errors.forEach(err => console.log(`      - ${err}`));
    });
    if (filesWithErrors.length > 10) {
      console.log(`\n   ... and ${filesWithErrors.length - 10} more files with errors`);
    }
  }

  if (filesWithWarnings.length > 0 && process.argv.includes('--warnings')) {
    console.log(`\n⚠️  FILES WITH WARNINGS:`);
    filesWithWarnings.slice(0, 10).forEach(r => {
      console.log(`\n   ${r.file}:`);
      r.warnings.forEach(warn => console.log(`      - ${warn}`));
    });
  }

  // Write detailed report
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
    summary: {
      total: files.length,
      valid: validFiles.length,
      errors: filesWithErrors.length,
      warnings: filesWithWarnings.length,
      duplicates: duplicates.length
    },
    byCategory,
    errors: filesWithErrors.map(r => ({ file: r.file, errors: r.errors })),
    warnings: filesWithWarnings.map(r => ({ file: r.file, warnings: r.warnings })),
    duplicates
  };

  fs.writeFileSync(
    path.join(__dirname, '../validation-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📄 Detailed report saved to validation-report.json`);

  // Exit with error code if validation failed
  if (filesWithErrors.length > 0 || duplicates.length > 0) {
    console.log('\n❌ Validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All validations passed!');
  }
}

// Run validation
parallelValidate().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});

export { parallelValidate, ValidationChecks };