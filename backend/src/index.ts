import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

const app = new Elysia()
  .use(cors())
  .use(
    yoga({
      typeDefs,
      resolvers,
    })
  )
  .get("/", () => "Kanban API - GraphQL endpoint at /graphql")
  .listen(4000);

console.log(`🚀 Server running at http://localhost:${app.server?.port}`);
console.log(`📊 GraphQL endpoint at http://localhost:${app.server?.port}/graphql`);
