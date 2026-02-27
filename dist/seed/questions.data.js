"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionsData = void 0;
exports.questionsData = [
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
    }
];
//# sourceMappingURL=questions.data.js.map