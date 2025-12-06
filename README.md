# Agile Tasks

A full-stack Agile Tasks application built with Next.js, MikroORM, MongoDB, and Material UI.

## Technologies Used

*   **Framework**: [Next.js 16](https://nextjs.org/) (React Framework)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [MongoDB](https://www.mongodb.com/)
*   **ORM**: [MikroORM v5](https://mikro-orm.io/)
*   **UI Library**: [Material UI (MUI)](https://mui.com/)
*   **State Management**: React Context API
*   **Drag & Drop**: `@hello-pangea/dnd`
*   **Authentication**: JWT (JSON Web Tokens) with `bcryptjs`
*   **Testing**:
    *   Unit/Integration: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
    *   End-to-End (E2E): [Cypress](https://www.cypress.io/)
*   **Package Manager**: [pnpm](https://pnpm.io/)

## Features

*   **Main Status Board (Kanban)**: Interactive drag-and-drop board to manage todo statuses (Backlog, Pending, In Progress, Completed).
*   **Track Status**: Comprehensive table view with advanced filtering capabilities (by Title, Status, and Due Date).
*   **Dates by Workload**: Visual breakdown of tasks grouped by their due dates to help manage daily workload.
*   **Authentication**: Secure user authentication system.
*   **Responsive UI**: Clean and modern interface built with Material UI.

## Project Structure

```
my-app/
├── components/         # Reusable React components (TodoModal, Layout, etc.)
├── context/            # React Context definitions (AuthContext)
├── cypress/            # Cypress E2E tests
│   └── e2e/            # E2E test specifications
├── entities/           # MikroORM entity definitions (User, Todo)
├── lib/                # Utility functions and configurations
│   ├── auth.ts         # Authentication helpers
│   ├── axios.ts        # Axios instance configuration
│   ├── db.ts           # Database connection helper
│   └── password.ts     # Password hashing utilities
├── pages/              # Next.js pages and API routes
│   ├── api/            # API endpoints (/auth, /todos)
│   ├── _app.tsx        # App wrapper
│   ├── index.tsx       # Home page (Main Status Board - Kanban)
│   ├── login.tsx       # Login page
│   ├── todos.tsx       # Track Status (Table view with filtering)
│   └── workload.tsx    # Dates by Workload view
├── public/             # Static assets
├── scripts/            # Utility scripts (e.g., database seeding)
├── styles/             # Global styles
├── .env.development    # Environment variables for development
├── jest.config.js      # Jest configuration
├── mikro-orm.config.ts # MikroORM configuration
└── package.json        # Project dependencies and scripts
```

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   pnpm
*   MongoDB instance (local or Atlas)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Configure environment variables:
    *   Ensure `.env.development` exists and contains your MongoDB connection string (`DATABASE_URL`) and `JWT_SECRET`.

### Database Seeding

To populate the database with initial data (test user and todos):

```bash
pnpm seed
```

### Running the Application

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000` (or the port specified in your output).

### Running Tests

**Unit & Integration Tests (Jest):**

```bash
pnpm tests
```

**End-to-End Tests (Cypress):**

1.  Ensure the development server is running (`pnpm dev`).
2.  Run Cypress tests:
    ```bash
    pnpm tests:e2e
    ```

### Linting

Check for code quality issues:

```bash
pnpm lint
```

## Available Scripts

| Script | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server. |
| `pnpm build` | Builds the application for production. |
| `pnpm start` | Starts the production server. |
| `pnpm lint` | Runs ESLint to check for code quality issues. |
| `pnpm tests` | Runs unit and integration tests using Jest. |
| `pnpm tests:e2e` | Runs end-to-end tests using Cypress (headless mode). |
| `pnpm seed` | Seeds the database with initial data. |
