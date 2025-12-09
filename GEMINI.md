# Project Context: Hidden Cottage

## Overview
This project is a React-based frontend web application initialized with Vite. It uses TypeScript for type safety and `rolldown-vite` as the bundler. The project structure follows the standard conventions for a Vite + React application.

**Key Technologies:**
-   **Framework:** React 19
-   **Language:** TypeScript
-   **Build Tool:** Vite (Rolldown)
-   **Linting:** ESLint

## Building and Running

### Prerequisites
-   Node.js installed (LTS version recommended).
-   npm (or yarn/pnpm) package manager.

### Commands
All commands are run from the project root.

-   **Install Dependencies:**
    ```bash
    npm install
    ```
-   **Start Development Server:**
    ```bash
    npm run dev
    ```
    This starts the local development server with Hot Module Replacement (HMR).
-   **Build for Production:**
    ```bash
    npm run build
    ```
    This compiles the TypeScript code and bundles the application for production deployment.
-   **Preview Production Build:**
    ```bash
    npm run preview
    ```
    This allows you to verify the production build locally.
-   **Lint Code:**
    ```bash
    npm run lint
    ```
    Runs ESLint to check for code quality and style issues.

## Project Structure

-   `src/`: Contains the source code.
    -   `main.tsx`: The entry point of the application.
    -   `App.tsx`: The main application component.
    -   `assets/`: Directory for static assets like images and styles.
-   `public/`: Static assets that are served as-is.
-   `index.html`: The HTML entry point.
-   `vite.config.ts`: Configuration file for Vite.
-   `tsconfig.json`: Main TypeScript configuration.

## Development Conventions

-   **Type Safety:** Strict TypeScript usage is encouraged.
-   **Linting:** The project uses ESLint with configurations for React and TypeScript. Ensure no linting errors are present before committing.
-   **Styling:** CSS files (`App.css`, `index.css`) are currently used for styling.
