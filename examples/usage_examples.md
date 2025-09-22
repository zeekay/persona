# Hanzo Persona Usage Examples

## Python

```python
# Install: pip install -e /Users/z/work/hanzo/persona

from personalities import get_personality, filter_by_tags, get_all_personalities

# Get a specific personality
linus = get_personality("linus")
print(f"{linus['programmer']}: {linus['philosophy']}")
# Output: Linus Torvalds: Talk is cheap. Show me the code.

# Filter by tags
ai_experts = filter_by_tags(["ai"])
for expert in ai_experts:
    print(f"- {expert['programmer']}: {expert['description']}")

# Get all personalities
all_personas = get_all_personalities()
print(f"Total: {len(all_personas)} personalities")
```

## TypeScript/JavaScript

```typescript
// Install: npm install /Users/z/work/hanzo/persona

import { getPersonality, filterByTags, getAllPersonalities } from '@hanzo/persona';

// Get a specific personality
const linus = getPersonality('linus');
console.log(`${linus.programmer}: ${linus.philosophy}`);

// Filter by tags
const aiExperts = filterByTags(['ai']);
aiExperts.forEach(expert => {
  console.log(`- ${expert.programmer}: ${expert.description}`);
});

// Get all personalities
const allPersonas = getAllPersonalities();
console.log(`Total: ${allPersonas.length} personalities`);
```

## Rust

```rust
// Cargo.toml:
// [dependencies]
// hanzo-persona = { path = "/Users/z/work/hanzo/persona" }

use hanzo_persona::{PersonalityLoader, Personality};

fn main() {
    // Load personalities
    let loader = PersonalityLoader::from_embedded();

    // Get a specific personality
    if let Some(linus) = loader.get("linus") {
        println!("{}: {:?}", linus.programmer, linus.philosophy);
    }

    // Filter by tags
    let ai_experts = loader.filter_by_tags(&["ai".to_string()]);
    for expert in ai_experts {
        println!("- {}: {}", expert.programmer, expert.description);
    }

    // Get all personalities
    let all_personas = loader.get_all();
    println!("Total: {} personalities", all_personas.len());
}
```

## Using in Hanzo MCP

### Python SDK
```python
from hanzo_mcp.tools.common.personality import PersonalityTool

# The PersonalityTool now automatically loads from centralized data
tool = PersonalityTool()
tool.set_personality("linus")  # Switch to Linus Torvalds personality
```

### Rust MCP
```rust
use hanzo_mcp::tools::personality::api;

// Get and activate a personality
api::set_active("linus").unwrap();
let active = api::get_active().unwrap();
println!("Active: {}", active.programmer);
```

## Available Personalities (Sample)

### Pioneers
- `ada` - Ada Lovelace: First programmer
- `grace` - Grace Hopper: COBOL creator
- `turing` - Alan Turing: Computing foundations

### Language Creators
- `dennis` - Dennis Ritchie: C language
- `ken` - Ken Thompson: Unix creator
- `guido` - Guido van Rossum: Python BDFL
- `brendan` - Brendan Eich: JavaScript creator
- `bjarne` - Bjarne Stroustrup: C++ creator
- `graydon` - Graydon Hoare: Rust creator

### AI/ML Leaders
- `geoffrey` - Geoffrey Hinton: Deep learning pioneer
- `yann` - Yann LeCun: CNN inventor
- `ilya` - Ilya Sutskever: OpenAI co-founder
- `andrej` - Andrej Karpathy: Tesla AI

### Modern Innovators
- `linus` - Linus Torvalds: Linux & Git
- `hanzo` - Hanzo AI: Balanced productivity
- `vitalik` - Vitalik Buterin: Ethereum creator

See `/personalities/all_personalities.json` for the complete list of 117 personalities.