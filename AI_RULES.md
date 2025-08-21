# AI Agent Rules and Tech Stack Guidelines

This document outlines the core technologies used in this application and provides guidelines for their usage, ensuring consistency, maintainability, and adherence to best practices.

## Tech Stack Overview

*   **Frontend Framework:** React 18 with TypeScript for robust and type-safe component development.
*   **Routing:** React Router for declarative navigation within the application.
*   **Styling:** Tailwind CSS for utility-first, highly customizable styling and responsive design.
*   **UI Components:** Shadcn/ui for pre-built, accessible, and customizable UI components.
*   **Icons:** Lucide-react for a comprehensive set of SVG icons.
*   **Authentication & Database (Client-side):** Supabase for user authentication and interacting with the PostgreSQL database.
*   **Backend:** Node.js with Express.js and PostgreSQL for server-side logic and API endpoints.
*   **Bundler/Dev Server:** Vite for a fast development experience and optimized builds.

## Library Usage Rules

To maintain a clean and efficient codebase, please adhere to the following rules when using libraries:

*   **Styling:**
    *   **Always use Tailwind CSS** for all styling. Avoid inline styles or separate CSS files unless absolutely necessary for third-party integrations that cannot be styled otherwise.
    *   Prioritize utility classes for layout, spacing, colors, and responsiveness.
*   **UI Components:**
    *   **Prefer Shadcn/ui components.** These are already integrated and styled with Tailwind CSS.
    *   If a specific Shadcn/ui component does not meet the requirements or needs significant modification, **create a new custom component in `src/components/`**. Do not modify the original Shadcn/ui component files.
    *   Keep new components small and focused, ideally under 100 lines of code.
*   **Icons:**
    *   **Use `lucide-react`** for all icons.
*   **Routing:**
    *   **Use `react-router-dom`** for all client-side routing. Keep main application routes defined in `src/App.tsx`.
*   **State Management:**
    *   Utilize **React hooks (`useState`, `useContext`, `useEffect`, etc.)** for component-level and global state management (via Context API).
    *   Avoid introducing external state management libraries (e.g., Redux, Zustand) unless explicitly requested and justified by complex state requirements.
*   **Backend Interaction (Client-side):**
    *   For authentication and database operations, interact with Supabase using the `@supabase/supabase-js` library as demonstrated in `src/lib/supabase.ts`.
    *   For custom backend API calls, use standard `fetch` or `axios` (if installed) to interact with the Node.js/Express backend.
*   **File Structure:**
    *   All source code must reside in the `src` directory.
    *   Pages should be placed in `src/pages/`.
    *   Reusable UI components should be placed in `src/components/`.
    *   Utility functions and library integrations (like Supabase client) should be in `src/lib/` or `src/utils/`.
    *   **Every new component or hook must be created in its own dedicated file.** Do not add new components to existing files.
*   **Error Handling (Frontend):**
    *   Use toast notifications (if a toast library is integrated) to provide user feedback for successful actions or non-critical errors.
    *   Avoid `try/catch` blocks for errors that should naturally bubble up for debugging and global error handling.
*   **Responsiveness:**
    *   All new UI elements and layouts must be designed with a **mobile-first approach** and be fully responsive using Tailwind CSS utilities.