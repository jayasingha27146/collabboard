# Study Group Planner Backend

Backend REST API for the Study Group Planner application.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- dotenv configuration
- CORS
- Jest + Supertest

## Project Structure

```
server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── tests/
├── utils/
├── app.js
├── server.js
├── Dockerfile
└── .env.example
```

## Setup

Run all backend commands from the `server` directory:

```bash
cd server
```

1. Install dependencies (including development tools such as Nodemon):

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Update `.env` values:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

4. Start development server:

```bash
npm run dev
```

5. Run tests:

```bash
npm test
```

6. Add sample data to MongoDB (does not delete existing data):

```bash
npm run seed
```

The seed creates demo records in `users`, `groups`, `tasks`, `comments`, and
`notifications`. Demo users use the password `Password123!`.

## Troubleshooting

### `Cannot find module ... node_modules/nodemon/bin/nodemon.js`

This error means the backend dependencies are missing or the local
`node_modules` installation is incomplete. From the project root, run:

```bash
cd server
npm install
npm run dev
```

Verify the Nodemon installation with:

```bash
npm ls nodemon --depth=0
npx nodemon --version
```

If the error remains, close running Node.js processes, remove only the
`server/node_modules` directory, and run `npm install` again from the `server`
directory.

When the project is stored in a OneDrive-synced directory, syncing can
occasionally interrupt package installation. Pause syncing while running
`npm install`, or move the project to a non-synced local development folder.

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/study_group_planner
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## Authentication Flow

1. Register with `/api/auth/register`
2. Login with `/api/auth/login`
3. Receive JWT token
4. Send token in header:

```http
Authorization: Bearer <token>
```

5. Access protected routes

## Data Models

### User

- name
- email (unique)
- password (hashed, never returned)
- role (`student`)
- avatar
- timestamps

### Group

- name
- description
- owner (User ref)
- members (User refs)
- timestamps

### Task

- title
- description
- group (Group ref)
- assignedTo (User ref)
- createdBy (User ref)
- status (`todo`, `doing`, `done`)
- priority (`high`, `medium`, `low`)
- deadline
- timestamps
- optimistic concurrency (`__v`)

### Comment

- task (Task ref)
- user (User ref)
- content
- timestamps

### Notification

- recipient (User ref)
- type
- message
- relatedTask (Task ref)
- relatedGroup (Group ref)
- isRead
- createdAt

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users / Dashboard

- `GET /api/users/me`
- `GET /api/dashboard`

### Groups

- `GET /api/groups`
- `POST /api/groups`
- `GET /api/groups/:groupId`
- `PUT /api/groups/:groupId`
- `DELETE /api/groups/:groupId`
- `POST /api/groups/:groupId/join`
- `DELETE /api/groups/:groupId/members/:userId`

### Group Tasks

- `GET /api/groups/:groupId/tasks`
- `POST /api/groups/:groupId/tasks`

### Tasks

- `GET /api/tasks/:taskId`
- `PUT /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

### Task Comments

- `GET /api/tasks/:taskId/comments`
- `POST /api/tasks/:taskId/comments`

### Comments

- `PUT /api/comments/:commentId`
- `DELETE /api/comments/:commentId`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `PATCH /api/notifications/read-all`
- `GET /api/notifications/unread-count`

## API Response Format

Success:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Task not found"
}
```

## Optimistic Concurrency for Tasks

`PUT /api/tasks/:taskId` expects a `version` field.

If stale version is sent, API returns `409 Conflict` with:

```json
{
  "success": false,
  "message": "This task was updated by another user. Please refresh and try again."
}
```

## Socket.io Readiness

A real-time service abstraction is included in `services/realtimeService.js`.
Current code emits domain events when groups/tasks/notifications change:

- `task:created`
- `task:updated`
- `task:deleted`
- `task:statusChanged`
- `notification:new`
- `group:memberJoined`

You can later set the Socket.io instance via `setIoInstance(io)` and join rooms like `group:<id>` and `user:<id>`.

## Docker

Build image:

```bash
docker build -t study-group-planner-server .
```

Run container:

```bash
docker run --env-file .env -p 5000:5000 study-group-planner-server
```
