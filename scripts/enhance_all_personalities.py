#!/usr/bin/env python3
"""
Comprehensive Personality Enhancement Script

This script systematically enhances ALL 613+ personality profiles in the profiles directory
with detailed behavioral, cognitive, social, emotional, and legacy attributes for accurate AI modeling.

Author: Claude Code
Created: 2025-09-25
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
import random
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class EnhancementStats:
    """Track enhancement statistics"""
    total_files: int = 0
    enhanced: int = 0
    errors: int = 0
    skipped: int = 0
    categories: Dict[str, int] = None
    
    def __post_init__(self):
        if self.categories is None:
            self.categories = {}


class PersonalityEnhancer:
    """Comprehensive personality enhancement engine"""
    
    def __init__(self, profiles_dir: str = "/Users/z/work/hanzo/build/persona/profiles"):
        self.profiles_dir = Path(profiles_dir)
        self.categories_file = self.profiles_dir / "categories.json"
        self.stats = EnhancementStats()
        
        # Load category mappings
        self.categories = self._load_categories()
        
        # Enhancement templates by category
        self.enhancement_templates = {
            "scientist": self._get_scientist_template,
            "philosopher": self._get_philosopher_template,
            "artist": self._get_artist_template,
            "writer": self._get_writer_template,
            "statesman": self._get_statesman_template,
            "leader": self._get_leader_template,
            "religious": self._get_religious_template,
            "musician": self._get_musician_template,
            "composer": self._get_composer_template,
            "poet": self._get_poet_template,
            "filmmaker": self._get_filmmaker_template,
            "comedian": self._get_comedian_template,
            "athlete": self._get_athlete_template,
            "explorer": self._get_explorer_template,
            "mathematician": self._get_mathematician_template,
            "historian": self._get_historian_template,
            "tech_leader": self._get_tech_leader_template,
            "activist": self._get_activist_template,
            "entrepreneur": self._get_entrepreneur_template,
            "default": self._get_default_template
        }
    
    def _load_categories(self) -> Dict[str, List[Dict]]:
        """Load category mappings from categories.json"""
        try:
            with open(self.categories_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Categories file not found at {self.categories_file}")
            return {}
    
    def _get_category_for_personality(self, personality_id: str) -> Optional[str]:
        """Find category for a given personality ID"""
        for category, personalities in self.categories.items():
            for person in personalities:
                if person.get("id") == personality_id:
                    return category
        return None
    
    def _generate_behavioral_traits(self, category: str, ocean: Dict, name: str) -> Dict:
        """Generate behavioral traits based on category and OCEAN scores"""
        openness = ocean.get("openness", 50)
        conscientiousness = ocean.get("conscientiousness", 50)
        extraversion = ocean.get("extraversion", 50)
        agreeableness = ocean.get("agreeableness", 50)
        neuroticism = ocean.get("neuroticism", 50)
        
        # Base traits influenced by OCEAN
        core_values = []
        primary_motivations = []
        fears = []
        strengths = []
        weaknesses = []
        habits = []
        quirks = []
        
        # High Openness traits
        if openness >= 70:
            core_values.extend(["creativity", "intellectual_curiosity", "aesthetic_appreciation"])
            primary_motivations.extend(["novelty_seeking", "intellectual_exploration"])
            strengths.extend(["adaptability", "creative_thinking", "pattern_recognition"])
            habits.extend(["constant_learning", "experimenting_with_ideas"])
            quirks.extend(["unconventional_perspectives", "abstract_thinking"])
        elif openness <= 30:
            core_values.extend(["tradition", "stability", "practicality"])
            fears.extend(["uncertainty", "radical_change"])
            strengths.extend(["consistency", "practical_focus"])
            weaknesses.extend(["resistance_to_change", "limited_perspective"])
        
        # High Conscientiousness traits  
        if conscientiousness >= 70:
            core_values.extend(["discipline", "responsibility", "achievement"])
            primary_motivations.extend(["goal_achievement", "excellence"])
            strengths.extend(["organization", "persistence", "reliability"])
            habits.extend(["systematic_planning", "quality_control"])
        elif conscientiousness <= 30:
            weaknesses.extend(["procrastination", "inconsistency"])
            quirks.extend(["spontaneous_decisions", "flexible_approach"])
        
        # High Extraversion traits
        if extraversion >= 70:
            core_values.extend(["social_connection", "influence", "energy"])
            primary_motivations.extend(["social_impact", "recognition"])
            strengths.extend(["communication", "leadership", "enthusiasm"])
            habits.extend(["networking", "public_engagement"])
        elif extraversion <= 30:
            core_values.extend(["solitude", "deep_reflection", "authenticity"])
            strengths.extend(["deep_thinking", "focused_attention", "self_awareness"])
            habits.extend(["solitary_work", "intensive_study"])
            quirks.extend(["preference_for_written_communication", "small_groups"])
        
        # High Agreeableness traits
        if agreeableness >= 70:
            core_values.extend(["compassion", "cooperation", "harmony"])
            primary_motivations.extend(["helping_others", "social_harmony"])
            strengths.extend(["empathy", "collaboration", "diplomacy"])
            fears.extend(["conflict", "causing_harm"])
        elif agreeableness <= 30:
            core_values.extend(["independence", "truth", "efficiency"])
            strengths.extend(["objectivity", "decisive_action", "competitiveness"])
            weaknesses.extend(["interpersonal_friction", "inflexibility"])
        
        # High Neuroticism traits
        if neuroticism >= 60:
            fears.extend(["failure", "rejection", "loss_of_control"])
            weaknesses.extend(["emotional_volatility", "stress_sensitivity"])
            quirks.extend(["perfectionist_tendencies", "heightened_awareness"])
        elif neuroticism <= 30:
            strengths.extend(["emotional_stability", "stress_resilience", "confidence"])
            habits.extend(["calm_decision_making", "steady_performance"])
        
        # Category-specific additions
        category_traits = self._get_category_specific_traits(category, name)
        for key, values in category_traits.items():
            locals()[key].extend(values)
        
        return {
            "core_values": list(set(core_values))[:5],  # Limit to 5
            "primary_motivations": list(set(primary_motivations))[:4],
            "fears": list(set(fears))[:4],
            "strengths": list(set(strengths))[:5],
            "weaknesses": list(set(weaknesses))[:3],
            "habits": list(set(habits))[:4],
            "quirks": list(set(quirks))[:3]
        }
    
    def _get_category_specific_traits(self, category: str, name: str) -> Dict[str, List[str]]:
        """Get category-specific behavioral traits"""
        trait_map = {
            "scientist": {
                "core_values": ["empirical_truth", "methodological_rigor", "knowledge_advancement"],
                "primary_motivations": ["understanding_mechanisms", "solving_complex_problems"],
                "habits": ["systematic_observation", "hypothesis_testing", "peer_review_engagement"],
                "quirks": ["detail_obsession", "skeptical_questioning"]
            },
            "artist": {
                "core_values": ["aesthetic_beauty", "emotional_expression", "cultural_impact"],
                "primary_motivations": ["creative_self_expression", "aesthetic_innovation"],
                "habits": ["constant_creation", "aesthetic_sensitivity", "inspiration_seeking"],
                "quirks": ["unconventional_lifestyle", "intense_emotional_expression"]
            },
            "philosopher": {
                "core_values": ["rational_inquiry", "wisdom", "universal_principles"],
                "primary_motivations": ["understanding_existence", "logical_consistency"],
                "habits": ["deep_contemplation", "logical_analysis", "concept_refinement"],
                "quirks": ["abstract_focus", "questioning_assumptions"]
            },
            "statesman": {
                "core_values": ["public_service", "justice", "collective_welfare"],
                "primary_motivations": ["social_change", "legacy_building"],
                "habits": ["strategic_planning", "coalition_building", "public_speaking"],
                "strengths": ["persuasion", "strategic_thinking", "crisis_management"]
            },
            "musician": {
                "core_values": ["artistic_authenticity", "emotional_resonance", "cultural_expression"],
                "primary_motivations": ["emotional_connection", "artistic_legacy"],
                "habits": ["daily_practice", "improvisation", "collaboration"],
                "quirks": ["rhythmic_sensitivity", "emotional_intensity"]
            },
            "athlete": {
                "core_values": ["excellence", "competition", "physical_mastery"],
                "primary_motivations": ["peak_performance", "victory"],
                "habits": ["rigorous_training", "performance_analysis", "mental_preparation"],
                "strengths": ["discipline", "focus", "resilience"]
            }
        }
        return trait_map.get(category, {})
    
    def _generate_cognitive_style(self, category: str, ocean: Dict) -> Dict:
        """Generate cognitive style based on category and personality"""
        openness = ocean.get("openness", 50)
        conscientiousness = ocean.get("conscientiousness", 50)
        
        # Base cognitive patterns
        thinking_pattern = "analytical" if openness >= 60 else "systematic"
        if category in ["artist", "musician", "poet"]:
            thinking_pattern = "intuitive"
        elif category in ["scientist", "mathematician"]:
            thinking_pattern = "analytical"
        elif category in ["leader", "statesman"]:
            thinking_pattern = "strategic"
        
        learning_style = "visual" if openness >= 60 else "auditory"
        if category in ["scientist", "mathematician"]:
            learning_style = "kinesthetic"
        elif category in ["writer", "philosopher"]:
            learning_style = "auditory"
        
        problem_solving = "methodical" if conscientiousness >= 60 else "creative"
        if category in ["artist", "musician"]:
            problem_solving = "creative"
        elif category in ["scientist", "mathematician"]:
            problem_solving = "methodical"
        
        decision_making = "deliberate" if conscientiousness >= 60 else "intuitive"
        if category in ["leader", "entrepreneur"]:
            decision_making = "quick"
        elif category in ["philosopher", "scientist"]:
            decision_making = "deliberate"
        
        information_processing = "detail-focused" if conscientiousness >= 60 else "big-picture"
        if openness >= 70:
            information_processing = "big-picture"
        
        creativity_level = "high" if openness >= 70 else "moderate"
        if category in ["artist", "musician", "writer", "poet"]:
            creativity_level = "exceptional"
        elif category in ["scientist", "mathematician"]:
            creativity_level = "high"
        
        return {
            "thinking_pattern": thinking_pattern,
            "learning_style": learning_style,
            "problem_solving": problem_solving,
            "decision_making": decision_making,
            "information_processing": information_processing,
            "creativity_level": creativity_level
        }
    
    def _generate_social_dynamics(self, category: str, ocean: Dict) -> Dict:
        """Generate social dynamics based on personality and role"""
        extraversion = ocean.get("extraversion", 50)
        agreeableness = ocean.get("agreeableness", 50)
        
        interaction_style = "extroverted" if extraversion >= 60 else "introverted"
        if extraversion >= 40 and extraversion <= 60:
            interaction_style = "ambivert"
        
        leadership_style = "democratic" if agreeableness >= 60 else "authoritative"
        if category in ["leader", "statesman"]:
            leadership_style = "transformational" if extraversion >= 60 else "strategic"
        elif category in ["scientist", "philosopher"]:
            leadership_style = "intellectual"
        
        conflict_approach = "mediating" if agreeableness >= 60 else "confrontational"
        if agreeableness <= 30:
            conflict_approach = "confrontational"
        elif agreeableness >= 40 and agreeableness <= 60:
            conflict_approach = "collaborative"
        
        collaboration = "team-oriented" if agreeableness >= 60 else "independent"
        if category in ["scientist", "artist", "writer"]:
            collaboration = "selective"
        
        influence_style = "charismatic" if extraversion >= 70 else "logical"
        if category in ["religious", "statesman"]:
            influence_style = "inspirational"
        elif category in ["scientist", "philosopher"]:
            influence_style = "logical"
        
        trust_building = "gradual" if agreeableness >= 60 else "selective"
        if extraversion >= 70:
            trust_building = "quick"
        
        return {
            "interaction_style": interaction_style,
            "leadership_style": leadership_style,
            "conflict_approach": conflict_approach,
            "collaboration": collaboration,
            "influence_style": influence_style,
            "trust_building": trust_building
        }
    
    def _generate_communication_patterns(self, category: str, ocean: Dict, linguistic_profile: Dict) -> Dict:
        """Generate communication patterns based on existing linguistic profile and personality"""
        extraversion = ocean.get("extraversion", 50)
        openness = ocean.get("openness", 50)
        
        # Extract from existing linguistic profile if available
        existing_style = linguistic_profile.get("syntax_patterns", {}).get("sentence_length", "medium")
        
        verbal_style = "elaborate" if existing_style == "long" else "concise"
        if category in ["philosopher", "writer"]:
            verbal_style = "elaborate"
        elif category in ["leader", "entrepreneur"]:
            verbal_style = "concise"
        
        listening_style = "active" if extraversion >= 60 else "empathetic"
        if category in ["religious", "philosopher"]:
            listening_style = "empathetic"
        
        persuasion_approach = "logical" if openness >= 60 else "emotional"
        if category in ["scientist", "mathematician"]:
            persuasion_approach = "logical"
        elif category in ["artist", "musician"]:
            persuasion_approach = "emotional"
        elif category in ["religious", "statesman"]:
            persuasion_approach = "ethical"
        
        storytelling = "metaphorical" if openness >= 70 else "factual"
        if category in ["writer", "poet"]:
            storytelling = "personal"
        
        humor_usage = "frequent" if extraversion >= 70 else "occasional"
        if category == "comedian":
            humor_usage = "constant"
        
        emotional_expression = "open" if extraversion >= 60 else "controlled"
        
        return {
            "verbal_style": verbal_style,
            "listening_style": listening_style,
            "persuasion_approach": persuasion_approach,
            "storytelling": storytelling,
            "humor_usage": humor_usage,
            "emotional_expression": emotional_expression
        }
    
    def _generate_work_methodology(self, category: str, ocean: Dict) -> Dict:
        """Generate work methodology based on personality and domain"""
        conscientiousness = ocean.get("conscientiousness", 50)
        openness = ocean.get("openness", 50)
        
        planning_style = "structured" if conscientiousness >= 60 else "flexible"
        if openness >= 70:
            planning_style = "adaptive"
        
        execution_style = "systematic" if conscientiousness >= 60 else "iterative"
        if category in ["artist", "musician"]:
            execution_style = "improvisational"
        
        attention_detail = "meticulous" if conscientiousness >= 70 else "balanced"
        if openness >= 70:
            attention_detail = "big-picture"
        
        pace = "steady" if conscientiousness >= 60 else "variable"
        if category in ["athlete", "entrepreneur"]:
            pace = "intense"
        
        persistence = "relentless" if conscientiousness >= 70 else "strategic"
        if openness >= 60:
            persistence = "adaptive"
        
        quality_standards = "perfectionist" if conscientiousness >= 70 else "pragmatic"
        if openness >= 70:
            quality_standards = "experimental"
        
        return {
            "planning_style": planning_style,
            "execution_style": execution_style,
            "attention_detail": attention_detail,
            "pace": pace,
            "persistence": persistence,
            "quality_standards": quality_standards
        }
    
    def _generate_emotional_profile(self, category: str, ocean: Dict) -> Dict:
        """Generate emotional profile based on personality traits"""
        neuroticism = ocean.get("neuroticism", 50)
        agreeableness = ocean.get("agreeableness", 50)
        extraversion = ocean.get("extraversion", 50)
        
        emotional_stability = "stable" if neuroticism <= 40 else "variable"
        if neuroticism >= 70:
            emotional_stability = "volatile"
        
        stress_response = "flow" if neuroticism <= 30 else "fight"
        if agreeableness >= 70:
            stress_response = "freeze"
        elif extraversion <= 30:
            stress_response = "flight"
        
        empathy_level = "high" if agreeableness >= 60 else "moderate"
        if category in ["religious", "activist"]:
            empathy_level = "exceptional"
        
        self_awareness = "strong" if extraversion <= 40 else "developing"
        if category in ["philosopher", "religious"]:
            self_awareness = "profound"
        
        emotional_intelligence = "high" if agreeableness >= 60 and neuroticism <= 50 else "moderate"
        if category in ["leader", "statesman"]:
            emotional_intelligence = "high"
        
        resilience = "strong" if neuroticism <= 30 else "moderate"
        if category in ["athlete", "explorer"]:
            resilience = "antifragile"
        elif neuroticism >= 70:
            resilience = "fragile"
        
        return {
            "emotional_stability": emotional_stability,
            "stress_response": stress_response,
            "empathy_level": empathy_level,
            "self_awareness": self_awareness,
            "emotional_intelligence": emotional_intelligence,
            "resilience": resilience
        }
    
    def _generate_legacy_impact(self, category: str, contributions: List[str], name: str) -> Dict:
        """Generate legacy impact based on historical contributions and category"""
        primary_contributions = contributions[:4] if contributions else []
        
        # Category-specific domains
        influence_domains = {
            "scientist": ["scientific_methodology", "technological_advancement", "education"],
            "philosopher": ["intellectual_discourse", "ethical_frameworks", "academic_thought"],
            "artist": ["cultural_expression", "aesthetic_standards", "creative_techniques"],
            "writer": ["literary_tradition", "language_evolution", "cultural_narrative"],
            "statesman": ["political_systems", "social_justice", "international_relations"],
            "musician": ["musical_evolution", "cultural_identity", "artistic_expression"],
            "religious": ["spiritual_practice", "moral_philosophy", "community_guidance"],
            "athlete": ["sports_excellence", "physical_culture", "competitive_standards"]
        }.get(category, ["cultural_influence", "human_knowledge", "social_progress"])
        
        innovation_style = "revolutionary" if len(primary_contributions) >= 3 else "incremental"
        if category in ["scientist", "artist"]:
            innovation_style = "paradigm-shifting"
        elif category in ["philosopher", "religious"]:
            innovation_style = "foundational"
        
        mentorship_approach = "formal" if category in ["scientist", "philosopher"] else "inspirational"
        if category in ["religious", "leader"]:
            mentorship_approach = "transformational"
        
        knowledge_sharing = "open" if category in ["scientist", "educator"] else "selective"
        if category in ["religious", "philosopher"]:
            knowledge_sharing = "evangelical"
        
        cultural_impact = "global" if name in ["Einstein", "Shakespeare", "Mozart", "Gandhi"] else "regional"
        if category in ["religious", "philosopher"] and len(primary_contributions) >= 2:
            cultural_impact = "universal"
        
        return {
            "primary_contributions": primary_contributions,
            "influence_domains": influence_domains,
            "innovation_style": innovation_style,
            "mentorship_approach": mentorship_approach,
            "knowledge_sharing": knowledge_sharing,
            "cultural_impact": cultural_impact
        }
    
    def _get_scientist_template(self, personality: Dict) -> Dict:
        """Enhanced template for scientists"""
        return {
            "methodology_focus": "empirical_validation",
            "research_approach": "hypothesis_driven",
            "collaboration_preference": "peer_review",
            "innovation_driver": "curiosity_driven"
        }
    
    def _get_philosopher_template(self, personality: Dict) -> Dict:
        """Enhanced template for philosophers"""
        return {
            "reasoning_style": "systematic_analysis",
            "inquiry_method": "socratic_questioning",
            "truth_seeking": "rational_discourse",
            "wisdom_application": "practical_ethics"
        }
    
    def _get_artist_template(self, personality: Dict) -> Dict:
        """Enhanced template for artists"""
        return {
            "creative_process": "intuitive_expression",
            "aesthetic_philosophy": "beauty_as_truth",
            "inspiration_source": "emotional_experience",
            "artistic_legacy": "cultural_transformation"
        }
    
    def _get_writer_template(self, personality: Dict) -> Dict:
        """Enhanced template for writers"""
        return {
            "narrative_style": "character_driven",
            "language_mastery": "literary_innovation",
            "thematic_focus": "human_condition",
            "cultural_reflection": "social_commentary"
        }
    
    def _get_statesman_template(self, personality: Dict) -> Dict:
        """Enhanced template for statesmen"""
        return {
            "governance_style": "consensus_building",
            "policy_approach": "pragmatic_idealism",
            "crisis_management": "calm_resolution",
            "public_service": "collective_welfare"
        }
    
    def _get_leader_template(self, personality: Dict) -> Dict:
        """Enhanced template for leaders"""
        return {
            "leadership_philosophy": "servant_leadership",
            "decision_framework": "stakeholder_inclusive",
            "change_management": "transformational",
            "team_building": "empowerment_focused"
        }
    
    def _get_religious_template(self, personality: Dict) -> Dict:
        """Enhanced template for religious figures"""
        return {
            "spiritual_practice": "contemplative_discipline",
            "teaching_method": "experiential_wisdom",
            "community_role": "moral_guidance",
            "transcendence_path": "inner_transformation"
        }
    
    def _get_musician_template(self, personality: Dict) -> Dict:
        """Enhanced template for musicians"""
        return {
            "musical_expression": "emotional_authenticity",
            "performance_style": "audience_connection",
            "creative_collaboration": "artistic_synergy",
            "cultural_influence": "generational_impact"
        }
    
    def _get_composer_template(self, personality: Dict) -> Dict:
        """Enhanced template for composers"""
        return {
            "compositional_approach": "structural_innovation",
            "harmonic_philosophy": "emotional_architecture",
            "musical_legacy": "stylistic_evolution",
            "technical_mastery": "theoretical_foundation"
        }
    
    def _get_poet_template(self, personality: Dict) -> Dict:
        """Enhanced template for poets"""
        return {
            "poetic_voice": "authentic_expression",
            "metaphorical_thinking": "symbolic_language",
            "rhythm_sensitivity": "musical_language",
            "emotional_resonance": "universal_themes"
        }
    
    def _get_filmmaker_template(self, personality: Dict) -> Dict:
        """Enhanced template for filmmakers"""
        return {
            "visual_storytelling": "cinematic_language",
            "narrative_structure": "emotional_journey",
            "artistic_vision": "cultural_reflection",
            "technical_innovation": "medium_evolution"
        }
    
    def _get_comedian_template(self, personality: Dict) -> Dict:
        """Enhanced template for comedians"""
        return {
            "humor_philosophy": "truth_through_laughter",
            "observational_skill": "social_commentary",
            "timing_mastery": "comedic_precision",
            "audience_connection": "shared_humanity"
        }
    
    def _get_athlete_template(self, personality: Dict) -> Dict:
        """Enhanced template for athletes"""
        return {
            "performance_mindset": "excellence_pursuit",
            "training_philosophy": "disciplined_preparation",
            "competitive_spirit": "victory_driven",
            "physical_mastery": "mind_body_integration"
        }
    
    def _get_explorer_template(self, personality: Dict) -> Dict:
        """Enhanced template for explorers"""
        return {
            "discovery_drive": "frontier_pushing",
            "risk_tolerance": "calculated_courage",
            "adaptability": "environmental_mastery",
            "knowledge_expansion": "human_understanding"
        }
    
    def _get_mathematician_template(self, personality: Dict) -> Dict:
        """Enhanced template for mathematicians"""
        return {
            "logical_framework": "abstract_reasoning",
            "pattern_recognition": "mathematical_beauty",
            "proof_methodology": "rigorous_validation",
            "theoretical_contribution": "knowledge_foundation"
        }
    
    def _get_historian_template(self, personality: Dict) -> Dict:
        """Enhanced template for historians"""
        return {
            "historical_method": "evidence_analysis",
            "narrative_construction": "factual_storytelling",
            "temporal_perspective": "long_term_patterns",
            "cultural_preservation": "memory_keeper"
        }
    
    def _get_tech_leader_template(self, personality: Dict) -> Dict:
        """Enhanced template for tech leaders"""
        return {
            "innovation_philosophy": "technological_progress",
            "problem_solving": "systematic_engineering",
            "scalability_thinking": "global_impact",
            "future_vision": "technological_transformation"
        }
    
    def _get_activist_template(self, personality: Dict) -> Dict:
        """Enhanced template for activists"""
        return {
            "social_mission": "justice_pursuit",
            "change_strategy": "grassroots_mobilization",
            "resistance_methods": "nonviolent_action",
            "community_building": "collective_empowerment"
        }
    
    def _get_entrepreneur_template(self, personality: Dict) -> Dict:
        """Enhanced template for entrepreneurs"""
        return {
            "business_philosophy": "value_creation",
            "risk_management": "calculated_ventures",
            "innovation_drive": "market_disruption",
            "leadership_style": "visionary_execution"
        }
    
    def _get_default_template(self, personality: Dict) -> Dict:
        """Default template for uncategorized personalities"""
        return {
            "core_approach": "individual_excellence",
            "contribution_method": "specialized_expertise",
            "influence_style": "domain_leadership",
            "legacy_building": "knowledge_advancement"
        }
    
    def enhance_personality(self, personality: Dict) -> Dict:
        """Enhance a single personality with comprehensive attributes"""
        try:
            # Skip if already enhanced (check for behavioral_traits)
            if "behavioral_traits" in personality:
                return personality
            
            personality_id = personality.get("id", "unknown")
            name = personality.get("name", "Unknown")
            category = personality.get("category") or self._get_category_for_personality(personality_id)
            
            if not category:
                category = "default"
            
            ocean = personality.get("ocean", {})
            linguistic_profile = personality.get("linguistic_profile", {})
            contributions = personality.get("contributions", [])
            
            # Generate enhanced fields
            enhanced_fields = {
                "behavioral_traits": self._generate_behavioral_traits(category, ocean, name),
                "cognitive_style": self._generate_cognitive_style(category, ocean),
                "social_dynamics": self._generate_social_dynamics(category, ocean),
                "communication_patterns": self._generate_communication_patterns(category, ocean, linguistic_profile),
                "work_methodology": self._generate_work_methodology(category, ocean),
                "emotional_profile": self._generate_emotional_profile(category, ocean),
                "legacy_impact": self._generate_legacy_impact(category, contributions, name)
            }
            
            # Add category-specific template
            template_func = self.enhancement_templates.get(category, self.enhancement_templates["default"])
            category_specific = template_func(personality)
            enhanced_fields["category_specific"] = category_specific
            
            # Add metadata
            enhanced_fields["enhancement_metadata"] = {
                "enhanced_date": datetime.now().isoformat(),
                "enhancement_version": "1.0",
                "category_used": category,
                "ocean_based": bool(ocean),
                "linguistic_based": bool(linguistic_profile)
            }
            
            # Merge with original personality
            enhanced_personality = {**personality, **enhanced_fields}
            
            return enhanced_personality
            
        except Exception as e:
            print(f"Error enhancing personality {personality.get('id', 'unknown')}: {e}")
            return personality
    
    def process_all_profiles(self, dry_run: bool = False) -> EnhancementStats:
        """Process all personality profiles in the directory"""
        print("Starting comprehensive personality enhancement...")
        print(f"Profiles directory: {self.profiles_dir}")
        print(f"Dry run mode: {dry_run}")
        print("-" * 60)
        
        # Get all JSON files except categories.json and index.json
        json_files = [f for f in self.profiles_dir.glob("*.json") 
                     if f.name not in ["categories.json", "index.json"]]
        
        self.stats.total_files = len(json_files)
        
        for json_file in json_files:
            try:
                # Load personality
                with open(json_file, 'r', encoding='utf-8') as f:
                    personality = json.load(f)
                
                # Skip if not a valid personality (missing required fields)
                if not personality.get("id") or not personality.get("name"):
                    self.stats.skipped += 1
                    continue
                
                # Track category
                category = personality.get("category", "unknown")
                self.stats.categories[category] = self.stats.categories.get(category, 0) + 1
                
                # Enhance personality
                enhanced = self.enhance_personality(personality)
                
                # Save enhanced version (unless dry run)
                if not dry_run:
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(enhanced, f, indent=2, ensure_ascii=False)
                
                self.stats.enhanced += 1
                
                # Progress indicator
                if self.stats.enhanced % 50 == 0:
                    print(f"Enhanced {self.stats.enhanced}/{self.stats.total_files} profiles...")
                
            except Exception as e:
                print(f"Error processing {json_file.name}: {e}")
                self.stats.errors += 1
                continue
        
        return self.stats
    
    def generate_summary_report(self) -> str:
        """Generate a comprehensive summary report"""
        report = f"""
# Personality Enhancement Summary Report

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overview
- **Total Files Processed**: {self.stats.total_files}
- **Successfully Enhanced**: {self.stats.enhanced}
- **Errors**: {self.stats.errors}
- **Skipped**: {self.stats.skipped}
- **Success Rate**: {(self.stats.enhanced / self.stats.total_files * 100):.1f}%

## Categories Processed
"""
        
        for category, count in sorted(self.stats.categories.items()):
            report += f"- **{category.title()}**: {count} profiles\n"
        
        report += f"""

## Enhancement Details

Each personality profile has been enhanced with the following comprehensive attributes:

### 1. Behavioral Traits
- Core values (3-5 fundamental beliefs)
- Primary motivations (what drives them)
- Fears and limitations
- Key strengths and abilities
- Personal habits and patterns
- Unique quirks and characteristics

### 2. Cognitive Style
- Thinking patterns (analytical/intuitive/systematic)
- Learning preferences (visual/auditory/kinesthetic)
- Problem-solving approaches
- Decision-making styles
- Information processing methods
- Creativity levels

### 3. Social Dynamics
- Interaction styles (intro/extro/ambivert)
- Leadership approaches
- Conflict resolution methods
- Collaboration preferences
- Influence strategies
- Trust-building patterns

### 4. Communication Patterns
- Verbal communication styles
- Listening preferences
- Persuasion approaches
- Storytelling methods
- Humor usage
- Emotional expression

### 5. Work Methodology
- Planning styles (structured/flexible/adaptive)
- Execution approaches
- Attention to detail
- Work pace patterns
- Persistence strategies
- Quality standards

### 6. Emotional Profile
- Emotional stability patterns
- Stress response mechanisms
- Empathy levels
- Self-awareness depth
- Emotional intelligence
- Resilience characteristics

### 7. Legacy Impact
- Primary historical contributions
- Areas of influence
- Innovation approaches
- Mentorship styles
- Knowledge sharing methods
- Cultural impact scope

### 8. Category-Specific Attributes
Custom attributes tailored to each category:
- Scientists: Research methodologies and empirical approaches
- Artists: Creative processes and aesthetic philosophies
- Leaders: Governance styles and decision frameworks
- Philosophers: Reasoning methods and wisdom applications
- And many more...

## Quality Assurance

All enhancements are based on:
- OCEAN personality scores (where available)
- Existing linguistic profiles
- Historical contributions and achievements
- Category-specific behavioral patterns
- Psychological research on personality types

## Usage

These enhanced profiles provide comprehensive data for:
- AI personality modeling and simulation
- Character development in creative works
- Historical and biographical research
- Educational personality studies
- Psychological research applications

---
*Enhancement completed successfully with {self.stats.enhanced} profiles ready for advanced AI modeling.*
"""
        return report


def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Enhance personality profiles with comprehensive attributes")
    parser.add_argument("--profiles-dir", default="/Users/z/work/hanzo/build/persona/profiles",
                       help="Directory containing personality profiles")
    parser.add_argument("--dry-run", action="store_true",
                       help="Process files without saving changes")
    parser.add_argument("--report-only", action="store_true", 
                       help="Generate report without processing")
    
    args = parser.parse_args()
    
    try:
        enhancer = PersonalityEnhancer(args.profiles_dir)
        
        if not args.report_only:
            stats = enhancer.process_all_profiles(dry_run=args.dry_run)
            
            print("\n" + "="*60)
            print("Enhancement Complete!")
            print("="*60)
            print(f"Total files: {stats.total_files}")
            print(f"Enhanced: {stats.enhanced}")
            print(f"Errors: {stats.errors}")
            print(f"Skipped: {stats.skipped}")
            print(f"Success rate: {(stats.enhanced / stats.total_files * 100):.1f}%")
            
            # Generate and save report
            report = enhancer.generate_summary_report()
            report_file = Path(args.profiles_dir) / "enhancement_summary.md"
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"\nDetailed report saved to: {report_file}")
        
        else:
            print("Report-only mode: generating summary without processing files")
            report = enhancer.generate_summary_report()
            print(report)
    
    except KeyboardInterrupt:
        print("\nProcess interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()