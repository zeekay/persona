# Personality Profiles

A comprehensive collection of 488 personality profiles with OCEAN (Big Five) scores for AI personality modeling.

## Structure

Each personality has its own JSON file named after their ID (e.g., `einstein.json`, `zeekay.json`).

## Usage

### JavaScript/TypeScript

```javascript
// Import individual personality
import zeekay from './profiles/zeekay.json';

// Import index to see all available
import index from './profiles/index.json';

// Load dynamically
async function loadPersonality(id) {
  const data = await import(`./profiles/${id}.json`);
  return data.default;
}

// Load all personalities by category
import categories from './profiles/categories.json';
const philosophers = categories.philosopher;
```

### Adding New Personalities

1. Create a new JSON file in `profiles/` directory
2. Follow this template:

```json
{
  "id": "unique_id",
  "name": "Full Name",
  "category": "category_name",
  "ocean": {
    "openness": 85,
    "conscientiousness": 75,
    "extraversion": 60,
    "agreeableness": 70,
    "neuroticism": 40
  }
}
```

3. Run `npm run build-index` to update the index

## OCEAN Scores

All personalities include Big Five (OCEAN) personality scores:
- **Openness**: Creativity, curiosity, openness to new experiences (0-100)
- **Conscientiousness**: Organization, dependability, self-discipline (0-100)
- **Extraversion**: Sociability, assertiveness, emotional expression (0-100)
- **Agreeableness**: Cooperation, trust, altruism (0-100)
- **Neuroticism**: Emotional instability, anxiety, moodiness (0-100)

## Categories

- **Philosophers** (94)
- **Religious** (77)
- **Poets** (44)
- **Writers** (40)
- **Revolutionaries** (32)
- **Comedians** (30)
- **Scientists** (20)
- **Architects** (21)
- **Athletes** (12)
- **Filmmakers** (12)
- **Tech Leaders** (11)
- **Programmers** (11)
- And more...

## Personality Index

### Programmers
- `ada.json` - Ada Lovelace
- `grace.json` - Grace Hopper
- `turing.json` - Alan Turing
- `linus.json` - Linus Torvalds
- `guido.json` - Guido van Rossum
- `carmack.json` - John Carmack
- `satoshi.json` - Satoshi Nakamoto
- `zeekay.json` - Zach Kelling
- `dhh.json` - David Heinemeier Hansson

### Scientists
- `einstein.json` - Albert Einstein
- `newton.json` - Isaac Newton
- `curie.json` - Marie Curie
- `galileo.json` - Galileo Galilei
- `darwin.json` - Charles Darwin
- `feynman.json` - Richard Feynman
- `sagan.json` - Carl Sagan
- `tesla.json` - Nikola Tesla
- `hawking.json` - Stephen Hawking

### Philosophers
- `plato.json` - Plato
- `aristotle.json` - Aristotle
- `kant.json` - Immanuel Kant
- `nietzsche.json` - Friedrich Nietzsche
- `sartre.json` - Jean-Paul Sartre
- `beauvoir.json` - Simone de Beauvoir
- `hume.json` - David Hume
- `confucius.json` - Confucius
- `laozi.json` - Laozi
- `kierkegaard.json` - Søren Kierkegaard

### Artists
- `davinci.json` - Leonardo da Vinci
- `michelangelo.json` - Michelangelo
- `vangogh.json` - Vincent van Gogh
- `monet.json` - Claude Monet
- `picasso.json` - Pablo Picasso
- `dali.json` - Salvador Dalí
- `rembrandt.json` - Rembrandt
- `okeeffe.json` - Georgia O'Keeffe
- `kahlo.json` - Frida Kahlo
- `warhol.json` - Andy Warhol

### Writers
- `shakespeare.json` - William Shakespeare
- `homer.json` - Homer
- `dante.json` - Dante Alighieri
- `goethe.json` - Johann Wolfgang von Goethe
- `dickinson.json` - Emily Dickinson
- `whitman.json` - Walt Whitman
- `neruda.json` - Pablo Neruda
- `eliot.json` - T.S. Eliot
- `angelou.json` - Maya Angelou

### Leaders & Revolutionaries
- `gandhi.json` - Mahatma Gandhi
- `mandela.json` - Nelson Mandela
- `mlk.json` - Martin Luther King Jr.
- `churchill.json` - Winston Churchill
- `lincoln.json` - Abraham Lincoln
- `caesar.json` - Julius Caesar
- `alexander.json` - Alexander the Great
- `napoleon.json` - Napoleon Bonaparte

### Religious Figures
- `buddha.json` - Siddhartha Gautama
- `jesus.json` - Jesus of Nazareth
- `muhammad.json` - Muhammad
- `moses.json` - Moses
- `francis.json` - Francis of Assisi
- `luther.json` - Martin Luther
- `rumi.json` - Jalāl ad-Dīn Rumi
- `laozi.json` - Laozi

### Architects
- `frank_lloyd_wright.json` - Frank Lloyd Wright
- `le_corbusier.json` - Le Corbusier
- `zaha_hadid.json` - Zaha Hadid
- `louis_kahn.json` - Louis Kahn
- `antoni_gaudi.json` - Antoni Gaudí
- `im_pei.json` - I.M. Pei
- `mies_van_der_rohe.json` - Ludwig Mies van der Rohe
- `walter_gropius.json` - Walter Gropius
- `tadao_ando.json` - Tadao Ando

### Musicians (Deceased)
- `beethoven.json` - Ludwig van Beethoven
- `bach.json` - Johann Sebastian Bach
- `mozart.json` - Wolfgang Amadeus Mozart
- `davis.json` - Miles Davis
- `coltrane.json` - John Coltrane
- `jimi_hendrix.json` - Jimi Hendrix
- `freddie_mercury.json` - Freddie Mercury
- `johnny_cash.json` - Johnny Cash

### Comedians (Deceased)
- `george_carlin.json` - George Carlin
- `richard_pryor.json` - Richard Pryor
- `robin_williams.json` - Robin Williams
- `bill_hicks.json` - Bill Hicks
- `joan_rivers.json` - Joan Rivers

For a complete list, see `index.json` or `categories.json`.

## License

MIT