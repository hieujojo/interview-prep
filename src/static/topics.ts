export type TopicGroup = {
  group: string;
  topics: string[];
};

export const TOPIC_GROUPS: TopicGroup[] = [
  {
    group: "Frontend",
    topics: ["React", "Next.js", "HTML/CSS", "TypeScript", "Performance", "Testing"],
  },
  {
    group: "Backend",
    topics: ["Node.js", "REST API", "GraphQL", "Authentication", "Caching"],
  },
  {
    group: "Database",
    topics: ["PostgreSQL", "SQL", "NoSQL", "Database Design", "Indexing"],
  },
  {
    group: "System Design",
    topics: ["Architecture", "Scalability", "Load Balancing", "Microservices"],
  },
  {
    group: "Algorithms",
    topics: ["Data Structures", "Sorting", "Searching", "Dynamic Programming"],
  },
  {
    group: "Behavioral",
    topics: ["STAR method", "Teamwork", "Conflict", "Leadership"],
  },
  {
    group: "DevOps (cơ bản)",
    topics: ["Docker", "CI/CD", "Git workflow"],
  },
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 20] as const;