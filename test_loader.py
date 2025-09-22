#!/usr/bin/env python3
"""Test the personality loader across implementations."""

import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from personalities import (
    get_all_personalities,
    get_personality,
    list_personality_names,
    count_personalities,
)

def test_python_loader():
    """Test Python personality loader."""
    print("Testing Python Personality Loader")
    print("=" * 50)

    # Test count
    total = count_personalities()
    print(f"Total personalities loaded: {total}")
    assert total == 117, f"Expected 117 personalities, got {total}"

    # Test getting all names
    names = list_personality_names()
    print(f"First 10 names: {', '.join(names[:10])}")

    # Test specific personalities
    test_names = ["linus", "ada", "hanzo", "guido", "dennis", "ken"]
    for name in test_names:
        persona = get_personality(name)
        if persona:
            print(f"✓ {name}: {persona['programmer']} - {persona['description'][:50]}...")
        else:
            print(f"✗ {name}: NOT FOUND")

    # Test that all have required fields
    all_personas = get_all_personalities()
    for p in all_personas:
        assert 'name' in p, f"Missing 'name' in {p}"
        assert 'programmer' in p, f"Missing 'programmer' in {p['name']}"
        assert 'description' in p, f"Missing 'description' in {p['name']}"
        assert 'tools' in p, f"Missing 'tools' in {p['name']}"
        assert isinstance(p['tools'], list), f"'tools' not a list in {p['name']}"

    print(f"\n✅ All {total} personalities have required fields")
    print("\nPython loader test PASSED!")

if __name__ == "__main__":
    test_python_loader()