import { gql } from "@apollo/client";

export const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      title
      createdAt
    }
  }
`;

export const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      title
      columns {
        id
        title
        position
        tasks {
          id
          title
          description
          position
        }
      }
    }
  }
`;

export const CREATE_BOARD = gql`
  mutation CreateBoard($title: String!) {
    createBoard(title: $title) {
      id
      title
    }
  }
`;

export const CREATE_COLUMN = gql`
  mutation CreateColumn($boardId: ID!, $title: String!) {
    createColumn(boardId: $boardId, title: $title) {
      id
      title
      position
    }
  }
`;

export const UPDATE_COLUMN = gql`
  mutation UpdateColumn($id: ID!, $title: String) {
    updateColumn(id: $id, title: $title) {
      id
      title
    }
  }
`;

export const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: ID!) {
    deleteColumn(id: $id)
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($columnId: ID!, $title: String!, $description: String) {
    createTask(columnId: $columnId, title: $title, description: $description) {
      id
      title
      description
      position
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String) {
    updateTask(id: $id, title: $title, description: $description) {
      id
      title
      description
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const MOVE_TASK = gql`
  mutation MoveTask($taskId: ID!, $targetColumnId: ID!, $targetPosition: Int!) {
    moveTask(taskId: $taskId, targetColumnId: $targetColumnId, targetPosition: $targetPosition) {
      id
      columnId
      position
    }
  }
`;
