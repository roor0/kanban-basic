import { db, boards, columns, tasks } from "./db";

async function seed() {
  console.log("Seeding database...");

  // Create AI Gateway board
  const [board] = await db
    .insert(boards)
    .values({ title: "AI Gateway" })
    .returning();

  console.log(`Created board: ${board.title}`);

  // Create Kanban columns
  const columnData = [
    { title: "Backlog", position: 0 },
    { title: "To Do", position: 1 },
    { title: "In Progress", position: 2 },
    { title: "Review", position: 3 },
    { title: "Done", position: 4 },
  ];

  const createdColumns: Record<string, string> = {};

  for (const col of columnData) {
    const [column] = await db
      .insert(columns)
      .values({ boardId: board.id, title: col.title, position: col.position })
      .returning();
    createdColumns[col.title] = column.id;
    console.log(`Created column: ${col.title}`);
  }

  // Backlog tasks
  const backlogTasks = [
    {
      title: "Project setup with Bun + Elysia",
      description: "Initialize project, TypeScript config, package.json, folder structure",
    },
    {
      title: "Environment config system",
      description: "Create .env handling with validation for API keys, Redis URL, port settings",
    },
    {
      title: "Redis integration",
      description: "Set up Redis client connection for caching, rate limiting, and storage",
    },
    {
      title: "Abstract provider base class",
      description: "Define interface for chat completion, model listing, and error handling",
    },
    {
      title: "Anthropic provider adapter",
      description: "Implement Claude integration with request/response normalization to OpenAI format",
    },
    {
      title: "OpenAI provider adapter",
      description: "Implement GPT integration as baseline provider",
    },
    {
      title: "Provider registry",
      description: "Singleton to manage available providers based on configured API keys",
    },
    {
      title: "Request router",
      description: "Route requests to correct provider based on model name or explicit provider param",
    },
    {
      title: "Model mapping config",
      description: "Map OpenAI model names to Anthropic equivalents (gpt-4o -> claude-sonnet)",
    },
    {
      title: "Fallback chain",
      description: "Auto-retry with backup provider when primary fails",
    },
    {
      title: "POST /v1/chat/completions",
      description: "Main chat endpoint with Zod validation, OpenAI-compatible request/response",
    },
    {
      title: "Streaming support (SSE)",
      description: "Server-sent events for real-time token streaming responses",
    },
    {
      title: "GET /v1/models",
      description: "List available models across all configured providers",
    },
    {
      title: "Health check endpoints",
      description: "Implement /healthz, /readyz, /livez for container orchestration",
    },
    {
      title: "API key authentication",
      description: "Bearer token auth with hashed keys stored in Redis, app context extraction",
    },
    {
      title: "Rate limiting middleware",
      description: "Per-app rate limits using Redis sliding window, X-RateLimit headers",
    },
    {
      title: "Cost tracking middleware",
      description: "Calculate token costs per request, aggregate daily usage in Redis",
    },
    {
      title: "Request logging",
      description: "Structured logging with Pino for all requests and errors",
    },
    {
      title: "Response caching",
      description: "Cache deterministic requests (temp=0) with SHA-256 keys, configurable TTL",
    },
    {
      title: "Model pricing config",
      description: "Configure per-model input/output token costs for all supported models",
    },
    {
      title: "Usage analytics endpoints",
      description: "GET /admin/costs/:appId for usage reports, model/provider breakdowns",
    },
    {
      title: "Prompt template CRUD",
      description: "Create, read, update, delete reusable prompt templates with variables",
    },
    {
      title: "Template rendering engine",
      description: "Handlebars-based variable substitution for templates",
    },
    {
      title: "Dockerfile",
      description: "Multi-stage build with Bun runtime, non-root user, health checks",
    },
    {
      title: "Docker Compose",
      description: "Orchestrate Redis + AI Gateway containers for local dev",
    },
    {
      title: "API documentation",
      description: "Swagger/OpenAPI docs auto-generated at /docs endpoint",
    },
    {
      title: "Error handling",
      description: "Global error handler with proper HTTP status codes and error responses",
    },
    {
      title: "API key management CLI",
      description: "Script to create/revoke API keys with rate limits and allowed models",
    },
  ];

  let position = 0;
  for (const task of backlogTasks) {
    await db.insert(tasks).values({
      columnId: createdColumns["Backlog"],
      title: task.title,
      description: task.description,
      position: position++,
    });
  }

  console.log(`Created ${backlogTasks.length} tasks in Backlog`);
  console.log("Seeding complete!");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
