# Common Bugs for Full-Stack Developer Assessment

This document lists the intentional bugs introduced into the codebase that a full-stack developer should be able to identify and fix.

## Backend Bugs

### 1. **Type Mismatch in Array Length Check** (resolvers.ts:14)
- **Location**: `backend/src/graphql/resolvers.ts`
- **Issue**: Comparing `requestLog.length` (number) with string `"1000"`
- **Fix**: Change `== "1000"` to `=== 1000`
- **Impact**: Condition never evaluates to true, array grows indefinitely

### 2. **Case-Sensitive Search** (resolvers.ts:69-70)
- **Location**: `backend/src/graphql/resolvers.ts` - `searchTasks` query
- **Issue**: Search uses `.includes()` without case normalization
- **Fix**: Convert both query and fields to lowercase: `t.title.toLowerCase().includes(query.toLowerCase())`
- **Impact**: Users can't find tasks with different casing

### 3. **No Input Validation** (resolvers.ts:262-270)
- **Location**: `backend/src/graphql/resolvers.ts` - `createTask` mutation
- **Issue**: Empty or whitespace-only titles are allowed
- **Fix**: Add validation: `if (!title?.trim()) throw new Error("Title is required")`
- **Impact**: Can create tasks with empty titles

### 4. **Missing Null Check** (resolvers.ts:289-302)
- **Location**: `backend/src/graphql/resolvers.ts` - `updateTask` mutation
- **Issue**: Returns `result[0]` without checking if task exists
- **Fix**: Add check: `if (!result[0]) throw new Error("Task not found")`
- **Impact**: Returns undefined instead of error, crashes client

### 5. **Race Condition in Task Movement** (resolvers.ts:315-331)
- **Location**: `backend/src/graphql/resolvers.ts` - `moveTask` mutation
- **Issue**: No locking mechanism for concurrent drag operations
- **Fix**: Implement optimistic locking or transaction with position recalculation
- **Impact**: Concurrent moves can corrupt task positions

### 6. **Hardcoded Database Credentials** (db/index.ts:6)
- **Location**: `backend/src/db/index.ts`
- **Issue**: Fallback contains hardcoded password in code
- **Fix**: Fail loudly if DATABASE_URL not set or use safer default
- **Impact**: Security risk, credentials in version control

### 7. **No Database Connection Error Handling** (db/index.ts:9)
- **Location**: `backend/src/db/index.ts`
- **Issue**: App crashes immediately if database is unavailable
- **Fix**: Add try-catch with proper error message and retry logic
- **Impact**: Poor developer experience, unclear error messages

### 8. **N+1 Query Problem** (resolvers.ts:96-122)
- **Location**: `backend/src/graphql/resolvers.ts` - Board.stats resolver
- **Issue**: Multiple queries inside loops instead of batch query
- **Fix**: Use JOIN or batch queries to fetch all data at once
- **Impact**: Severe performance degradation with many columns/tasks

## Frontend Bugs

### 9. **Memory Leak - Uncleaned Interval** (KanbanBoard.tsx:71-74)
- **Location**: `frontend/src/components/KanbanBoard.tsx`
- **Issue**: `setInterval` never cleaned up
- **Fix**: Return cleanup function: `return () => clearInterval(interval)`
- **Impact**: Memory leak, multiple intervals pile up

### 10. **Missing useEffect Dependency Array** (KanbanBoard.tsx:78-80)
- **Location**: `frontend/src/components/KanbanBoard.tsx`
- **Issue**: Effect runs on every render instead of when data changes
- **Fix**: Add dependency array: `}, [data?.board?.title]);`
- **Impact**: Excessive re-renders, performance issues

### 11. **Using Index as React Key** (KanbanBoard.tsx:217-224)
- **Location**: `frontend/src/components/KanbanBoard.tsx`
- **Issue**: Using `index` as key for reorderable columns
- **Fix**: Use stable identifier: `key={column.id}`
- **Impact**: React loses track of components, incorrect renders, lost state

### 12. **No Error Handling on Drag** (KanbanBoard.tsx:138-174)
- **Location**: `frontend/src/components/KanbanBoard.tsx` - `handleDragEnd`
- **Issue**: Mutation can fail silently
- **Fix**: Wrap in try-catch, show error toast, revert optimistic update
- **Impact**: Tasks appear moved but operation failed

### 13. **No Validation Before Task Creation** (KanbanBoard.tsx:116-121)
- **Location**: `frontend/src/components/KanbanBoard.tsx` - `handleAddTask`
- **Issue**: No validation, relies on backend
- **Fix**: Add client-side validation before calling mutation
- **Impact**: Unnecessary network requests, poor UX

### 14. **No Confirmation for Delete** (KanbanBoard.tsx:110-113)
- **Location**: `frontend/src/components/KanbanBoard.tsx` - `handleDeleteColumn`
- **Issue**: Deletes columns (and all tasks) without confirmation
- **Fix**: Add confirmation dialog
- **Impact**: Accidental data loss

### 15. **Aggressive Polling** (KanbanBoard.tsx:62-64)
- **Location**: `frontend/src/components/KanbanBoard.tsx`
- **Issue**: Polling every 1 second is excessive
- **Fix**: Increase to 3-5 seconds or use WebSockets
- **Impact**: Excessive network traffic, server load

### 16. **Hardcoded API URL** (main.tsx:8)
- **Location**: `frontend/src/main.tsx`
- **Issue**: GraphQL URI hardcoded, not using environment variables
- **Fix**: Use `import.meta.env.VITE_API_URL` or similar
- **Impact**: Can't configure different environments

### 17. **No Error Handling on Board Creation** (App.tsx:27-36)
- **Location**: `frontend/src/App.tsx` - `handleCreateBoard`
- **Issue**: Mutation can fail silently
- **Fix**: Add try-catch with error notification
- **Impact**: Silent failures, confusing UX

### 18. **GraphQL Over-fetching** (queries.ts:24-61)
- **Location**: `frontend/src/graphql/queries.ts` - GET_BOARD query
- **Issue**: Fetching unnecessary nested data (column for each task, siblingTasks)
- **Fix**: Remove unused fields from query
- **Impact**: Unnecessary data transfer, slower queries

### 19. **Whitespace-Only Description** (KanbanColumn.tsx:45-51)
- **Location**: `frontend/src/components/KanbanColumn.tsx` - `handleAddTask`
- **Issue**: Description not trimmed, can save whitespace-only strings
- **Fix**: Trim description: `newTaskDescription.trim() || undefined`
- **Impact**: Ugly whitespace stored in database

## Configuration Bugs

### 20. **Missing Bun Types** (backend/tsconfig.json:13)
- **Location**: `backend/tsconfig.json`
- **Issue**: References "bun-types" but package is "@types/bun"
- **Fix**: Remove types array or change to correct package name
- **Impact**: TypeScript errors

### 21. **Deprecated Drizzle Commands** (backend/package.json:8-9)
- **Location**: `backend/package.json`
- **Issue**: Using old `generate:pg` and `push:pg` syntax
- **Fix**: Update to `drizzle-kit generate` and `drizzle-kit push`
- **Impact**: Commands may fail with newer drizzle-kit versions

## Summary

**Total Bugs**: 21 issues across backend, frontend, and configuration

**Categories**:
- Security: 1 (hardcoded credentials)
- Performance: 3 (N+1 queries, aggressive polling, over-fetching)
- Memory/Resource Leaks: 2 (uncleaned interval, missing cleanup)
- Error Handling: 5 (no validation, missing null checks, silent failures)
- Data Integrity: 3 (race conditions, no confirmations, empty data)
- UX Issues: 4 (case-sensitive search, no validation feedback)
- React Anti-patterns: 2 (index as key, missing dependencies)
- Configuration: 2 (wrong types, deprecated commands)
