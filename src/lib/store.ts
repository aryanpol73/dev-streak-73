import { format, differenceInCalendarDays, startOfWeek, endOfWeek, subDays, parseISO } from 'date-fns';

// =============================================================================
// TYPES
// =============================================================================

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
  proofUrl?: string;      // GitHub commit, deployed link, gist
  proofNotes?: string;    // detailed notes on what was learned
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  stack: string;
  description: string;
  whyUnique: string;
  status: 'not-started' | 'building' | 'shipped';
  repoUrl?: string;
  liveUrl?: string;
  shippedAt?: string;
}

export interface Phase {
  id: string;
  number: number;
  name: string;
  weekStart: number;
  weekEnd: number;
  focus: string;
  outcome: string;
  color: string;
  sections: { title: string; topics: Topic[] }[];
  projects: Project[];
}

export interface DailySubmission {
  id: string;
  date: string;            // YYYY-MM-DD
  challengeId: string;     // topic id worked on today
  challengeName: string;
  phaseNumber: number;
  minutesStudied: number;
  proofType: 'commit' | 'deploy' | 'notes' | 'leetcode';
  proofUrl?: string;
  proofNotes: string;      // required, min 80 chars
  leetcodeProblems: number; // optional DSA count
  difficulty: 'easy' | 'medium' | 'hard';
  verified: boolean;       // basic heuristic check
  createdAt: string;
  attachments?: SubmissionAttachment[]; // images / files / vscode pastes
}

export interface SubmissionAttachment {
  id: string;
  name: string;
  type: string;       // mime type
  size: number;       // bytes
  dataUrl: string;    // base64 data: URL — stored locally
  kind: 'image' | 'file' | 'code';
}

export interface WeeklyReflection {
  id: string;
  weekStart: string;
  whatShipped: string;
  whatBlocked: string;
  nextWeekFocus: string;
  createdAt: string;
}

// =============================================================================
// REAL ROADMAP DATA (from AI_Product_Developer_Roadmap_v2.pdf)
// =============================================================================

const t = (name: string): Topic => ({ id: crypto.randomUUID?.() ?? Math.random().toString(36), name, completed: false });

const ROADMAP_PHASES: Phase[] = [
  {
    id: 'p1', number: 1, name: 'Backend: Node.js + MySQL + Express',
    weekStart: 1, weekEnd: 5, color: '262 52% 58%',
    focus: 'Close MERN gaps. Ship one strong full-stack project with MySQL.',
    outcome: 'Full-Stack app live on Render + Vercel with auth, MySQL, Swagger docs.',
    sections: [
      { title: 'Node.js — Fill the Gaps (Wk 1-2)', topics: [
        t('Advanced middleware: error handlers, logging'), t('JWT auth: access + refresh tokens'),
        t('bcrypt password hashing & salting'), t('Role-based access control (RBAC)'),
        t('Rate limiting (express-rate-limit)'), t('File uploads with Multer + S3'),
        t('Email with Nodemailer'), t('Cron jobs with node-cron'),
        t('Socket.io basics'), t('dotenv + config management'),
        t('MVC + Service Layer architecture'), t('Input validation with Zod/Joi'),
      ]},
      { title: 'MySQL — Beyond Basics (Wk 2-3)', topics: [
        t('Database design & normalisation (1NF/2NF/3NF)'), t('Complex JOINs (INNER/LEFT/RIGHT/SELF)'),
        t('Subqueries & correlated subqueries'), t('Stored procedures & triggers'),
        t('Transactions: ACID, BEGIN/COMMIT/ROLLBACK'), t('Indexes + EXPLAIN query plans'),
        t('Window functions: ROW_NUMBER, RANK, LAG, LEAD'), t('Full-text search in MySQL'),
        t('MySQL with Sequelize/Prisma'), t('Connection pooling with mysql2'),
        t('Database migrations'), t('Soft deletes & audit logs'),
      ]},
      { title: 'REST API + Security (Wk 3-4)', topics: [
        t('REST naming conventions & versioning'), t('HTTP status codes (200/201/400/401/403/404/500)'),
        t('Request/Response DTO pattern'), t('Swagger/OpenAPI docs'),
        t('CORS configuration'), t('Helmet.js security headers'),
        t('SQL injection prevention'), t('XSS & CSRF protection'),
        t('Pagination: cursor vs offset'), t('Per-user rate limiting'),
        t('Graceful shutdown'), t('Env-based config (dev/staging/prod)'),
      ]},
    ],
    projects: [
      { id: 'pr1', name: 'AI-Ready REST API Backend', difficulty: 'Intermediate',
        stack: 'Node.js + Express + MySQL + JWT + Swagger',
        description: 'Production-quality REST API with full auth, RBAC, pagination, rate limiting, Swagger docs, MySQL+Sequelize. Built to be extended with AI in Phase 3.',
        whyUnique: 'Most students build toy backends. This one is structured like a real product API from day one.',
        status: 'not-started' },
      { id: 'pr2', name: 'Real-Time Collaborative Notes App', difficulty: 'Intermediate',
        stack: 'Node.js + Express + MySQL + Socket.io + React',
        description: 'Multi-user real-time editing with Socket.io, MySQL persistence, JWT auth. Later add AI summarisation.',
        whyUnique: 'Real-time + auth + MySQL combo is rare in student portfolios. Extendable with AI.',
        status: 'not-started' },
    ],
  },
  {
    id: 'p2', number: 2, name: 'Python + ML Foundations + NLP',
    weekStart: 6, weekEnd: 13, color: '270 60% 65%',
    focus: 'ML at conceptual + applied level, not research. Know what models do, when they fail, how to evaluate.',
    outcome: 'Strong ML intuition + 3 unique projects + comfortable with Python ecosystem.',
    sections: [
      { title: 'Python Fast Track for JS Devs (Wk 6)', topics: [
        t('Variables, types, lists, dicts, tuples, sets'), t('Functions, *args, **kwargs, decorators'),
        t('OOP: classes, inheritance, dunder methods'), t('List/dict comprehensions, generators'),
        t('Exception handling try/except/finally'), t('File I/O: CSVs, JSONs, text'),
        t('venv, pip, requirements.txt'), t('Type hints (Python 3.10+)'),
        t('Dataclasses & namedtuples'), t('Context managers (with)'),
        t('Stdlib: os, sys, datetime, itertools'), t('Python vs JS mental model shifts'),
      ]},
      { title: 'NumPy + Pandas + EDA (Wk 7)', topics: [
        t('NumPy arrays: creation, indexing, slicing'), t('Broadcasting & element-wise ops'),
        t('Pandas Series & DataFrame'), t('Read CSV/Excel/SQL into DataFrame'),
        t('Cleaning: dropna, fillna, dupes, dtype'), t('Groupby, merge, pivot, melt'),
        t('Apply, map, lambda'), t('Matplotlib basics'),
        t('Seaborn: heatmaps, pairplots'), t('Pandas Profiling'),
        t('Imbalanced datasets'), t('Export processed data to MySQL'),
      ]},
      { title: 'Core ML Algorithms — Scikit-Learn (Wk 8-9)', topics: [
        t('Supervised vs Unsupervised vs RL'), t('Train/Val/Test split'),
        t('Overfitting & bias-variance tradeoff'), t('Feature engineering'),
        t('Linear Regression + MSE'), t('Logistic Regression + sigmoid'),
        t('Decision Trees (Gini, pruning)'), t('Random Forest & feature importance'),
        t('XGBoost / LightGBM'), t('SVM + kernel trick'),
        t('K-Means clustering'), t('KNN'),
        t('Naive Bayes for text'), t('Metrics: accuracy, precision, recall, F1, AUC-ROC'),
        t('Cross-validation (k-fold)'), t('Sklearn Pipeline'),
        t('GridSearchCV + RandomSearchCV'), t('Save models with joblib/pickle'),
      ]},
      { title: 'Deep Learning + Keras (Wk 10-11)', topics: [
        t('Neurons, layers, weights'), t('Activations: ReLU, Sigmoid, Softmax, GELU'),
        t('Forward pass'), t('Backprop intuition'),
        t('Loss: MSE, BinaryCrossEntropy'), t('Optimizers: SGD, Adam, AdamW'),
        t('Keras Sequential vs Functional'), t('Batch size, epochs, LR'),
        t('Dropout regularisation'), t('Early stopping & ModelCheckpoint'),
        t('Transfer Learning (VGG16, ResNet, EfficientNet)'), t('TensorBoard'),
      ]},
      { title: 'NLP — Basics to Transformers (Wk 12-13)', topics: [
        t('Text preprocessing: stopwords, stemming'), t('Bag of Words, CountVectorizer'),
        t('Word2Vec, GloVe (concept)'), t('TF-IDF'),
        t('Text classification end-to-end'), t('Tokenisation: word/subword/BPE'),
        t('Sentiment analysis with traditional ML'), t('Attention mechanism intuition'),
        t('Hugging Face Transformers library'), t('Sentence Transformers'),
        t('Fine-tuning BERT (intro)'), t('Seq2Seq encoder-decoder'),
        t('Transformer architecture (BERT/GPT high-level)'), t('HF pipeline(): NER, QA, summarisation'),
        t('FAISS vector search basics'), t('Semantic vs keyword search'),
      ]},
    ],
    projects: [
      { id: 'pr3', name: 'Student Dropout Prediction System', difficulty: 'Intermediate',
        stack: 'Python + Scikit-Learn + XGBoost + Pandas + Streamlit + MySQL',
        description: 'Predicts students at dropout risk using academic, attendance & engagement data from MySQL. Streamlit dashboard for admins.',
        whyUnique: 'Connects ML directly to MySQL — most students use CSVs only.',
        status: 'not-started' },
      { id: 'pr4', name: 'Multi-Language Fake News Detector', difficulty: 'Advanced',
        stack: 'Python + NLP + Hugging Face + FastAPI + React + MySQL',
        description: 'Detects fake news in English + Hindi/Marathi using multilingual BERT. FastAPI serves model, MySQL logs predictions with feedback.',
        whyUnique: 'Multilingual + real-world problem + feedback loop in MySQL.',
        status: 'not-started' },
      { id: 'pr5', name: 'Crop Disease Detection + Advisory', difficulty: 'Advanced',
        stack: 'Python + CNN (TensorFlow) + Hugging Face + FastAPI + React + MySQL',
        description: 'Farmer uploads crop photo. CNN identifies disease. LLM generates treatment advice in local language. MySQL stores history.',
        whyUnique: 'CV + LLM + regional language + real social impact.',
        status: 'not-started' },
    ],
  },
  {
    id: 'p3', number: 3, name: 'LLMs + Prompt Eng + RAG + Agents',
    weekStart: 14, weekEnd: 21, color: '32 100% 55%',
    focus: 'The core of AI Product Dev in 2025-26. Build, deploy, optimise LLM apps end-to-end. MySQL+AI is your edge.',
    outcome: 'Can build & deploy LLM-powered products end-to-end with MySQL integration.',
    sections: [
      { title: 'How LLMs Work (Wk 14)', topics: [
        t('Transformer architecture & self-attention'), t('Context window limits & workarounds'),
        t('System / user / assistant prompts'), t('GPT-4o, Claude 3.5, Gemini, Mistral, LLaMA 3'),
        t('Embeddings as dense vectors'), t('Token limits & cost estimation'),
        t('BPE & SentencePiece tokenisation'), t('Temperature, Top-p, Top-k'),
        t('Foundation vs instruction-tuned vs RLHF'), t('Hallucinations: causes & mitigation'),
        t('Semantic vs keyword search'), t('Latency vs quality tradeoffs'),
      ]},
      { title: 'Prompt Engineering (Wk 14-15)', topics: [
        t('Zero-shot prompting'), t('Chain-of-Thought (CoT)'),
        t('Tree of Thoughts (ToT)'), t('Role prompting / personas'),
        t('Prompt chaining'), t('Prompt versioning & A/B testing'),
        t('Grounding to reduce hallucinations'), t('One-shot & few-shot'),
        t('Self-consistency prompting'), t('ReAct pattern'),
        t('Output format control (JSON/XML)'), t('Negative prompting'),
        t('Jailbreak awareness & defence'), t('System prompt engineering for products'),
      ]},
      { title: 'OpenAI / Gemini / Anthropic APIs (Wk 15-16)', topics: [
        t('OpenAI Chat Completions API'), t('Function calling / Tool use'),
        t('Whisper API speech-to-text'), t('Embeddings API'),
        t('Anthropic Claude API'), t('Rate limit & retry logic'),
        t('Streaming responses'), t('GPT-4o Vision API'),
        t('DALL-E 3 API'), t('Gemini multimodal'),
        t('Free alts: Groq, Together.ai, Ollama'), t('Cost optimisation: caching, model choice'),
      ]},
      { title: 'LangChain + RAG (Wk 16-18)', topics: [
        t('LangChain chains, runnables, LCEL'), t('Text splitters: recursive, semantic, token'),
        t('Embeddings pipeline: chunk → embed → store'), t('RAG: retrieve → augment → generate'),
        t('Multi-vector retrieval (parent-child)'), t('Document loaders: PDF, web, CSV, MySQL'),
        t('Vector stores: ChromaDB, Pinecone, pgvector'), t('Retrieval: similarity, MMR, hybrid'),
        t('Conversational RAG with memory'), t('HyDE — Hypothetical Doc Embeddings'),
        t('LlamaIndex: nodes, query engines'), t('LangSmith tracing'),
        t('RAG evaluation: faithfulness, relevancy'), t('MySQL as RAG document source'),
      ]},
      { title: 'AI Agents + Tool Use (Wk 18-20)', topics: [
        t('Agents: ReAct loop & memory'), t('OpenAI Assistants API'),
        t('CrewAI multi-agent framework'), t('Memory: in-context vs external (Redis/MySQL)'),
        t('Browser automation: Playwright + LLM'), t('Structured output with Pydantic'),
        t('Tool definition: search, calc, code exec'), t('LangChain AgentExecutor'),
        t('LangGraph stateful workflows'), t('Agent with MySQL tool (NL → query)'),
        t('Email/calendar automation agents'), t('Agent eval & safety guardrails'),
      ]},
      { title: 'HuggingFace + Local LLMs (Wk 20-21)', topics: [
        t('HuggingFace Hub'), t('Run LLMs locally with Ollama'),
        t('LM Studio'), t('HuggingFace Spaces deployment'),
        t('LoRA fine-tuning intro'), t('Fine-tune vs RAG vs prompting decision'),
        t('Inference API free tier'), t('Quantisation: GGUF, 4-bit, 8-bit'),
        t('Gradio for instant UIs'), t('Multilingual embeddings'),
        t('PEFT library'), t('Benchmarks: MMLU, HellaSwag'),
      ]},
    ],
    projects: [
      { id: 'pr6', name: 'Text-to-MySQL Query Engine', difficulty: 'Advanced',
        stack: 'Python + LangChain + OpenAI + MySQL + FastAPI + React',
        description: 'Plain English → MySQL query → results table + chart. Schema-aware prompting. Guards against SQL injection.',
        whyUnique: 'Text-to-SQL using YOUR MySQL skill. Most RAG projects use PDFs.',
        status: 'not-started' },
      { id: 'pr7', name: 'AI Code Review Assistant', difficulty: 'Advanced',
        stack: 'Python + LLM API + LangChain + GitHub API + FastAPI + React + MySQL',
        description: 'Reads PRs, posts automated review comments. Bugs, security, perf, style. Stores history in MySQL.',
        whyUnique: 'Automates real dev workflow. Production-worthy tool devs actually want.',
        status: 'not-started' },
      { id: 'pr8', name: 'Multi-Agent Research Assistant', difficulty: 'Expert',
        stack: 'Python + CrewAI/LangGraph + OpenAI + Web Search + MySQL + Streamlit',
        description: '4 agents: searcher, summariser, fact-checker, writer. All memory & reports stored in MySQL.',
        whyUnique: 'Multi-agent + MySQL memory storage is unusual & impressive.',
        status: 'not-started' },
    ],
  },
  {
    id: 'p4', number: 4, name: 'Capstone: Full-Stack AI Product',
    weekStart: 22, weekEnd: 30, color: '197 100% 60%',
    focus: 'Build ONE polished AI product with real users, real metrics, real case study. Centrepiece of portfolio.',
    outcome: '1 deployed, polished AI product with real users, metrics dashboard, and case study.',
    sections: [
      { title: 'Product Thinking (Wk 22)', topics: [
        t('Jobs-To-Be-Done framework'), t('Problem statement writing'),
        t('MVP scoping: must vs nice'), t('User story mapping'),
        t('Freemium vs subscription'), t('Analyse Notion AI, Perplexity, Cursor, Copilot'),
        t('User personas'), t('PRD structure'),
        t('Competitor analysis'), t('Pricing strategy for AI'),
        t('Success metrics: DAU, retention, NPS'), t('When NOT to use AI'),
      ]},
      { title: 'Full-Stack AI Architecture (Wk 23-26)', topics: [
        t('System design: AI app components diagram'), t('Streaming AI to React frontend'),
        t('MySQL schema for AI: users, sessions, messages, usage'), t('Auth with Clerk or JWT'),
        t('Tier-based rate limiting'), t('Async queues: Celery + Redis'),
        t('File handling: PDF/image → AI'), t('React + Tailwind production patterns'),
        t('FastAPI or Node backend for AI endpoints'), t('Supabase as managed Postgres'),
        t('Token usage tracking & cost per user'), t('Prompt management & versioning in MySQL'),
        t('Webhook handling'), t('LLM error handling, fallbacks, retries'),
      ]},
      { title: 'Deployment + MLOps (Wk 27-28)', topics: [
        t('Docker for Node + FastAPI + React'), t('Railway full-stack deploy'),
        t('Vercel for React/Next'), t('GitHub Actions CI/CD'),
        t('pgvector or ChromaDB in production'), t('Structured logging'),
        t('SSL + custom domain'), t('Docker Compose multi-service'),
        t('Render for backend + workers'), t('Env management & secrets'),
        t('MySQL prod: PlanetScale or Railway'), t('Token cost dashboard'),
        t('Uptime monitoring (UptimeRobot)'), t('DB backup strategy'),
      ]},
      { title: 'AI Metrics + Evaluation (Wk 29-30)', topics: [
        t('DAU / MAU'), t('LLM response rating system'),
        t('Token usage per user per day'), t('A/B test prompts'),
        t('Retention: D1, D7, D30'), t('Latency: P50, P95, P99'),
        t('Funnel analysis'), t('Eval datasets / ground truth'),
        t('RAGAS automated RAG eval'), t('Product case study doc'),
        t('PostHog product analytics'), t('Demo video + README'),
      ]},
    ],
    projects: [
      { id: 'pr9', name: 'AI SaaS: Legal Doc Analyser for Indian SMEs', difficulty: 'Expert',
        stack: 'React + FastAPI + Node + MySQL + LangChain + OpenAI + pgvector + Razorpay',
        description: 'SME uploads contract. AI extracts clauses, flags risk, summarises in plain English + Hindi. Freemium → Razorpay.',
        whyUnique: 'India-specific + real monetisation + payments = production SaaS.',
        status: 'not-started' },
      { id: 'pr10', name: 'AI Interview Coach Platform', difficulty: 'Expert',
        stack: 'React + Node + Express + MySQL + OpenAI + Whisper + Socket.io',
        description: 'Voice mock interviews. Whisper transcription. Quality scoring. Progress tracking over sessions.',
        whyUnique: 'Voice AI + real-time + DB tracking. Massive addressable market.',
        status: 'not-started' },
      { id: 'pr11', name: 'Vernacular AI Support Bot Builder', difficulty: 'Expert',
        stack: 'React + Node + MySQL + LangChain + RAG + OpenAI + Twilio/WhatsApp',
        description: 'SMBs upload catalog/FAQs → auto-built WhatsApp bot in regional language. No-code setup.',
        whyUnique: 'WhatsApp + regional + no-code = immediately freelanceable in India.',
        status: 'not-started' },
    ],
  },
  {
    id: 'p5', number: 5, name: 'DSA + System Design + Interview Prep',
    weekStart: 31, weekEnd: 40, color: '14 90% 60%',
    focus: 'Run DSA in PARALLEL from Phase 3 onwards — 1 hr/day minimum. Most interviews test DSA regardless of AI skills.',
    outcome: '100+ LeetCode solved + 3 mock interviews + resume reviewed + applying actively.',
    sections: [
      { title: 'Data Structures (Wk 31-33)', topics: [
        t('Arrays: two pointers, sliding window, prefix sum'), t('Strings: palindrome, anagram patterns'),
        t('Linked List: reverse, cycle, merge, middle'), t('Stack: monotonic, valid parens, next greater'),
        t('Queue + Deque: sliding window max, BFS'), t('HashMap/Set: frequency, two-sum, grouping'),
        t('Binary Search: standard + on answer space'), t('Trees: BFS, DFS, height, diameter, LCA'),
        t('BST: insert, delete, validate, floor/ceiling'), t('Heaps: top-K, merge K, median stream'),
        t('Tries: insert, search, prefix, autocomplete'), t('Graphs: adj list, BFS, DFS, topo sort'),
        t('Union-Find (DSU)'), t('Segment Trees (optional)'),
      ]},
      { title: 'Algorithms (Wk 33-36)', topics: [
        t('Recursion: base case, memoization'), t('Backtracking: subsets, permutations, N-Queens'),
        t('DP 1D: stairs, house robber, coin change'), t('DP 2D: grid paths, edit distance, LCS'),
        t('DP on strings'), t('DP on trees: diameter, max path sum'),
        t('Greedy: intervals, jump game, gas station'), t('Divide & Conquer: merge/quick sort'),
        t('Bit Manipulation: AND/OR/XOR'), t('Sorting algorithms'),
        t('Sliding window patterns'), t('Two pointers: 3Sum, container water'),
        t('Graph algos: Dijkstra, Bellman-Ford, Floyd-Warshall'), t('MST: Kruskal, Prim'),
        t('Big-O analysis (must be automatic)'), t('LeetCode pattern recognition'),
      ]},
      { title: 'CS Fundamentals (Wk 36-37)', topics: [
        t('OS: process vs thread, deadlock, paging'), t('Memory: stack vs heap, GC'),
        t('DBMS: normalisation, indexing, ACID, joins'), t('SQL: window funcs, CTEs, optimisation'),
        t('OOP: 4 pillars + SOLID'), t('Design Patterns: Singleton, Factory, Observer, Strategy'),
        t('Networks: TCP/IP, HTTP/HTTPS, DNS, REST vs gRPC'), t('System Design: scalability, LB, caching, CDN'),
        t('System Design: SQL vs NoSQL, CAP, sharding'), t('Design: URL shortener, chat, Netflix'),
        t('Microservices: when monolith vs microservices'), t('Message queues: Kafka, RabbitMQ'),
      ]},
      { title: 'Interview Execution (Wk 38-40)', topics: [
        t('LeetCode: 150+ problems (50E/80M/20H)'), t('NeetCode 150 + Striver A-Z'),
        t('Mock interviews: Pramp, Interviewing.io'), t('STAR method for behavioural'),
        t('2-min project pitch for each project'), t('Resume: ATS-friendly, 1-page, quantified'),
        t('LinkedIn: complete, 500+ connections'), t('GitHub: clean repos, pinned, READMEs'),
        t('Company research: product, stack, news'), t('Cold email alumni at target companies'),
        t('Negotiation basics'), t('Off-campus: AngelList, Wellfound, LinkedIn Jobs'),
      ]},
    ],
    projects: [],
  },
  {
    id: 'p6', number: 6, name: 'Portfolio + Freelance + Personal Brand',
    weekStart: 41, weekEnd: 48, color: '180 90% 45%',
    focus: 'Polish portfolio. Land first client or job offer. Build in public.',
    outcome: 'First freelance client OR job offer + strong portfolio + growing LinkedIn presence.',
    sections: [
      { title: 'Portfolio + GitHub (Wk 41-42)', topics: [
        t('Personal site: React + Tailwind, fast, mobile'), t('Live demos (not just screenshots)'),
        t('GitHub profile README: bio, stats, pinned'), t('Daily commits — keep graph green'),
        t('Case study page per project'), t('Loom demo videos 2-3 min/project'),
        t('Repo README standard'), t('Open source contributions (small bug fixes count)'),
      ]},
      { title: 'Freelance Strategy (Wk 42-46)', topics: [
        t('Define niche: chatbots, automation, RAG for SMEs'), t('First project: 1 free for testimonial'),
        t('Pricing: ₹30K-80K MVP AI projects (India)'), t('Productised services: fixed scope/price'),
        t('LinkedIn DM outreach to founders'), t('Contract template: scope, payment, IP'),
        t('Upwork/Toptal/Fiverr AI profile'), t('Proposals: lead with their problem'),
        t('Retainer model: monthly maintenance'), t('WhatsApp chatbot for local biz'),
        t('Partner with web agencies'), t('Manage client expectations on AI limits'),
      ]},
      { title: 'Build in Public (Wk 41-48)', topics: [
        t('LinkedIn: 2 posts/week on what you build'), t('Dev.to/Hashnode technical articles'),
        t('Engage: LangChain Discord, HF forums'), t('Hackathons: SIH, MLH, Devfolio'),
        t('Twitter/X: daily learnings'), t('YouTube Shorts: 60-sec demos'),
        t('Local college talks'), t('Weekly newsletter'),
      ]},
    ],
    projects: [],
  },
];

// =============================================================================
// STORAGE
// =============================================================================

const KEYS = {
  submissions: 'devstreak_submissions_v2',
  phases: 'devstreak_phases_v2',
  reflections: 'devstreak_reflections_v2',
  startDate: 'devstreak_start_v2',
  goals: 'devstreak_goals_v2',
};

function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
  try { window.dispatchEvent(new CustomEvent('devstreak:changed', { detail: { key } })); } catch {}
}

// =============================================================================
// PHASES
// =============================================================================

export function getPhases(): Phase[] {
  const stored = load<Phase[] | null>(KEYS.phases, null);
  // Migration: if user has old data (or old P7 ongoing), reset to roadmap
  if (!stored || !Array.isArray(stored) || stored.length !== ROADMAP_PHASES.length || !stored[0]?.sections || stored.some((p: Phase) => p.number === 7)) {
    save(KEYS.phases, ROADMAP_PHASES);
    return ROADMAP_PHASES;
  }
  return stored;
}

export function resetRoadmap() {
  save(KEYS.phases, ROADMAP_PHASES);
}

export function toggleTopic(phaseId: string, sectionIdx: number, topicId: string, proof?: { url?: string; notes?: string }): Phase[] {
  const phases = getPhases();
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return phases;
  const topic = phase.sections[sectionIdx]?.topics.find(t => t.id === topicId);
  if (!topic) return phases;
  topic.completed = !topic.completed;
  if (topic.completed) {
    topic.completedAt = new Date().toISOString();
    if (proof?.url) topic.proofUrl = proof.url;
    if (proof?.notes) topic.proofNotes = proof.notes;
  } else {
    topic.completedAt = undefined;
    topic.proofUrl = undefined;
    topic.proofNotes = undefined;
  }
  save(KEYS.phases, phases);
  return [...phases];
}

export function updateProject(phaseId: string, projectId: string, updates: Partial<Project>): Phase[] {
  const phases = getPhases();
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return phases;
  const project = phase.projects.find(pr => pr.id === projectId);
  if (!project) return phases;
  Object.assign(project, updates);
  if (updates.status === 'shipped' && !project.shippedAt) project.shippedAt = new Date().toISOString();
  save(KEYS.phases, phases);
  return [...phases];
}

export function getPhaseProgress(phase: Phase): { topicsTotal: number; topicsDone: number; pct: number; projectsShipped: number; projectsTotal: number } {
  const all = phase.sections.flatMap(s => s.topics);
  const done = all.filter(t => t.completed).length;
  const projectsShipped = phase.projects.filter(p => p.status === 'shipped').length;
  return {
    topicsTotal: all.length,
    topicsDone: done,
    pct: all.length ? Math.round((done / all.length) * 100) : 0,
    projectsShipped,
    projectsTotal: phase.projects.length,
  };
}

export function getOverallProgress(): number {
  const phases = getPhases();
  const all = phases.flatMap(p => p.sections.flatMap(s => s.topics));
  const done = all.filter(t => t.completed).length;
  return all.length ? Math.round((done / all.length) * 100) : 0;
}

export function getActivePhase(): Phase {
  const phases = getPhases();
  // Active = first phase that's not 100% complete
  for (const p of phases) {
    const prog = getPhaseProgress(p);
    if (prog.pct < 100) return p;
  }
  return phases[phases.length - 1]; // fallback to last phase
}

// =============================================================================
// DAILY CHALLENGES (anti-cheat: must have proof)
// =============================================================================

// Deterministic daily challenge based on date + active phase
export function getTodayChallenge(): { topic: Topic; phase: Phase; sectionTitle: string } | null {
  const phase = getActivePhase();
  const incomplete = phase.sections.flatMap((s, si) =>
    s.topics.filter(t => !t.completed).map(t => ({ topic: t, sectionTitle: s.title, sectionIdx: si }))
  );
  if (incomplete.length === 0) return null;

  // Deterministic by date — same challenge all day
  const today = format(new Date(), 'yyyy-MM-dd');
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = (hash * 31 + today.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % incomplete.length;
  return { topic: incomplete[idx].topic, phase, sectionTitle: incomplete[idx].sectionTitle };
}

// =============================================================================
// SUBMISSIONS (proof-required logging)
// =============================================================================

export function getSubmissions(): DailySubmission[] {
  return load<DailySubmission[]>(KEYS.submissions, []);
}

export function addSubmission(s: Omit<DailySubmission, 'id' | 'verified' | 'createdAt'>): { ok: boolean; error?: string; submission?: DailySubmission } {
  // Validation: anti-cheat
  if (s.minutesStudied < 15) return { ok: false, error: 'Minimum 15 minutes required.' };
  if (s.minutesStudied > 720) return { ok: false, error: 'Max 12 hours/day. Be honest.' };
  if (!s.proofNotes || s.proofNotes.trim().length < 80) {
    return { ok: false, error: 'Proof notes must be at least 80 characters. Describe what you actually did.' };
  }
  const hasAttachments = (s.attachments?.length ?? 0) > 0;
  if (s.proofType !== 'notes' && s.proofType !== 'leetcode' && !hasAttachments && (!s.proofUrl || !/^https?:\/\//.test(s.proofUrl))) {
    return { ok: false, error: 'A valid proof URL or an attached file is required for commit/deploy submissions.' };
  }

  // Heuristic verification
  const verified = hasAttachments
    ? true
    : s.proofType === 'commit'
    ? /github\.com|gitlab\.com|bitbucket\.org/i.test(s.proofUrl || '')
    : s.proofType === 'deploy'
      ? /https?:\/\//.test(s.proofUrl || '')
      : s.proofNotes.trim().length >= 150;

  const submission: DailySubmission = {
    ...s,
    id: crypto.randomUUID?.() ?? Math.random().toString(36),
    verified,
    createdAt: new Date().toISOString(),
  };

  const all = getSubmissions();
  all.push(submission);
  save(KEYS.submissions, all);
  return { ok: true, submission };
}

export function getTodaySubmissions(): DailySubmission[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getSubmissions().filter(s => s.date === today);
}

// =============================================================================
// STREAK & STATS
// =============================================================================

export function getStreak(): { current: number; longest: number; isAtRisk: boolean; loggedToday: boolean } {
  const subs = getSubmissions();
  const dates = new Set(subs.map(s => s.date));
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const loggedToday = dates.has(today);

  let current = 0;
  let cursor = loggedToday ? new Date() : (dates.has(yesterday) ? subDays(new Date(), 1) : null);
  if (cursor) {
    while (dates.has(format(cursor, 'yyyy-MM-dd'))) {
      current++;
      cursor = subDays(cursor, 1);
    }
  }

  const sorted = Array.from(dates).sort();
  let longest = 0, temp = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) temp = 1;
    else {
      const diff = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
      temp = diff === 1 ? temp + 1 : 1;
    }
    longest = Math.max(longest, temp);
  }
  return { current, longest, isAtRisk: !loggedToday, loggedToday };
}

// LeetCode-style activity heatmap (last 12 weeks)
export function getActivityHeatmap(): { date: string; count: number; minutes: number }[] {
  const subs = getSubmissions();
  const days = 84;
  const result: { date: string; count: number; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const daySubs = subs.filter(s => s.date === date);
    result.push({
      date,
      count: daySubs.length,
      minutes: daySubs.reduce((s, x) => s + x.minutesStudied, 0),
    });
  }
  return result;
}

export function getWeeklyStats() {
  const subs = getSubmissions();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const week = subs.filter(s => {
    const d = parseISO(s.date);
    return d >= weekStart && d <= weekEnd;
  });
  return {
    submissions: week.length,
    minutes: week.reduce((s, x) => s + x.minutesStudied, 0),
    leetcode: week.reduce((s, x) => s + x.leetcodeProblems, 0),
    daysActive: new Set(week.map(s => s.date)).size,
  };
}

export function getTotalLeetcode(): number {
  return getSubmissions().reduce((s, x) => s + x.leetcodeProblems, 0);
}

// =============================================================================
// ROADMAP ALIGNMENT (14-month timeline)
// =============================================================================

export function getStartDate(): string | null {
  return load<string | null>(KEYS.startDate, null);
}
export function setStartDate(d: string) { save(KEYS.startDate, d); }

export function getRoadmapAlignment() {
  const start = getStartDate();
  if (!start) return null;
  const days = differenceInCalendarDays(new Date(), parseISO(start));
  const week = Math.floor(days / 7) + 1;
  const phases = getPhases();

  let expectedPhase = phases[0];
  for (const p of phases) {
    if (week >= p.weekStart && week <= p.weekEnd) { expectedPhase = p; break; }
    if (week > p.weekEnd) expectedPhase = p;
  }

  const totalWeeks = 48;
  const expectedPct = Math.min(100, Math.round((week / totalWeeks) * 100));
  const actualPct = getOverallProgress();
  const behindPct = expectedPct - actualPct;

  // Prediction: at current pace, when will you finish?
  // Pace = actualPct / daysSinceStart (only meaningful after a few days)
  let predictedFinishDays: number | null = null;
  let predictedFinishMonths: number | null = null;
  let delayDays: number | null = null;
  if (days >= 3 && actualPct > 0) {
    const pacePctPerDay = actualPct / days;
    const remainingPct = 100 - actualPct;
    predictedFinishDays = Math.round(remainingPct / pacePctPerDay);
    predictedFinishMonths = Math.round((predictedFinishDays / 30) * 10) / 10;
    const targetDays = totalWeeks * 7; // 336 days
    const totalProjectedDays = days + predictedFinishDays;
    delayDays = totalProjectedDays - targetDays;
  }

  return {
    daysSinceStart: days,
    currentWeek: week,
    expectedPhaseNumber: expectedPhase.number,
    expectedPhaseName: expectedPhase.name,
    expectedPct,
    actualPct,
    behindPct,
    onTrack: behindPct <= 5,
    predictedFinishDays,
    predictedFinishMonths,
    delayDays,
  };
}

// =============================================================================
// REFLECTIONS
// =============================================================================

export function getReflections(): WeeklyReflection[] {
  return load<WeeklyReflection[]>(KEYS.reflections, []);
}

export function addReflection(r: Omit<WeeklyReflection, 'id' | 'createdAt'>): WeeklyReflection {
  const all = getReflections();
  const nr: WeeklyReflection = {
    ...r,
    id: crypto.randomUUID?.() ?? Math.random().toString(36),
    createdAt: new Date().toISOString(),
  };
  all.push(nr);
  save(KEYS.reflections, all);
  return nr;
}

// =============================================================================
// HONEST INSIGHTS (no fake coaching — just facts)
// =============================================================================

export function getHonestStatus(): { tone: 'good' | 'warn' | 'bad'; line: string }[] {
  const out: { tone: 'good' | 'warn' | 'bad'; line: string }[] = [];
  const subs = getSubmissions();
  const streak = getStreak();
  const week = getWeeklyStats();
  const align = getRoadmapAlignment();

  if (subs.length === 0) {
    out.push({ tone: 'warn', line: 'No submissions yet. Solve today\'s challenge to start your streak.' });
    return out;
  }

  if (!streak.loggedToday) {
    out.push({ tone: 'bad', line: `You haven\'t submitted today. ${streak.current > 0 ? `${streak.current}-day streak ends at midnight.` : ''}` });
  } else {
    out.push({ tone: 'good', line: `Logged today. Streak: ${streak.current} day${streak.current === 1 ? '' : 's'}.` });
  }

  if (week.daysActive < 4 && new Date().getDay() >= 4) {
    out.push({ tone: 'warn', line: `Only ${week.daysActive} active days this week. Below 5/week is a yellow flag.` });
  }

  if (align && align.behindPct > 10) {
    out.push({ tone: 'bad', line: `You are ${align.behindPct}% behind your roadmap. Expected: Phase ${align.expectedPhaseNumber}.` });
  } else if (align && align.onTrack) {
    out.push({ tone: 'good', line: `On track for Week ${align.currentWeek}. Phase ${align.expectedPhaseNumber} target.` });
  }

  const unverified = subs.slice(-7).filter(s => !s.verified).length;
  if (unverified >= 3) {
    out.push({ tone: 'warn', line: `${unverified} of last 7 submissions lack strong proof (commit/deploy URL).` });
  }

  return out;
}
