/// Unified personality loader for Hanzo ecosystem.
/// Loads personalities from the centralized JSON file.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Personality {
    pub name: String,
    pub programmer: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub philosophy: Option<String>,
    pub tools: Vec<String>,
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub environment: Option<HashMap<String, String>>,
}

pub struct PersonalityLoader {
    personalities: HashMap<String, Personality>,
}

impl PersonalityLoader {
    /// Create a new loader with the default JSON file
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        // Try to find the JSON file relative to this source file
        let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        path.push("personalities");
        path.push("all_personalities.json");

        Self::from_file(&path)
    }

    /// Create a loader from a specific file path
    pub fn from_file(path: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        let content = fs::read_to_string(path)?;
        let personalities_list: Vec<Personality> = serde_json::from_str(&content)?;

        let mut personalities = HashMap::new();
        for personality in personalities_list {
            personalities.insert(personality.name.clone(), personality);
        }

        Ok(Self { personalities })
    }

    /// Create a loader from embedded data (for compile-time inclusion)
    pub fn from_embedded() -> Self {
        // Include the JSON at compile time
        const PERSONALITY_DATA: &str = include_str!("all_personalities.json");
        let personalities_list: Vec<Personality> =
            serde_json::from_str(PERSONALITY_DATA).expect("Invalid embedded personality data");

        let mut personalities = HashMap::new();
        for personality in personalities_list {
            personalities.insert(personality.name.clone(), personality);
        }

        Self { personalities }
    }

    /// Get all personalities as a vector
    pub fn get_all(&self) -> Vec<&Personality> {
        self.personalities.values().collect()
    }

    /// Get a specific personality by name
    pub fn get(&self, name: &str) -> Option<&Personality> {
        self.personalities.get(name)
    }

    /// Filter personalities by tags
    pub fn filter_by_tags(&self, tags: &[String]) -> Vec<&Personality> {
        self.personalities
            .values()
            .filter(|p| tags.iter().any(|tag| p.tags.contains(tag)))
            .collect()
    }

    /// Get all personality names
    pub fn get_names(&self) -> Vec<String> {
        self.personalities.keys().cloned().collect()
    }

    /// Get total count of personalities
    pub fn count(&self) -> usize {
        self.personalities.len()
    }
}

impl Default for PersonalityLoader {
    fn default() -> Self {
        // Use embedded data as default for simplicity
        Self::from_embedded()
    }
}

// Convenience functions
pub fn load_personalities() -> PersonalityLoader {
    PersonalityLoader::from_embedded()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_personalities() {
        let loader = PersonalityLoader::from_embedded();
        assert_eq!(loader.count(), 117);

        // Test specific personalities exist
        assert!(loader.get("linus").is_some());
        assert!(loader.get("ada").is_some());
        assert!(loader.get("hanzo").is_some());
    }

    #[test]
    fn test_filter_by_tags() {
        let loader = PersonalityLoader::from_embedded();
        let pioneers = loader.filter_by_tags(&["pioneer".to_string()]);
        assert!(!pioneers.is_empty());
        assert!(pioneers.iter().any(|p| p.name == "ada"));
    }
}