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

/** High-level expert vocabulary (advanced but readable) */
export const highLevelWords = [
  "acknowledge", "benevolent", "catastrophe", "diligence", "eloquent", "fascinating",
  "gregarious", "hypothesis", "illuminate", "juxtaposition", "knowledgeable",
  "labyrinth", "meticulous", "nefarious", "obfuscate", "paradigm", "quintessential",
  "resilient", "sophisticated", "tenacious", "ubiquitous", "venerable", "whimsical",
  "xenophobia", "zealous", "abstraction", "bureaucracy", "circumference",
  "demonstration", "entrepreneur", "flamboyant", "infrastructure", "jurisdiction",
  "kaleidoscope", "legislation", "manipulation", "nevertheless", "opportunity",
  "perpendicular", "questionnaire", "responsibility", "simultaneously", "temperature",
  "understanding", "vulnerability", "wonderfully", "extraordinary", "philosophical",
  "architecture", "authentication", "authorization", "compatibility", "configuration",
  "convolution", "cryptography", "deployment", "distributed", "efficiency",
  "encapsulation", "framework", "generation", "hierarchical", "implementation",
  "integration", "interface", "latency", "methodology", "optimization",
  "orchestration", "performance", "persistence", "reliability", "scalability",
  "serialization", "synchronization", "throughput", "transaction", "validation",
  "acceleration", "adaptation", "calibration", "collaboration", "computation",
  "coordination", "deliberation", "dimension", "evaluation", "experimentation",
  "formulation", "innovation", "interpretation", "investigation", "navigation",
  "observation", "organization", "preparation", "presentation", "propagation",
  "recognition", "reconstruction", "refinement", "representation", "resolution",
  "specification", "transformation", "transmission", "verification", "visualization",
];

/** Extremely high-level / rare / multi-syllable challenge words */
export const extremeLevelWords = [
  "antidisestablishmentarianism", "floccinaucinihilipilification",
  "pneumonoultramicroscopicsilicovolcanoconiosis", "supercalifragilisticexpialidocious",
  "incomprehensibilities", "uncharacteristically", "interdisciplinary",
  "counterintuitive", "disproportionately", "electroencephalograph",
  "immunohistochemistry", "neurodegenerative", "pharmacokinetics",
  "thermodynamically", "spectroscopic", "crystallography", "bioinformatics",
  "nanotechnology", "astrophysical", "quantum", "entanglement", "superposition",
  "heisenberg", "schrodinger", "relativity", "cosmology", "exoplanetary",
  "microarchitecture", "polymorphism", "idempotent", "asynchronous",
  "memoization", "virtualization", "containerization", "microservices",
  "observability", "instrumentation", "telemetry", "reconciliation",
  "deterministic", "nondeterministic", "combinatorial", "probabilistic",
  "stochastic", "heuristic", "backpropagation", "gradient", "hyperparameter",
  "regularization", "overfitting", "underfitting", "transformer", "attention",
  "embeddings", "tokenization", "inference", "throughput", "idempotency",
  "eventual", "consistency", "consensus", "quorum", "replication",
  "sharding", "partitioning", "serialization", "deserialization", "protobuf",
  "graphql", "websocket", "middleware", "interceptor", "dependency",
  "inversion", "singleton", "prototype", "factory", "decorator",
  "facade", "adapter", "observer", "strategy", "command",
  "iterator", "generator", "coroutine", "mutex", "semaphore",
  "deadlock", "livelock", "starvation", "race", "condition",
  "atomicity", "isolation", "durability", "checkpoint", "rollback",
  "cryptographic", "asymmetric", "symmetric", "elliptic", "curve",
  "diffie", "hellman", "certificate", "handshake", "cipher",
  "plaintext", "ciphertext", "nonce", "salt", "hash",
  "blockchain", "consensus", "merkle", "zero", "knowledge",
  "homomorphic", "differential", "privacy", "anonymization", "pseudonymization",
  "epistemology", "ontology", "phenomenology", "hermeneutics", "dialectic",
  "syllogism", "tautology", "paradox", "anomaly", "singularity",
  "ubiquitous", "ephemeral", "ameliorate", "exacerbate", "juxtapose",
  "magnanimous", "perspicacious", "recalcitrant", "sanguine", "vicissitude",
  "zeitgeist", "cacophony", "euphemism", "idiosyncrasy", "obsequious",
  "pulchritudinous", "sesquipedalian", "verisimilitude", "wunderkind", "xylophone",
];

/** Expert pool: high + extreme only (no beginner filler) */
export const expertWords = [...highLevelWords, ...extremeLevelWords];

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

/** Long expert-level passages for realistic hard typing */
export const expertParagraphs = [
  "Modern distributed systems demand meticulous attention to consistency models, partition tolerance, and latency budgets; engineers must juxtapose theoretical guarantees with pragmatic trade-offs under real-world failure modes.",
  "Cryptographic protocols rely on asymmetric key exchange, certificate validation, and carefully chosen nonces so that interceptors cannot reconstruct plaintext from ciphertext even with substantial computational resources.",
  "Machine learning pipelines orchestrate feature extraction, hyperparameter search, and regularization strategies to mitigate overfitting while preserving generalization across heterogeneous production workloads.",
  "When profiling microservices, observability stacks combine metrics, traces, and structured logs; correlation identifiers propagate across asynchronous boundaries so operators can reconstruct causal chains during incidents.",
  "Quantum computing challenges classical assumptions: superposition and entanglement enable algorithms that, in principle, outperform deterministic approaches for certain combinatorial search and cryptographic problems.",
  "High-performance networking stacks exploit kernel bypass, zero-copy buffers, and careful CPU affinity to achieve multi-gigabit throughput without sacrificing fairness among competing tenants.",
  "Secure authentication is not merely a password check; multi-factor challenges, device attestation, and risk-based adaptive policies form a defense-in-depth posture against credential stuffing and phishing.",
  "Compilers transform high-level abstractions into machine instructions through parsing, semantic analysis, intermediate representation, optimization passes, and register allocation that must remain correct under aggressive transformations.",
  "In regulated industries, audit trails, data retention policies, and cryptographic integrity proofs are mandatory; any deviation can trigger legal exposure and undermine stakeholder confidence.",
  "Concurrent programs must avoid deadlocks, livelocks, and subtle race conditions; memory models define which reorderings are legal, and lock-free algorithms require careful reasoning about atomic primitives.",
  "The epistemology of scientific measurement insists that instruments be calibrated, uncertainties quantified, and hypotheses falsifiable; otherwise, elaborate models risk becoming sophisticated mythology.",
  "Cloud-native deployments emphasize immutable infrastructure, declarative configuration, and progressive delivery so that rollbacks remain instantaneous when a canary reveals anomalous error rates.",
  "Natural language systems tokenize input, produce dense embeddings, and apply attention mechanisms; yet they still hallucinate facts unless grounded with retrieval or constrained decoding strategies.",
  "Financial risk engines simulate portfolios under stochastic shocks, stress scenarios, and liquidity freezes; regulators demand transparent methodologies and reproducible backtests spanning multiple market regimes.",
  "Human-computer interaction research shows that latency above one hundred milliseconds degrades perceived quality; expert typists especially notice micro-stutters that interrupt flow and reduce accuracy.",
  "Bioinformatics pipelines align sequences, call variants, and annotate functional impacts at scale; computational complexity grows nonlinearly with genome length and multi-sample cohort sizes.",
  "Zero-trust architecture assumes breach: every request is authenticated, authorized, and encrypted, regardless of network location, and lateral movement is constrained by least-privilege service identities.",
  "Philosophical debates about free will and determinism mirror technical discussions of nondeterministic algorithms; both grapple with prediction, agency, and the limits of complete information.",
  "Satellite telemetry arrives with intermittent connectivity, clock skew, and sensor drift; ground systems must reconcile partial updates without corrupting long-running mission state machines.",
  "Writing maintainable software is an exercise in managing complexity: clear module boundaries, deliberate naming, and ruthless deletion of dead code prevent systems from collapsing under their own weight.",
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

const BASIC_PUNCT = [".", ",", "!", "?", ";", ":"];
const EXPERT_SYMBOLS = [
  "@",
  "#",
  "$",
  "%",
  "&",
  "*",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "/",
  "\\",
  "+",
  "=",
  "_",
  "-",
  "'",
  '"',
  "`",
  "~",
  "|",
  "<",
  ">",
  "^",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomNumberToken(expert: boolean): string {
  if (!expert) return String(Math.floor(Math.random() * 100));
  const styles = [
    () => String(Math.floor(Math.random() * 10000)),
    () => (Math.random() * 1000).toFixed(2),
    () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    () => `0x${Math.floor(Math.random() * 0xffffff).toString(16)}`,
    () => `${Math.floor(Math.random() * 90) + 10}%`,
    () => `${Math.floor(Math.random() * 9000) + 1000}`,
  ];
  return pick(styles)();
}

function decorateWord(
  base: string,
  difficulty: "beginner" | "intermediate" | "expert",
  withPunctuation: boolean,
  withNumbers: boolean
): string {
  let word = base;
  const expert = difficulty === "expert";

  if (withNumbers && Math.random() < (expert ? 0.3 : 0.15)) {
    // Sometimes replace word with a number token; sometimes append digits
    if (Math.random() < 0.55) {
      word = randomNumberToken(expert);
    } else {
      word = `${word}${Math.floor(Math.random() * (expert ? 1000 : 100))}`;
    }
  }

  if (withPunctuation) {
    if (expert && Math.random() < 0.28) {
      // Symbols like email/handle/path style tokens
      const form = Math.random();
      if (form < 0.25) {
        word = `${word}@${pick(["mail", "corp", "dev", "io", "org"])}.com`;
      } else if (form < 0.45) {
        word = `#${word}`;
      } else if (form < 0.6) {
        word = `$${word}`;
      } else if (form < 0.75) {
        word = `${pick(EXPERT_SYMBOLS)}${word}${pick([")", "]", "}", ""])}`;
      } else if (form < 0.9) {
        word = `${word}${pick(BASIC_PUNCT)}`;
      } else {
        word = `"${word}"`;
      }
    } else if (Math.random() < (expert ? 0.35 : 0.2)) {
      word += pick(BASIC_PUNCT);
    }
  }

  // Occasional capitalization for expert realism
  if (expert && Math.random() < 0.12 && /^[a-z]/.test(word)) {
    word = word[0]!.toUpperCase() + word.slice(1);
  }

  return word;
}

function paragraphWordStream(): string[] {
  const para = pick(expertParagraphs);
  return para
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

export function getRandomWords(
  count: number,
  difficulty: "beginner" | "intermediate" | "expert" = "beginner",
  withPunctuation = false,
  withNumbers = false
): string[] {
  const pool =
    difficulty === "beginner"
      ? beginnerWords
      : difficulty === "intermediate"
        ? intermediateWords
        : expertWords;

  const words: string[] = [];
  let stream: string[] = [];

  for (let i = 0; i < count; i++) {
    // Expert: frequently inject long paragraph fragments for endurance
    if (difficulty === "expert" && stream.length === 0 && Math.random() < 0.45) {
      stream = paragraphWordStream();
    }

    let base: string;
    if (difficulty === "expert" && stream.length > 0) {
      base = stream.shift()!;
      // Strip trailing punctuation from paragraph words; re-apply via decorate
      base = base.replace(/[.,!?;:'"]+$/g, "");
      if (!base) {
        i--;
        continue;
      }
    } else {
      // Mix high vs extreme for expert
      if (difficulty === "expert" && Math.random() < 0.4) {
        base = pick(extremeLevelWords);
      } else {
        base = pick(pool);
      }
    }

    words.push(
      decorateWord(base, difficulty, withPunctuation, withNumbers)
    );
  }

  return words;
}

export type ExpertDifficulty = "normal" | "hard" | "extreme";

const NORMAL_SENTENCES = [
  "The morning light came through the kitchen window and warmed the wooden table.",
  "She walked to the market and bought fresh bread, apples, and a small jar of honey.",
  "They spent the afternoon reading beside the river while the city moved slowly around them.",
  "A good habit is built one quiet day at a time, not in a single burst of effort.",
  "He asked a simple question, waited for the answer, and then wrote it down carefully.",
  "The train arrived on time, and the passengers stepped off into cool evening air.",
  "Children played near the park fountain while their parents talked on a nearby bench.",
  "You can improve your typing by staying relaxed, looking ahead, and keeping a steady rhythm.",
  "The library was quiet except for the soft sound of pages turning and chairs sliding back.",
  "After dinner they washed the dishes, made tea, and planned the rest of the week.",
  "A clear sentence is easier to type when the words follow a natural order.",
  "The weather changed quickly, but the road stayed dry enough for a short walk home.",
  "She opened her notebook, reviewed the last page, and started a new paragraph.",
  "People remember stories that feel honest, specific, and easy to picture.",
  "He practiced every evening until the keys felt familiar under his hands.",
  "The shop owner smiled, counted the change, and handed over a paper bag.",
  "We crossed the bridge, turned left at the corner, and found the cafe still open.",
  "Learning takes patience, attention, and a willingness to begin again after a mistake.",
  "The old radio played a gentle song while rain tapped against the glass.",
  "They finished the report, checked the numbers, and sent it before the deadline.",
  "A wide street led toward the station, where a clock hung above the main door.",
  "She packed a sweater, a book, and a bottle of water for the trip.",
  "The garden needed water, but the soil was still damp from last night.",
  "He listened first, then spoke, because the conversation mattered more than speed.",
  "The teacher wrote a short example on the board and asked the class to follow along.",
];

const HARD_CONNECTORS = [
  "meanwhile",
  "therefore",
  "however",
  "nevertheless",
  "consequently",
  "although",
  "whereas",
  "furthermore",
];

const EMAIL_HOSTS = ["mail.com", "corp.io", "dev.org", "labs.net", "inbox.co"];
const EXTREME_SYMBOLS = ["@", "#", "$", "%", "&", "/", "?", "!", "-", "_"];

function sentenceToWords(sentence: string): string[] {
  return sentence
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function maybeCaseMix(word: string, chance: number): string {
  if (!/^[A-Za-z]/.test(word) || Math.random() >= chance) return word;
  const mode = Math.random();
  if (mode < 0.45) return word[0]!.toUpperCase() + word.slice(1);
  if (mode < 0.75) return word.toUpperCase();
  return word
    .split("")
    .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");
}

function attachSymbol(word: string): string {
  const mark = pick(EXTREME_SYMBOLS);
  const form = Math.random();
  if (form < 0.25) return `${mark}${word}`;
  if (form < 0.5) return `${word}${mark}`;
  if (form < 0.75) return `${word}${mark}${pick(["ok", "id", "v2", "01"])}`;
  return `${mark}${word}${mark}`;
}

function emailFragment(): string {
  const user = pick(highLevelWords).toLowerCase().slice(0, 10);
  return `${user}${Math.floor(Math.random() * 90) + 10}@${pick(EMAIL_HOSTS)}`;
}

function codeFragment(): string {
  const name = pick(["userId", "retryCount", "payload", "hashKey", "offset"]);
  const forms = [
    `${name}=${Math.floor(Math.random() * 900) + 100}`,
    `fn(${name})`,
    `${name}[${Math.floor(Math.random() * 8)}]`,
    `/${name}/${pick(["v1", "raw", "tmp"])}`,
    `${name}_${pick(["max", "min", "avg"])}`,
  ];
  return pick(forms);
}

function fillFromSentences(count: number, pool: string[]): string[] {
  const words: string[] = [];
  while (words.length < count) {
    words.push(...sentenceToWords(pick(pool)));
  }
  return words.slice(0, count);
}

function expertNumberToken(level: ExpertDifficulty): string {
  const styles = [
    () => String(Math.floor(Math.random() * 90) + 10),
    () => String(Math.floor(Math.random() * 9000) + 1000),
    () => (Math.random() * 20 + 1).toFixed(1),
    () => `${Math.floor(Math.random() * 80) + 10}%`,
    () => `${Math.floor(Math.random() * 9) + 1}x`,
    () => `${Math.floor(Math.random() * 12) + 1}/7`,
    () => String(2000 + Math.floor(Math.random() * 30)),
  ];
  if (level !== "normal") {
    styles.push(() => randomNumberToken(true));
  }
  return pick(styles)();
}

/** Expert uses about 2× the normal Numbers option (~15% → ~30%), spaced out. */
function sprinkleExpertNumbers(
  words: string[],
  level: ExpertDifficulty
): string[] {
  const rate = level === "extreme" ? 0.36 : level === "hard" ? 0.32 : 0.3;
  const out = [...words];
  let sinceLast = 2;
  for (let i = 0; i < out.length; i++) {
    sinceLast += 1;
    const due = sinceLast >= 4 && Math.random() < 0.55;
    if (!(Math.random() < rate || due) || sinceLast < 2) continue;
    const form = Math.random();
    if (form < 0.4) {
      out[i] = expertNumberToken(level);
    } else if (form < 0.75) {
      out[i] = `${out[i]!.replace(/[.,!?;:]+$/g, "")}${expertNumberToken(level)}`;
    } else {
      out.splice(i + 1, 0, expertNumberToken(level));
      i += 1;
    }
    sinceLast = 0;
  }
  return out;
}

export function getExpertChallengeWords(
  count: number,
  level: ExpertDifficulty
): string[] {
  if (level === "normal") {
    return sprinkleExpertNumbers(
      fillFromSentences(count, NORMAL_SENTENCES),
      "normal"
    ).slice(0, count);
  }

  const words: string[] = [];

  if (level === "hard") {
    let stream = paragraphWordStream();
    while (words.length < count) {
      if (stream.length === 0) stream = paragraphWordStream();
      let word = stream.shift() || pick(highLevelWords);
      if (Math.random() < 0.22) word = pick(highLevelWords);
      if (Math.random() < 0.18) word = pick(HARD_CONNECTORS);
      if (Math.random() < 0.32) {
        word = `${word}${Math.floor(Math.random() * 900) + 10}`;
      }
      if (Math.random() < 0.28) {
        word = `${word}${pick([".", ",", ";", ":", "?", "!"])}`;
      } else if (Math.random() < 0.12) {
        word = attachSymbol(word);
      }
      word = maybeCaseMix(word, 0.28);
      words.push(word);
    }
    return sprinkleExpertNumbers(words, "hard").slice(0, count);
  }

  while (words.length < count) {
    const roll = Math.random();
    let word: string;
    if (roll < 0.18) {
      word = emailFragment();
    } else if (roll < 0.34) {
      word = codeFragment();
    } else if (roll < 0.5) {
      word = randomNumberToken(true);
    } else if (roll < 0.78) {
      word = pick(extremeLevelWords);
    } else {
      word = pick(highLevelWords);
    }
    if (Math.random() < 0.42) word = attachSymbol(word);
    if (Math.random() < 0.22) {
      word = `${word}${pick([".", ",", "?", "!", ";", ":"])}`;
    }
    word = maybeCaseMix(word, 0.45);
    words.push(word);
  }

  return sprinkleExpertNumbers(words, level).slice(0, count);
}

export function getRandomSentence(): string {
  return commonSentences[Math.floor(Math.random() * commonSentences.length)];
}

export function getRandomExpertParagraph(): string {
  return pick(expertParagraphs);
}
