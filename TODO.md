# Known Issues & Backlog

## User-Reported Issues

### Performance
- [ ] Users report the board takes a long time to load, especially with many tasks
- [ ] "The app feels slow sometimes but not always" - multiple users
- [ ] Board with 3 or 6 columns seems slower than boards with 4 or 5 columns
- [ ] Loading the boards list page is getting progressively slower over time

### Reliability
- [ ] Tasks occasionally fail to create with "Database connection timeout" error
- [ ] Sometimes dragging tasks quickly causes unexpected delays
- [ ] Delete board always shows success even when it shouldn't
- [ ] App crashes completely if database is temporarily unavailable
- [ ] Moving multiple tasks at once sometimes causes data inconsistency
- [ ] Create board fails silently - user doesn't know what went wrong

### Data
- [ ] "Oldest task age" in stats shows wrong values (way too high)
- [ ] Search is case-sensitive (users expect case-insensitive)
- [ ] Users can create tasks with empty titles
- [ ] Task descriptions can be just whitespace

### Frontend
- [ ] Console shows "Polling update" messages constantly
- [ ] Memory usage increases the longer the app is open
- [ ] Page title keeps updating even when nothing changes
- [ ] Columns sometimes jump around when reordering
- [ ] App doesn't work in production - API URL is hardcoded to localhost

### Security
- [ ] Database credentials visible in codebase
- [ ] No input sanitization on user-provided content

## Technical Debt

- [ ] Review GraphQL query efficiency
- [ ] Audit useEffect hooks for proper cleanup
- [ ] Consider implementing DataLoader pattern
- [ ] Add proper error handling throughout
- [ ] Review component key usage
- [ ] Investigate memory profile of long-running sessions
- [ ] Add environment variable support for API URL
- [ ] Add connection pooling and retry logic for database
- [ ] Add input validation layer

## Future Features

- [ ] User authentication
- [ ] Board sharing/collaboration
- [ ] Task due dates
- [ ] Task labels/tags
- [ ] Keyboard shortcuts
- [ ] Dark mode
