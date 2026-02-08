# Jasper's Blog

A practice project exploring the latest features of **Next.js 16**, integrated with **Convex** for the backend, **Better Auth** for seamless authentication, and **Tailwind CSS** for styling. This project demonstrates a modern full-stack application architecture.

## Description

This repository serves as a practical implementation of Next.js 16 concepts. It features a blog application where users can authenticate, create posts, and view content. The project leverages Server Actions for data mutations and the Convex real-time database for reactive updates.

Key features include:

- **Next.js 16**: App Router, Server Actions, and enhanced caching.
- **Convex**: Real-time backend-as-a-service.
- **Better Auth**: Secure and flexible authentication.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.

## Motivation

The primary motivation for this project is to gain hands-on experience with the bleeding-edge features of Next.js 16. By building a functional application, we aim to:

- Understand the nuances of React Server Components (RSC).
- Master the usage of Server Actions for form handling and data mutations.
- Explore the integration of a real-time database (Convex) within the Next.js ecosystem.
- Implement a modern authentication flow using Better Auth.

## Quick Start

Follow these steps to get the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/nextjs-16-practice.git
    cd nextjs-16-practice
    ```

2.  **Install dependencies:**
    Using npm:

    ```bash
    npm install
    ```

    Or using pnpm:

    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory. You will need to configure your Convex and Better Auth environment variables.

    Example `.env.local`:

    ```env
    # Convex
    CONVEX_DEPLOYMENT=your-convex-deployment-name
    NEXT_PUBLIC_CONVEX_URL=your-convex-url

    # Better Auth (if applicable)
    BETTER_AUTH_SECRET=your-secret
    BETTER_AUTH_URL=http://localhost:3000
    ```

    _Note: Initialize Convex to generate your deployment credentials._

    ```bash
    npx convex dev
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

5.  **Run the Convex backend (in a separate terminal):**
    ```bash
    npx convex dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Blog

- Navigate to `/blog` to view the list of posts.
- Authenticate to access the post creation features.
- Use the form to submit a new blog post. The application uses Server Actions to validate and store the data in Convex.

### Authentication

- The authentication flow is handled by Better Auth.
- Check the `app/auth` directory and `lib/auth-server.ts` (or similar) for implementation details.

## Contributing

Contributions are welcome! If you'd like to improve this project or add new features:

1.  **Fork the repository**.
2.  **Create a new branch** for your feature or fix:
    ```bash
    git checkout -b feature/amazing-feature
    ```
3.  **Commit your changes**:
    ```bash
    git commit -m 'Add some amazing feature'
    ```
4.  **Push to the branch**:
    ```bash
    git push origin feature/amazing-feature
    ```
5.  **Open a Pull Request**.

Please ensure your code follows the project's coding standards and includes relevant tests where applicable.
