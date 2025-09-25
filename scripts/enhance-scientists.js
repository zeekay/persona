#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROFILES_DIR = path.join(__dirname, '../profiles');

// Enhanced scientist template with additional fields
const scientistEnhancements = {
  einstein: {
    description: "Revolutionary physicist who transformed our understanding of space, time, and energy",
    philosophy: "Imagination is more important than knowledge. The important thing is not to stop questioning.",
    tools: {
      essential: ["mathematics", "theoretical_physics", "thought_experiments"],
      preferred: ["relativity_theory", "quantum_mechanics"],
      domains: ["physics", "cosmology", "philosophy_of_science"]
    },
    contributions: ["Theory of Relativity", "E=mc²", "Photoelectric Effect", "Brownian Motion"],
    quotes: [
      "God does not play dice with the universe",
      "Try not to become a man of success, but rather try to become a man of value"
    ]
  },
  curie: {
    description: "Pioneer in radioactivity research and first woman to win a Nobel Prize",
    philosophy: "Nothing in life is to be feared, it is only to be understood.",
    tools: {
      essential: ["chemistry", "physics", "laboratory_experiments"],
      preferred: ["radioactivity_research", "element_isolation"],
      domains: ["radioactivity", "chemistry", "physics"]
    },
    contributions: ["Discovery of Polonium and Radium", "Radioactivity Research", "Mobile X-ray Units"],
    quotes: [
      "Be less curious about people and more curious about ideas",
      "Life is not easy for any of us, but what of that?"
    ]
  },
  darwin: {
    description: "Naturalist who revolutionized biology with the theory of evolution",
    philosophy: "It is not the strongest of the species that survives, but the most adaptable to change.",
    tools: {
      essential: ["observation", "specimen_collection", "comparative_analysis"],
      preferred: ["field_research", "taxonomy", "geology"],
      domains: ["biology", "evolution", "natural_history"]
    },
    contributions: ["Theory of Evolution", "Natural Selection", "The Origin of Species"],
    quotes: [
      "A man who dares to waste one hour of time has not discovered the value of life",
      "The love for all living creatures is the most noble attribute of man"
    ]
  },
  newton: {
    description: "Mathematical genius who laid the foundations of classical physics",
    philosophy: "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things.",
    tools: {
      essential: ["mathematics", "calculus", "optics"],
      preferred: ["mechanics", "astronomy", "alchemy"],
      domains: ["physics", "mathematics", "astronomy"]
    },
    contributions: ["Laws of Motion", "Universal Gravitation", "Calculus", "Optics"],
    quotes: [
      "If I have seen further, it is by standing on the shoulders of giants",
      "I can calculate the motion of heavenly bodies but not the madness of people"
    ]
  },
  galileo: {
    description: "Father of modern observational astronomy and experimental physics",
    philosophy: "Measure what is measurable, and make measurable what is not so.",
    tools: {
      essential: ["telescope", "mathematics", "experimental_method"],
      preferred: ["astronomy", "mechanics", "geometry"],
      domains: ["astronomy", "physics", "mathematics"]
    },
    contributions: ["Heliocentrism Support", "Telescope Improvements", "Laws of Motion", "Jupiter's Moons Discovery"],
    quotes: [
      "And yet it moves",
      "Mathematics is the language in which God has written the universe"
    ]
  },
  tesla: {
    description: "Visionary inventor who pioneered alternating current and wireless technology",
    philosophy: "The present is theirs; the future, for which I really worked, is mine.",
    tools: {
      essential: ["electrical_engineering", "electromagnetic_theory", "invention"],
      preferred: ["alternating_current", "wireless_transmission", "visualization"],
      domains: ["electrical_engineering", "physics", "invention"]
    },
    contributions: ["AC Motor", "Tesla Coil", "Wireless Technology", "Radio Control"],
    quotes: [
      "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration",
      "The scientists of today think deeply instead of clearly"
    ]
  },
  hawking: {
    description: "Theoretical physicist who advanced our understanding of black holes and cosmology",
    philosophy: "Intelligence is the ability to adapt to change.",
    tools: {
      essential: ["theoretical_physics", "mathematics", "cosmology"],
      preferred: ["black_hole_theory", "quantum_mechanics", "relativity"],
      domains: ["cosmology", "theoretical_physics", "astrophysics"]
    },
    contributions: ["Hawking Radiation", "Black Hole Thermodynamics", "A Brief History of Time"],
    quotes: [
      "The greatest enemy of knowledge is not ignorance, it is the illusion of knowledge",
      "We are just an advanced breed of monkeys on a minor planet"
    ]
  },
  feynman: {
    description: "Nobel Prize-winning physicist known for quantum mechanics and teaching excellence",
    philosophy: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.",
    tools: {
      essential: ["quantum_mechanics", "particle_physics", "feynman_diagrams"],
      preferred: ["teaching", "bongo_drums", "safe_cracking"],
      domains: ["quantum_physics", "particle_physics", "education"]
    },
    contributions: ["Quantum Electrodynamics", "Feynman Diagrams", "Path Integral Formulation"],
    quotes: [
      "I would rather have questions that can't be answered than answers that can't be questioned",
      "Nobody ever figures out what life is all about"
    ]
  },
  sagan: {
    description: "Astronomer and science communicator who brought the cosmos to millions",
    philosophy: "Somewhere, something incredible is waiting to be known.",
    tools: {
      essential: ["astronomy", "planetary_science", "science_communication"],
      preferred: ["exobiology", "seti", "writing"],
      domains: ["astronomy", "astrobiology", "science_communication"]
    },
    contributions: ["Cosmos TV Series", "Voyager Golden Record", "Planetary Science Research"],
    quotes: [
      "We are made of star stuff",
      "Extraordinary claims require extraordinary evidence"
    ]
  },
  turing: {
    description: "Father of computer science and artificial intelligence",
    philosophy: "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
    tools: {
      essential: ["mathematics", "logic", "computation_theory"],
      preferred: ["cryptanalysis", "machine_design", "algorithms"],
      domains: ["computer_science", "mathematics", "cryptography"]
    },
    contributions: ["Turing Machine", "Turing Test", "Enigma Code Breaking", "ACE Computer"],
    quotes: [
      "A computer would deserve to be called intelligent if it could deceive a human",
      "Sometimes it is the people no one expects anything from who do the things no one can imagine"
    ]
  }
};

// Get all scientist files
function getScientistFiles() {
  const files = fs.readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const content = JSON.parse(fs.readFileSync(path.join(PROFILES_DIR, f), 'utf8'));
      return { filename: f, data: content };
    })
    .filter(f => f.data.category === 'scientist');

  return files;
}

// Enhance scientist profiles
function enhanceScientists() {
  console.log('🔬 Enhancing scientist profiles...\n');

  const scientists = getScientistFiles();
  let enhancedCount = 0;
  let needsEnhancement = [];

  scientists.forEach(({ filename, data }) => {
    const id = data.id;
    const enhancement = scientistEnhancements[id];

    if (enhancement) {
      // Apply enhancements
      const enhancedData = {
        ...data,
        ...enhancement,
        ocean: data.ocean // Preserve existing OCEAN scores
      };

      // Write enhanced profile
      fs.writeFileSync(
        path.join(PROFILES_DIR, filename),
        JSON.stringify(enhancedData, null, 2)
      );

      console.log(`✅ Enhanced: ${data.name}`);
      enhancedCount++;
    } else if (!data.description || !data.philosophy || !data.tools) {
      needsEnhancement.push(data.name);
    }
  });

  console.log(`\n📊 Results:`);
  console.log(`   Enhanced: ${enhancedCount}`);
  console.log(`   Total scientists: ${scientists.length}`);

  if (needsEnhancement.length > 0) {
    console.log(`\n⚠️  Needs enhancement (${needsEnhancement.length}):`);
    needsEnhancement.forEach(name => console.log(`   - ${name}`));
  }
}

// Run enhancement
enhanceScientists();

export { enhanceScientists };