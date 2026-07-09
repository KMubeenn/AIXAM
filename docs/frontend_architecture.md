# Frontend Architecture

AIXAM's frontend is built using **React 19**, **TypeScript**, and **Vite**, prioritizing a dynamic and responsive user experience.

## 1. Directory Structure
```
src/
├── assets/          # Static images and icons
├── components/      # Reusable UI components (Buttons, Inputs, Modals)
├── hooks/           # Custom React Query hooks (useCore, useAuth)
├── layouts/         # High-level route wrappers (Sidebar, Headers)
├── pages/           # Specific route views (Dashboard, Analytics, Auth)
├── store/           # Zustand global state stores
└── tests/           # Vitest testing suites
```

## 2. State Management
We use a combination of local state, server state, and global state:

*   **Server State (React Query):** We utilize `@tanstack/react-query` inside our custom `hooks/` to manage fetching, caching, and mutating data from the Django backend. This removes the need for complex `useEffect` data-fetching logic.
*   **Global State (Zustand):** Used for lightweight client-side state that spans across the app. 
    *   `useAuthStore`: Manages the JWT tokens, user role (student vs. teacher), and logout functions.

## 3. UI and Styling
*   **Tailwind CSS:** Used exclusively for rapid, utility-first styling. We leverage Tailwind's `dark:` modifiers for seamless dark mode support.
*   **Icons:** We rely on `react-icons/fi` (Feather Icons) for clean, minimalist iconography.
*   **Data Visualization:** The Insights dashboard uses `recharts` for rendering responsive Pie and Bar charts to display academic analytics.

## 4. Authentication Flow
1.  User enters credentials on `/login`.
2.  `useAuthStore` sends a POST request to the backend.
3.  Upon success, the backend returns an HTTP-only refresh cookie and an Access Token.
4.  The Access Token is stored in Zustand.
5.  Protected routes wrap their children in a `<ProtectedRoute>` component that verifies the presence of the Access Token before rendering.

## 5. Testing (Vitest + JSDOM)
UI components are tested using Vitest.
*   **Philosophy:** We focus on integration/behavioral tests rather than implementation details.
*   **Example:** `Auth.test.tsx` verifies that placeholder fields exist and form validation triggers, mocking the Zustand store to prevent real network requests.
