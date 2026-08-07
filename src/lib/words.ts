export const beginnerWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
];

export const intermediateWords = [
  ...beginnerWords,
  "through", "during", "before", "between", "under", "again", "further", "once",
  "here", "there", "when", "where", "why", "how", "all", "both", "each", "few",
  "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
  "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
  "computer", "keyboard", "monitor", "software", "hardware", "network", "internet",
  "browser", "website", "application", "database", "server", "client", "protocol",
  "algorithm", "function", "variable", "constant", "object", "array", "string",
  "number", "boolean", "null", "undefined", "promise", "async", "await", "react",
  "component", "props", "state", "hook", "effect", "context", "reducer", "store",
];

export const expertWords = [
  ...intermediateWords,
  "acknowledge", "benevolent", "catastrophe", "diligence", "eloquent", "fascinating",
  "gregarious", "hypothesis", "illuminate", "juxtaposition", "knowledgeable",
  "labyrinth", "meticulous", "nefarious", "obfuscate", "paradigm", "quintessential",
  "resilient", "sophisticated", "tenacious", "ubiquitous", "venerable", "whimsical",
  "xenophobia", "yesterday", "zealous", "abstraction", "bureaucracy", "circumference",
  "demonstration", "entrepreneur", "flamboyant", "infrastructure", "jurisdiction",
  "kaleidoscope", "legislation", "manipulation", "nevertheless", "opportunity",
  "perpendicular", "questionnaire", "responsibility", "simultaneously", "temperature",
  "understanding", "vulnerability", "wonderfully", "extraordinary", "philosophical",
];

export const commonSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump.",
  "The five boxing wizards jump quickly.",
  "Sphinx of black quartz, judge my vow.",
  "Amazingly few discotheques provide jukeboxes.",
  "The jay, pig, fox, zebra and my wolves quack!",
  "Crazy Fredrick bought many very exquisite opal jewels.",
  "We promptly judged antique ivory buckles for the next prize.",
  "A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.",
];

export const codeSnippets = {
  javascript: [
    "const greet = (name) => `Hello, ${name}!`;",
    "function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }",
    "const users = await fetch('/api/users').then(r => r.json());",
    "export default function App() { return <div>Hello World</div>; }",
    "const [count, setCount] = useState(0);",
  ],
  python: [
    "def hello(name): return f'Hello, {name}!'",
    "for i in range(10): print(i)",
    "class Person: def __init__(self, name): self.name = name",
    "with open('file.txt') as f: content = f.read()",
    "lambda x: x * 2 if x > 0 else 0",
  ],
  html: [
    "<div class=\"container\"><h1>Hello World</h1></div>",
    "<button onclick=\"handleClick()\">Click me</button>",
    "<input type=\"text\" placeholder=\"Enter name\" />",
    "<img src=\"image.jpg\" alt=\"Description\" />",
    "<ul><li>Item 1</li><li>Item 2</li></ul>",
  ],
  css: [
    ".container { display: flex; justify-content: center; }",
    "button:hover { background-color: #3b82f6; transform: scale(1.05); }",
    "@media (max-width: 768px) { .sidebar { display: none; } }",
    "body { font-family: 'Inter', sans-serif; background: #0f172a; }",
    ".card { border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }",
  ],
};

export function getRandomWords(
  count: number,
  difficulty: "beginner" | "intermediate" | "expert" = "beginner",
  withPunctuation = false,
  withNumbers = false
): string[] {
  let pool =
    difficulty === "beginner"
      ? beginnerWords
      : difficulty === "intermediate"
      ? intermediateWords
      : expertWords;

  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    let word = pool[Math.floor(Math.random() * pool.length)];
    if (withNumbers && Math.random() < 0.15) {
      word = Math.floor(Math.random() * 100).toString();
    }
    if (withPunctuation && Math.random() < 0.2) {
      const punct = [".", ",", "!", "?", ";", ":"];
      word += punct[Math.floor(Math.random() * punct.length)];
    }
    words.push(word);
  }
  return words;
}

export function getRandomSentence(): string {
  return commonSentences[Math.floor(Math.random() * commonSentences.length)];
}