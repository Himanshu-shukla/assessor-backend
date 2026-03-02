export const questionsData = [
  // ---------------- JavaScript ----------------
  {
    skill: "JavaScript",
    subtopic: "closures",
    difficulty: "intermediate",
    text: "What is a closure in JavaScript?",
    options: [
      { id: "a", text: "A function that has access to variables from its outer scope even after the outer function has returned" },
      { id: "b", text: "A way to close browser windows" },
      { id: "c", text: "A method to end loop execution" },
      { id: "d", text: "A syntax for error handling" }
    ],
    correctOption: "a"
  },
  {
    skill: "JavaScript",
    subtopic: "promises",
    difficulty: "intermediate",
    text: "What method is used to handle successful completion of a Promise?",
    options: [
      { id: "a", text: "catch()" },
      { id: "b", text: "finally()" },
      { id: "c", text: "then()" },
      { id: "d", text: "error()" }
    ],
    correctOption: "c"
  },
  {
    skill: "JavaScript",
    subtopic: "hoisting",
    difficulty: "beginner",
    text: "What is hoisting in JavaScript?",
    options: [
      { id: "a", text: "Moving declarations to the top of their scope before code execution" },
      { id: "b", text: "Lifting heavy objects in memory" },
      { id: "c", text: "A method to elevate errors" },
      { id: "d", text: "Raising event priorities" }
    ],
    correctOption: "a"
  },
  {
    skill: "JavaScript",
    subtopic: "arrow functions",
    difficulty: "beginner",
    text: "How do arrow functions differ from regular functions regarding 'this'?",
    options: [
      { id: "a", text: "They have their own 'this' binding" },
      { id: "b", text: "They don't have their own 'this' and inherit from parent scope" },
      { id: "c", text: "They always bind 'this' to the window object" },
      { id: "d", text: "They cannot use 'this' at all" }
    ],
    correctOption: "b"
  },
  {
    skill: "JavaScript",
    subtopic: "event delegation",
    difficulty: "advanced",
    text: "What is event delegation in JavaScript?",
    options: [
      { id: "a", text: "Assigning events to parent elements to handle events from children" },
      { id: "b", text: "Delegating event handling to another thread" },
      { id: "c", text: "Creating multiple event listeners" },
      { id: "d", text: "Passing events as function parameters" }
    ],
    correctOption: "a"
  },

  // ---------------- Node.js ----------------
  {
    skill: "Node.js",
    subtopic: "event loop",
    difficulty: "beginner",
    text: "What is the purpose of the Node.js event loop?",
    options: [
      { id: "a", text: "Handle synchronous code" },
      { id: "b", text: "Enable non-blocking I/O operations" },
      { id: "c", text: "Manage database connections" },
      { id: "d", text: "Compile JavaScript" }
    ],
    correctOption: "b"
  },
  {
    skill: "Node.js",
    subtopic: "clustering",
    difficulty: "advanced",
    text: "Why is Node.js clustering used?",
    options: [
      { id: "a", text: "To scale across CPU cores" },
      { id: "b", text: "To optimize memory leaks" },
      { id: "c", text: "To manage sessions" },
      { id: "d", text: "To handle async operations" }
    ],
    correctOption: "a"
  },
  {
    skill: "Node.js",
    subtopic: "streams",
    difficulty: "intermediate",
    text: "What are streams in Node.js primarily used for?",
    options: [
      { id: "a", text: "Handling large amounts of data efficiently" },
      { id: "b", text: "Creating waterfalls of promises" },
      { id: "c", text: "Managing HTTP requests only" },
      { id: "d", text: "Styling console output" }
    ],
    correctOption: "a"
  },
  {
    skill: "Node.js",
    subtopic: "middleware",
    difficulty: "intermediate",
    text: "In Express.js, what is middleware?",
    options: [
      { id: "a", text: "Functions that have access to request and response objects" },
      { id: "b", text: "Middle layer of the database" },
      { id: "c", text: "The core Node.js module" },
      { id: "d", text: "A type of routing protocol" }
    ],
    correctOption: "a"
  },
  {
    skill: "Node.js",
    subtopic: "npm",
    difficulty: "beginner",
    text: "What does the 'npm install' command do?",
    options: [
      { id: "a", text: "Installs dependencies listed in package.json" },
      { id: "b", text: "Installs Node.js globally" },
      { id: "c", text: "Creates a new Node.js project" },
      { id: "d", text: "Updates npm itself" }
    ],
    correctOption: "a"
  },

  // ---------------- MongoDB ----------------
  {
    skill: "MongoDB",
    subtopic: "indexing",
    difficulty: "intermediate",
    text: "What is the purpose of an index in MongoDB?",
    options: [
      { id: "a", text: "Reduce storage" },
      { id: "b", text: "Speed up queries" },
      { id: "c", text: "Encrypt data" },
      { id: "d", text: "Prevent duplication" }
    ],
    correctOption: "b"
  },
  {
    skill: "MongoDB",
    subtopic: "aggregation",
    difficulty: "advanced",
    text: "What is the MongoDB aggregation framework used for?",
    options: [
      { id: "a", text: "Data processing and transformation" },
      { id: "b", text: "Creating database backups" },
      { id: "c", text: "User authentication" },
      { id: "d", text: "Schema validation" }
    ],
    correctOption: "a"
  },
  {
    skill: "MongoDB",
    subtopic: "replication",
    difficulty: "intermediate",
    text: "What is the primary purpose of replication in MongoDB?",
    options: [
      { id: "a", text: "Data redundancy and high availability" },
      { id: "b", text: "Faster query execution" },
      { id: "c", text: "Data compression" },
      { id: "d", text: "Automatic sharding" }
    ],
    correctOption: "a"
  },
  {
    skill: "MongoDB",
    subtopic: "sharding",
    difficulty: "advanced",
    text: "When should you consider sharding in MongoDB?",
    options: [
      { id: "a", text: "When data doesn't fit on a single server" },
      { id: "b", text: "When you need backups" },
      { id: "c", text: "For every MongoDB deployment" },
      { id: "d", text: "When using replica sets" }
    ],
    correctOption: "a"
  },
  {
    skill: "MongoDB",
    subtopic: "CRUD",
    difficulty: "beginner",
    text: "Which method is used to insert multiple documents in MongoDB?",
    options: [
      { id: "a", text: "insertMany()" },
      { id: "b", text: "insertMultiple()" },
      { id: "c", text: "addMany()" },
      { id: "d", text: "pushMany()" }
    ],
    correctOption: "a"
  },

  // ---------------- React ----------------
  {
    skill: "React",
    subtopic: "hooks",
    difficulty: "beginner",
    text: "Which hook is used for managing state in functional components?",
    options: [
      { id: "a", text: "useEffect" },
      { id: "b", text: "useState" },
      { id: "c", text: "useMemo" },
      { id: "d", text: "useRef" }
    ],
    correctOption: "b"
  },
  {
    skill: "React",
    subtopic: "lifecycle",
    difficulty: "intermediate",
    text: "Which lifecycle method is equivalent to useEffect with empty dependency array?",
    options: [
      { id: "a", text: "componentDidMount" },
      { id: "b", text: "componentWillUnmount" },
      { id: "c", text: "shouldComponentUpdate" },
      { id: "d", text: "getDerivedStateFromProps" }
    ],
    correctOption: "a"
  },
  {
    skill: "React",
    subtopic: "props",
    difficulty: "beginner",
    text: "What are props in React?",
    options: [
      { id: "a", text: "Read-only data passed from parent to child" },
      { id: "b", text: "Mutable component state" },
      { id: "c", text: "Internal component methods" },
      { id: "d", text: "React component templates" }
    ],
    correctOption: "a"
  },
  {
    skill: "React",
    subtopic: "virtual DOM",
    difficulty: "intermediate",
    text: "What is the main benefit of React's virtual DOM?",
    options: [
      { id: "a", text: "Improved performance by minimizing direct DOM manipulation" },
      { id: "b", text: "Direct access to browser DOM" },
      { id: "c", text: "Automatic CSS injection" },
      { id: "d", text: "Server-side rendering only" }
    ],
    correctOption: "a"
  },
  {
    skill: "React",
    subtopic: "context",
    difficulty: "intermediate",
    text: "When should you use React Context?",
    options: [
      { id: "a", text: "For passing data through many levels of components" },
      { id: "b", text: "For all state management needs" },
      { id: "c", text: "Instead of component props" },
      { id: "d", text: "Only for theme switching" }
    ],
    correctOption: "a"
  },

  // ---------------- TypeScript ----------------
  {
    skill: "TypeScript",
    subtopic: "types",
    difficulty: "beginner",
    text: "What is the difference between 'interface' and 'type' in TypeScript?",
    options: [
      { id: "a", text: "Interfaces can be extended, types cannot" },
      { id: "b", text: "Types can be extended, interfaces cannot" },
      { id: "c", text: "They are completely identical" },
      { id: "d", text: "Interfaces are for classes only" }
    ],
    correctOption: "a"
  },
  {
    skill: "TypeScript",
    subtopic: "generics",
    difficulty: "advanced",
    text: "What is the purpose of generics in TypeScript?",
    options: [
      { id: "a", text: "Create reusable components that work with multiple types" },
      { id: "b", text: "Generate random types" },
      { id: "c", text: "Create generic classes only" },
      { id: "d", text: "Replace all any types" }
    ],
    correctOption: "a"
  },
  {
    skill: "TypeScript",
    subtopic: "utility types",
    difficulty: "intermediate",
    text: "What does the 'Partial<T>' utility type do?",
    options: [
      { id: "a", text: "Makes all properties of T optional" },
      { id: "b", text: "Makes all properties of T required" },
      { id: "c", text: "Removes all properties of T" },
      { id: "d", text: "Creates a partial copy of T" }
    ],
    correctOption: "a"
  },
  {
    skill: "TypeScript",
    subtopic: "decorators",
    difficulty: "advanced",
    text: "What are decorators in TypeScript?",
    options: [
      { id: "a", text: "Special declarations that can modify classes or members" },
      { id: "b", text: "Methods to decorate UI elements" },
      { id: "c", text: "CSS style modifiers" },
      { id: "d", text: "HTML template decorators" }
    ],
    correctOption: "a"
  },
  {
    skill: "TypeScript",
    subtopic: "union types",
    difficulty: "beginner",
    text: "How do you define a variable that can be either string or number?",
    options: [
      { id: "a", text: "let x: string | number;" },
      { id: "b", text: "let x: string & number;" },
      { id: "c", text: "let x: string || number;" },
      { id: "d", text: "let x: [string, number];" }
    ],
    correctOption: "a"
  },

  // ---------------- Python ----------------
  {
    skill: "Python",
    subtopic: "list comprehension",
    difficulty: "intermediate",
    text: "What is list comprehension in Python?",
    options: [
      { id: "a", text: "A concise way to create lists" },
      { id: "b", text: "A method to understand lists" },
      { id: "c", text: "A debugging tool for lists" },
      { id: "d", text: "A list documentation generator" }
    ],
    correctOption: "a"
  },
  {
    skill: "Python",
    subtopic: "decorators",
    difficulty: "advanced",
    text: "What is the purpose of decorators in Python?",
    options: [
      { id: "a", text: "Modify or enhance functions without changing their code" },
      { id: "b", text: "Decorate the output with styling" },
      { id: "c", text: "Create graphical decorations" },
      { id: "d", text: "Add comments to functions" }
    ],
    correctOption: "a"
  },
  {
    skill: "Python",
    subtopic: "GIL",
    difficulty: "advanced",
    text: "What is the Global Interpreter Lock (GIL) in Python?",
    options: [
      { id: "a", text: "A mutex that allows only one thread to execute at a time" },
      { id: "b", text: "A global variable locker" },
      { id: "c", text: "A security feature" },
      { id: "d", text: "A memory management tool" }
    ],
    correctOption: "a"
  },
  {
    skill: "Python",
    subtopic: "generators",
    difficulty: "intermediate",
    text: "What does the 'yield' keyword do in Python?",
    options: [
      { id: "a", text: "Creates a generator function" },
      { id: "b", text: "Returns a value and exits the function" },
      { id: "c", text: "Pauses program execution" },
      { id: "d", text: "Yields control to another thread" }
    ],
    correctOption: "a"
  },
  {
    skill: "Python",
    subtopic: "lambda",
    difficulty: "beginner",
    text: "What is a lambda function in Python?",
    options: [
      { id: "a", text: "A small anonymous function defined with lambda keyword" },
      { id: "b", text: "A mathematical function" },
      { id: "c", text: "A lambda calculus implementation" },
      { id: "d", text: "A built-in function for lists" }
    ],
    correctOption: "a"
  },

  // ---------------- SQL ----------------
  {
    skill: "SQL",
    subtopic: "joins",
    difficulty: "intermediate",
    text: "What does an INNER JOIN return?",
    options: [
      { id: "a", text: "Only records with matching values in both tables" },
      { id: "b", text: "All records from the left table" },
      { id: "c", text: "All records from both tables" },
      { id: "d", text: "Records that don't match" }
    ],
    correctOption: "a"
  },
  {
    skill: "SQL",
    subtopic: "indexes",
    difficulty: "intermediate",
    text: "Why would you create an index on a database column?",
    options: [
      { id: "a", text: "To speed up SELECT queries on that column" },
      { id: "b", text: "To increase storage space" },
      { id: "c", text: "To make column nullable" },
      { id: "d", text: "To encrypt column data" }
    ],
    correctOption: "a"
  },
  {
    skill: "SQL",
    subtopic: "normalization",
    difficulty: "advanced",
    text: "What is database normalization?",
    options: [
      { id: "a", text: "Process of organizing data to reduce redundancy" },
      { id: "b", text: "Making database normal" },
      { id: "c", text: "Standardizing SQL queries" },
      { id: "d", text: "Creating database backups" }
    ],
    correctOption: "a"
  },
  {
    skill: "SQL",
    subtopic: "transactions",
    difficulty: "advanced",
    text: "What does ACID stand for in database transactions?",
    options: [
      { id: "a", text: "Atomicity, Consistency, Isolation, Durability" },
      { id: "b", text: "Availability, Consistency, Isolation, Durability" },
      { id: "c", text: "Atomicity, Consistency, Integrity, Durability" },
      { id: "d", text: "Atomicity, Consistency, Isolation, Database" }
    ],
    correctOption: "a"
  },
  {
    skill: "SQL",
    subtopic: "aggregation",
    difficulty: "beginner",
    text: "Which SQL function calculates the average of a column?",
    options: [
      { id: "a", text: "AVG()" },
      { id: "b", text: "SUM()" },
      { id: "c", text: "COUNT()" },
      { id: "d", text: "MEAN()" }
    ],
    correctOption: "a"
  },

  // ---------------- HTML/CSS ----------------
  {
    skill: "HTML/CSS",
    subtopic: "flexbox",
    difficulty: "intermediate",
    text: "What does 'justify-content: space-between' do in flexbox?",
    options: [
      { id: "a", text: "Distributes items evenly with first at start and last at end" },
      { id: "b", text: "Centers all items" },
      { id: "c", text: "Creates equal space around items" },
      { id: "d", text: "Aligns items vertically" }
    ],
    correctOption: "a"
  },
  {
    skill: "HTML/CSS",
    subtopic: "positioning",
    difficulty: "intermediate",
    text: "What is the difference between 'position: relative' and 'absolute'?",
    options: [
      { id: "a", text: "Relative positions relative to itself, absolute relative to nearest positioned ancestor" },
      { id: "b", text: "They are the same" },
      { id: "c", text: "Relative is always relative to document, absolute to viewport" },
      { id: "d", text: "Absolute is fixed, relative is movable" }
    ],
    correctOption: "a"
  },
  {
    skill: "HTML/CSS",
    subtopic: "semantic HTML",
    difficulty: "beginner",
    text: "Which of these is a semantic HTML element?",
    options: [
      { id: "a", text: "<article>" },
      { id: "b", text: "<div>" },
      { id: "c", text: "<span>" },
      { id: "d", text: "<b>" }
    ],
    correctOption: "a"
  },
  {
    skill: "HTML/CSS",
    subtopic: "responsive design",
    difficulty: "intermediate",
    text: "What is the purpose of media queries in CSS?",
    options: [
      { id: "a", text: "Apply different styles based on device characteristics" },
      { id: "b", text: "Query media files" },
      { id: "c", text: "Load different media types" },
      { id: "d", text: "Test CSS performance" }
    ],
    correctOption: "a"
  },
  {
    skill: "HTML/CSS",
    subtopic: "specificity",
    difficulty: "advanced",
    text: "Which selector has the highest specificity?",
    options: [
      { id: "a", text: "#id" },
      { id: "b", text: ".class" },
      { id: "c", text: "element" },
      { id: "d", text: "*" }
    ],
    correctOption: "a"
  },

  // ---------------- Git ----------------
  {
    skill: "Git",
    subtopic: "branching",
    difficulty: "beginner",
    text: "What command creates a new branch in Git?",
    options: [
      { id: "a", text: "git branch <branch-name>" },
      { id: "b", text: "git new-branch <branch-name>" },
      { id: "c", text: "git create-branch <branch-name>" },
      { id: "d", text: "git checkout -new <branch-name>" }
    ],
    correctOption: "a"
  },
  {
    skill: "Git",
    subtopic: "merging",
    difficulty: "intermediate",
    text: "What is a merge conflict in Git?",
    options: [
      { id: "a", text: "When changes in different branches conflict with each other" },
      { id: "b", text: "When two developers push simultaneously" },
      { id: "c", text: "When Git crashes" },
      { id: "d", text: "When merging unrelated repositories" }
    ],
    correctOption: "a"
  },
  {
    skill: "Git",
    subtopic: "rebasing",
    difficulty: "advanced",
    text: "What does 'git rebase' do?",
    options: [
      { id: "a", text: "Reapplies commits on top of another base branch" },
      { id: "b", text: "Deletes the base branch" },
      { id: "c", text: "Creates a new base for the repository" },
      { id: "d", text: "Reverts all commits" }
    ],
    correctOption: "a"
  },
  {
    skill: "Git",
    subtopic: "stashing",
    difficulty: "intermediate",
    text: "When would you use 'git stash'?",
    options: [
      { id: "a", text: "To temporarily save uncommitted changes" },
      { id: "b", text: "To delete all changes" },
      { id: "c", text: "To create a backup" },
      { id: "d", text: "To commit changes" }
    ],
    correctOption: "a"
  },
  {
    skill: "Git",
    subtopic: "remote",
    difficulty: "beginner",
    text: "What does 'git push' do?",
    options: [
      { id: "a", text: "Uploads local commits to remote repository" },
      { id: "b", text: "Downloads changes from remote" },
      { id: "c", text: "Creates a new remote" },
      { id: "d", text: "Deletes remote branches" }
    ],
    correctOption: "a"
  }
];