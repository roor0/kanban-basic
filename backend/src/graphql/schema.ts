export const typeDefs = /* GraphQL */ `
  type Board {
    id: ID!
    title: String!
    columns: [Column!]!
    stats: BoardStats!
    createdAt: String!
    updatedAt: String!
  }

  type BoardStats {
    totalTasks: Int!
    tasksByColumn: [ColumnTaskCount!]!
    averageTasksPerColumn: Float!
    oldestTaskAge: Int
  }

  type ColumnTaskCount {
    columnId: ID!
    columnTitle: String!
    count: Int!
  }

  type Column {
    id: ID!
    boardId: ID!
    title: String!
    position: Int!
    tasks: [Task!]!
    taskCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Task {
    id: ID!
    columnId: ID!
    title: String!
    description: String
    position: Int!
    column: Column!
    siblingTasks: [Task!]!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    boards: [Board!]!
    board(id: ID!): Board
    column(id: ID!): Column
    task(id: ID!): Task
    searchTasks(query: String!, boardId: ID): [Task!]!
  }

  type Mutation {
    createBoard(title: String!): Board!
    updateBoard(id: ID!, title: String!): Board!
    deleteBoard(id: ID!): Boolean!

    createColumn(boardId: ID!, title: String!, position: Int): Column!
    updateColumn(id: ID!, title: String, position: Int): Column!
    deleteColumn(id: ID!): Boolean!

    createTask(columnId: ID!, title: String!, description: String, position: Int): Task!
    updateTask(id: ID!, title: String, description: String, columnId: ID, position: Int): Task!
    deleteTask(id: ID!): Boolean!

    moveTask(taskId: ID!, targetColumnId: ID!, targetPosition: Int!): Task!
  }
`;
