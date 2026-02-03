# Local Setup Guide for Windows

This guide will help you set up and run FinTrack on your local Windows machine.

## Prerequisites

1.  **Node.js**: Install Node.js (v20 or higher) from [nodejs.org](https://nodejs.org/).
2.  **Git**: Install Git from [git-scm.com](https://git-scm.com/).
3.  **PostgreSQL** (Optional): If you want to use a real database locally, install PostgreSQL from [postgresql.org](https://www.postgresql.org/). By default, the app uses a local JSON file (`data.json`) for storage.

## Setup Steps

1.  **Clone the repository**:
    Open PowerShell or Command Prompt and run:
    ```bash
    git clone <your-repository-url>
    cd rest-express
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory (optional if using file storage):
    ```env
    NODE_ENV=development
    # DATABASE_URL=postgres://user:password@localhost:5432/fintrack
    ```

4.  **Run the application**:
    ```bash
    npm run dev
    ```
    The application should now be running at `http://localhost:5000`.

## Common Windows Issues

### 1. Permission Errors
If you get errors about script execution in PowerShell, run this command as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Node Version
Ensure you are using a recent version of Node.js. Check your version with:
```bash
node -v
```

### 3. Database Connection
If you are using PostgreSQL, make sure the service is running and your `DATABASE_URL` is correct.
