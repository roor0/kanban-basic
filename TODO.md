# Known Issues & Backlog

## User-Reported Issues

### Performance
- [ ] Users report the board takes a long time to load, especially with many tasks
- [ ] "The app feels slow sometimes but not always" - multiple users
- [ ] Board with 3 or 6 columns seems slower than boards with 4 or 5 columns
- [x] Loading the boards list page is getting progressively slower over time

### Reliability
- [ ] Tasks occasionally fail to create with "Database connection timeout" error
- [ ] Sometimes dragging tasks quickly causes unexpected delays
- [x] Delete board always shows success even when it shouldn't
- [ ] App crashes completely if database is temporarily unavailable
- [ ] Moving multiple tasks at once sometimes causes data inconsistency
- [x] Create board fails silently - user doesn't know what went wrong

### Data
- [x] "Oldest task age" in stats shows wrong values (way too high)
- [x] Search is case-sensitive (users expect case-insensitive)
- [x] Users can create tasks with empty titles
- [x] Task descriptions can be just whitespace

### Frontend
- [x] Console shows "Polling update" messages constantly
- [x] Memory usage increases the longer the app is open
- [x] Page title keeps updating even when nothing changes
- [x] Columns sometimes jump around when reordering
- [x] App doesn't work in production - API URL is hardcoded to localhost

### Security
- [x] Database credentials visible in codebase
- [x] No input sanitization on user-provided content

## Technical Debt

- [x] Review GraphQL query efficiency
- [x] Audit useEffect hooks for proper cleanup
- [ ] Consider implementing DataLoader pattern
- [x] Add proper error handling throughout
- [x] Review component key usage
- [x] Investigate memory profile of long-running sessions
- [x] Add environment variable support for API URL
- [ ] Add connection pooling and retry logic for database
- [x] Add input validation layer

## Future Features

- [ ] User authentication
- [ ] Board sharing/collaboration
- [ ] Task due dates
- [ ] Task labels/tags
- [ ] Keyboard shortcuts
- [ ] Dark mode
