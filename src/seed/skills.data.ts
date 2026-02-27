export const skillsData = [
  // ---------------- JavaScript ----------------
  {
    name: "JavaScript",
    aliases: [
      "javascript", "js", "java script", "javscript", "javacript",
      "javascipt", "javasript", "es6", "ecmascript"
    ],
    category: "frontend",
    weight: 3,
    subtopics: [
      "closures",
      "promises",
      "async/await",
      "event loop",
      "prototypes",
      "hoisting",
      "scope",
      "this keyword",
      "arrow functions",
      "callbacks",
      "event delegation",
      "debouncing",
      "throttling",
      "currying",
      "memoization",
      "array methods",
      "spread operator",
      "destructuring",
      "type coercion",
      "error handling"
    ]
  },

  // ---------------- Node.js ----------------
  {
    name: "Node.js",
    aliases: [
      "nodejs", "node js", "node.js", "node", "nodej", "nodjs"
    ],
    category: "backend",
    weight: 2,
    subtopics: [
      "event loop",
      "streams",
      "clustering",
      "worker threads",
      "middleware",
      "async patterns",
      "event emitters",
      "file system",
      "npm",
      "package.json",
      "express.js",
      "REST API",
      "authentication",
      "JWT",
      "error handling",
      "performance monitoring",
      "memory leaks",
      "caching",
      "WebSocket",
      "environment variables"
    ]
  },

  // ---------------- MongoDB ----------------
  {
    name: "MongoDB",
    aliases: [
      "mongodb", "mongo db", "mongo", "mongod", "mngodb"
    ],
    category: "database",
    weight: 2,
    subtopics: [
      "indexing",
      "aggregation",
      "replication",
      "sharding",
      "transactions",
      "CRUD operations",
      "schema design",
      "embedded documents",
      "referencing",
      "mongoose ODM",
      "index types",
      "aggregation pipeline",
      "replica sets",
      "shard key",
      "ACID properties",
      "change streams",
      "backup and restore",
      "performance tuning",
      "authentication",
      "data modeling"
    ]
  },

  // ---------------- React ----------------
  {
    name: "React",
    aliases: [
      "reactjs", "react js", "react", "reactj", "ract"
    ],
    category: "frontend",
    weight: 2,
    subtopics: [
      "hooks",
      "useState",
      "useEffect",
      "useContext",
      "useReducer",
      "useCallback",
      "useMemo",
      "useRef",
      "custom hooks",
      "props",
      "state management",
      "context API",
      "Redux",
      "React Router",
      "lifecycle methods",
      "virtual DOM",
      "reconciliation",
      "higher order components",
      "render props",
      "code splitting",
      "lazy loading",
      "error boundaries",
      "portals",
      "refs",
      "forms",
      "controlled components",
      "uncontrolled components",
      "performance optimization",
      "React.memo",
      "useCallback vs useMemo"
    ]
  },

  // ---------------- TypeScript ----------------
  {
    name: "TypeScript",
    aliases: [
      "typescript", "ts", "type script", "typscript", "tsc"
    ],
    category: "language",
    weight: 2,
    subtopics: [
      "interfaces",
      "types",
      "generics",
      "utility types",
      "decorators",
      "union types",
      "intersection types",
      "enums",
      "tuples",
      "type assertions",
      "type guards",
      "type narrowing",
      "classes",
      "access modifiers",
      "abstract classes",
      "modules",
      "declaration files",
      "tsconfig",
      "strict mode",
      "keyof operator",
      "typeof operator",
      "mapped types",
      "conditional types",
      "React with TypeScript"
    ]
  },

  // ---------------- Python ----------------
  {
    name: "Python",
    aliases: [
      "python", "py", "python3", "py3", "pythn"
    ],
    category: "backend",
    weight: 3,
    subtopics: [
      "list comprehension",
      "decorators",
      "generators",
      "context managers",
      "lambda functions",
      "map/filter/reduce",
      "args and kwargs",
      "classes and objects",
      "inheritance",
      "magic methods",
      "modules and packages",
      "exception handling",
      "file handling",
      "virtual environments",
      "pip",
      "Flask",
      "Django",
      "FastAPI",
      "asyncio",
      "multithreading",
      "multiprocessing",
      "GIL",
      "type hints",
      "data classes",
      "unit testing"
    ]
  },

  // ---------------- SQL ----------------
  {
    name: "SQL",
    aliases: [
      "sql", "mysql", "postgresql", "postgres", "psql"
    ],
    category: "database",
    weight: 2,
    subtopics: [
      "joins",
      "indexes",
      "normalization",
      "transactions",
      "stored procedures",
      "subqueries",
      "aggregate functions",
      "GROUP BY",
      "HAVING",
      "window functions",
      "CTE",
      "views",
      "triggers",
      "ACID properties",
      "isolation levels",
      "deadlocks",
      "query optimization",
      "execution plan",
      "primary key",
      "foreign key",
      "constraints",
      "data types",
      "CRUD operations"
    ]
  },

  // ---------------- HTML/CSS ----------------
  {
    name: "HTML/CSS",
    aliases: [
      "html", "css", "html5", "css3", "html css"
    ],
    category: "frontend",
    weight: 1,
    subtopics: [
      "semantic HTML",
      "flexbox",
      "grid",
      "positioning",
      "box model",
      "specificity",
      "cascade",
      "inheritance",
      "responsive design",
      "media queries",
      "animations",
      "transitions",
      "transforms",
      "pseudo-classes",
      "pseudo-elements",
      "CSS variables",
      "CSS units",
      "accessibility",
      "forms",
      "SVG",
      "canvas",
      "CSS frameworks"
    ]
  },

  // ---------------- Git ----------------
  {
    name: "Git",
    aliases: [
      "git", "github", "gitlab", "version control"
    ],
    category: "devops",
    weight: 1,
    subtopics: [
      "branching",
      "merging",
      "rebasing",
      "stashing",
      "cherry-pick",
      "reset",
      "revert",
      "fetch",
      "pull",
      "push",
      "clone",
      "commit",
      "log",
      "diff",
      "merge conflicts",
      "remote repositories",
      "tags",
      "gitignore",
      "hooks",
      "pull requests",
      "forking workflow",
      "git flow",
      "reflog",
      "bisect",
      "submodules"
    ]
  },

  // ---------------- Docker ----------------
  {
    name: "Docker",
    aliases: [
      "docker", "docker container", "doker"
    ],
    category: "devops",
    weight: 2,
    subtopics: [
      "containers",
      "images",
      "Dockerfile",
      "docker-compose",
      "docker swarm",
      "volumes",
      "networks",
      "registry",
      "Docker Hub",
      "multi-stage builds",
      "layers",
      "caching",
      "security",
      "Docker commands",
      "container orchestration",
      "Docker vs VM"
    ]
  },

  // ---------------- Kubernetes ----------------
  {
    name: "Kubernetes",
    aliases: [
      "kubernetes", "k8s", "kube", "kubenetes"
    ],
    category: "devops",
    weight: 3,
    subtopics: [
      "pods",
      "deployments",
      "services",
      "configmaps",
      "secrets",
      "ingress",
      "volumes",
      "persistent volumes",
      "statefulsets",
      "daemonsets",
      "jobs",
      "cronjobs",
      "namespaces",
      "RBAC",
      "service accounts",
      "network policies",
      "helm",
      "kubectl commands",
      "scaling",
      "rolling updates",
      "probes",
      "configMaps"
    ]
  },

  // ---------------- AWS ----------------
  {
    name: "AWS",
    aliases: [
      "aws", "amazon web services", "amazon aws"
    ],
    category: "devops",
    weight: 3,
    subtopics: [
      "EC2",
      "S3",
      "Lambda",
      "API Gateway",
      "DynamoDB",
      "RDS",
      "VPC",
      "IAM",
      "CloudFormation",
      "CloudWatch",
      "Route 53",
      "SQS",
      "SNS",
      "Elastic Beanstalk",
      "ECS",
      "EKS",
      "Fargate",
      "CloudFront",
      "load balancing",
      "auto scaling",
      "security groups"
    ]
  },

  // ---------------- System Design ----------------
  {
    name: "System Design",
    aliases: [
      "system design", "architecture", "high level design", "HLD"
    ],
    category: "architecture",
    weight: 3,
    subtopics: [
      "load balancing",
      "caching",
      "database scaling",
      "microservices",
      "monolith vs microservices",
      "message queues",
      "CDN",
      "consistent hashing",
      "CAP theorem",
      "ACID vs BASE",
      "SQL vs NoSQL",
      "horizontal scaling",
      "vertical scaling",
      "sharding",
      "replication",
      "event-driven architecture",
      "web sockets",
      "API design",
      "rate limiting",
      "idempotency",
      "distributed systems",
      "fault tolerance",
      "high availability",
      "disaster recovery",
      "design patterns",
      "URL shortener",
      "chat system",
      "social media feed"
    ]
  },

  // ---------------- Data Structures & Algorithms ----------------
  {
    name: "DSA",
    aliases: [
      "dsa", "data structures", "algorithms", "data structures and algorithms"
    ],
    category: "core",
    weight: 3,
    subtopics: [
      "arrays",
      "linked lists",
      "stacks",
      "queues",
      "trees",
      "binary trees",
      "binary search trees",
      "heaps",
      "graphs",
      "hash tables",
      "sorting algorithms",
      "searching algorithms",
      "dynamic programming",
      "recursion",
      "backtracking",
      "BFS",
      "DFS",
      "Dijkstra",
      "two pointers",
      "sliding window",
      "greedy algorithms",
      "divide and conquer",
      "time complexity",
      "space complexity",
      "Big O notation"
    ]
  },

  // ---------------- OOP ----------------
  {
    name: "OOP",
    aliases: [
      "oop", "object oriented programming", "object oriented"
    ],
    category: "core",
    weight: 2,
    subtopics: [
      "classes",
      "objects",
      "inheritance",
      "polymorphism",
      "encapsulation",
      "abstraction",
      "interfaces",
      "abstract classes",
      "method overloading",
      "method overriding",
      "constructors",
      "destructors",
      "access modifiers",
      "SOLID principles",
      "design patterns",
      "factory pattern",
      "singleton pattern",
      "observer pattern",
      "strategy pattern",
      "dependency injection"
    ]
  },

  // ---------------- GraphQL ----------------
  {
    name: "GraphQL",
    aliases: [
      "graphql", "graph ql", "gql"
    ],
    category: "backend",
    weight: 2,
    subtopics: [
      "queries",
      "mutations",
      "subscriptions",
      "resolvers",
      "schema",
      "types",
      "input types",
      "enums",
      "interfaces",
      "unions",
      "fragments",
      "directives",
      "variables",
      "arguments",
      "context",
      "datasources",
      "error handling",
      "authentication",
      "authorization",
      "caching",
      "performance",
      "N+1 problem",
      "DataLoader",
      "Apollo Server",
      "Apollo Client",
      "GraphQL vs REST"
    ]
  },

  // ---------------- Redis ----------------
  {
    name: "Redis",
    aliases: [
      "redis", "cache", "redis cache"
    ],
    category: "database",
    weight: 2,
    subtopics: [
      "data types",
      "strings",
      "lists",
      "sets",
      "sorted sets",
      "hashes",
      "bitmaps",
      "hyperloglogs",
      "geospatial",
      "streams",
      "pub/sub",
      "transactions",
      "pipelining",
      "persistence",
      "RDB",
      "AOF",
      "replication",
      "sentinel",
      "clustering",
      "LRU cache",
      "TTL",
      "lua scripting",
      "performance tuning",
      "use cases",
      "caching strategies"
    ]
  },

  // ---------------- Kafka ----------------
  {
    name: "Kafka",
    aliases: [
      "kafka", "apache kafka"
    ],
    category: "architecture",
    weight: 3,
    subtopics: [
      "topics",
      "partitions",
      "producers",
      "consumers",
      "consumer groups",
      "brokers",
      "zookeeper",
      "message ordering",
      "message retention",
      "replication",
      "offsets",
      "commit log",
      "exactly once semantics",
      "at least once",
      "at most once",
      "stream processing",
      "kafka streams",
      "connect",
      "schema registry",
      "avro",
      "performance tuning",
      "monitoring",
      "security"
    ]
  },

  // ---------------- RabbitMQ ----------------
  {
    name: "RabbitMQ",
    aliases: [
      "rabbitmq", "rabbit mq"
    ],
    category: "architecture",
    weight: 2,
    subtopics: [
      "queues",
      "exchanges",
      "bindings",
      "producers",
      "consumers",
      "message acknowledgment",
      "persistence",
      "durability",
      "prefetch",
      "dead letter queues",
      "TTL",
      "routing keys",
      "direct exchange",
      "topic exchange",
      "fanout exchange",
      "headers exchange",
      "clustering",
      "mirrored queues",
      "shovels",
      "federation",
      "management UI",
      "monitoring",
      "performance"
    ]
  },

  // ---------------- CI/CD ----------------
  {
    name: "CI/CD",
    aliases: [
      "cicd", "ci cd", "continuous integration", "continuous deployment"
    ],
    category: "devops",
    weight: 2,
    subtopics: [
      "Jenkins",
      "GitHub Actions",
      "GitLab CI",
      "CircleCI",
      "Travis CI",
      "Azure DevOps",
      "pipeline",
      "stages",
      "jobs",
      "artifacts",
      "environment variables",
      "secrets management",
      "testing automation",
      "build automation",
      "deployment strategies",
      "blue-green deployment",
      "canary deployment",
      "rolling deployment",
      "feature flags",
      "rollback strategies",
      "infrastructure as code",
      "continuous testing",
      "continuous monitoring"
    ]
  },

  // ---------------- Web Security ----------------
  {
    name: "Web Security",
    aliases: [
      "security", "cybersecurity", "web security", "app security"
    ],
    category: "core",
    weight: 2,
    subtopics: [
      "CORS",
      "CSRF",
      "XSS",
      "SQL injection",
      "authentication",
      "authorization",
      "JWT",
      "OAuth",
      "OAuth2",
      "OpenID Connect",
      "SAML",
      "HTTPS",
      "SSL/TLS",
      "security headers",
      "content security policy",
      "rate limiting",
      "input validation",
      "output encoding",
      "password hashing",
      "bcrypt",
      "session management",
      "cookie security",
      "same origin policy",
      "clickjacking",
      "man in the middle"
    ]
  },

  // ---------------- Testing ----------------
  {
    name: "Testing",
    aliases: [
      "testing", "unit testing", "integration testing", "e2e testing"
    ],
    category: "core",
    weight: 2,
    subtopics: [
      "unit testing",
      "integration testing",
      "end-to-end testing",
      "functional testing",
      "regression testing",
      "smoke testing",
      "Jest",
      "Mocha",
      "Chai",
      "Jasmine",
      "Cypress",
      "Playwright",
      "Selenium",
      "Puppeteer",
      "React Testing Library",
      "JUnit",
      "PyTest",
      "test doubles",
      "mocks",
      "stubs",
      "spies",
      "fakes",
      "TDD",
      "BDD",
      "test coverage",
      "continuous testing"
    ]
  }
];