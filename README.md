# Kanban Board

A full-stack Kanban board application built with modern technologies.

## Tech Stack

**Backend:**
- [Bun](https://bun.sh/) - JavaScript runtime
- [ElysiaJS](https://elysiajs.com/) - Web framework
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) - GraphQL server
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- PostgreSQL - Database

**Frontend:**
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Apollo Client](https://www.apollographql.com/docs/react/) - GraphQL client
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [dnd-kit](https://dndkit.com/) - Drag and drop
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Features

- Create and manage multiple boards
- Add, edit, and delete columns
- Create tasks with titles and descriptions
- Drag and drop tasks between columns
- Real-time updates with polling
- Board statistics and analytics
- Task search functionality

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL running locally

### Installation

1. Clone the repository and install dependencies:

```bash
bun install
```

2. Create the database:

```bash
createdb kanban
```

3. Push the schema to the database:

```bash
bun run db:push
```

4. Start the development servers:

```bash
bun run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- GraphQL Playground: http://localhost:4000/graphql

## Project Structure

```
kanban-basic/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts      # Drizzle schema definitions
│   │   │   └── index.ts       # Database connection
│   │   ├── graphql/
│   │   │   ├── schema.ts      # GraphQL type definitions
│   │   │   └── resolvers.ts   # GraphQL resolvers
│   │   └── index.ts           # Server entry point
│   ├── drizzle.config.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn components
│   │   │   ├── TaskCard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── KanbanBoard.tsx
│   │   ├── graphql/
│   │   │   └── queries.ts     # GraphQL queries/mutations
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── package.json
```

## Available Scripts

From the root directory:

- `bun run dev` - Start both frontend and backend in development mode
- `bun run dev:backend` - Start only the backend
- `bun run dev:frontend` - Start only the frontend
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio

## GraphQL API

### Queries

- `boards` - List all boards with stats
- `board(id: ID!)` - Get a single board with columns and tasks
- `searchTasks(query: String!, boardId: ID)` - Search tasks

### Mutations

- `createBoard(title: String!)` - Create a new board
- `createColumn(boardId: ID!, title: String!)` - Add a column to a board
- `createTask(columnId: ID!, title: String!, description: String)` - Create a task
- `moveTask(taskId: ID!, targetColumnId: ID!, targetPosition: Int!)` - Move a task between columns
- `deleteTask(id: ID!)` - Delete a task
- `deleteColumn(id: ID!)` - Delete a column
- `deleteBoard(id: ID!)` - Delete a board

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kanban
```

## License

MIT
