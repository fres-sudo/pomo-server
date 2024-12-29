# Pomo Server 🍝

Pomo Server is a backend application built to manage and serve the Pomo platform's API. The project is developed using **TypeScript** and runs on **Bun**, leveraging **Drizzle ORM** and **Postgres** for data management. The application integrates with **AWS S3** for storage, **Sentry** for monitoring, and uses Docker for containerization.

## Project Structure 🧱

```sh 
pomo-server/
├── Dockerfile                 # Docker configuration
├── README.md                  # Project documentation
├── bun.lockb                  # Bun package lock file
├── bunfig.toml                # Bun configuration file
├── docker-compose.yaml        # Docker Compose setup
├── drizzle.config.ts          # Drizzle ORM configuration
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── src/                       # Source code
│   ├── common/                # Common utilities and base functionality
│   ├── constants/             # Application constants
│   ├── controllers/           # Route controllers for API endpoints
│   ├── dtos/                  # Data Transfer Objects for request validation
│   ├── infrastructure/        # Application setup (e.g., database, Redis)
│   ├── interfaces/            # TypeScript interfaces
│   ├── middleware/            # Application middleware (e.g., authentication)
│   ├── providers/             # Dependency injection providers
│   ├── repositories/          # Data repositories for interacting with the database
│   ├── services/              # Business logic services
│   ├── tables/                # Drizzle ORM table definitions
│   ├── tests/                 # Test files
│   ├── types/                 # TypeScript type definitions
│   ├── ui/                    # UI utilities (if applicable)
│   └── utils/                 # Helper functions and utilities
```

---


## Getting Started 🚀

To get started with the project, follow these steps:

### 1. Clone the Repository 🧑‍💻

Clone the project repository to your local machine using the following command:

```bash
git clone https://github.com/fres-sudo/pomo-server.git
```

### 2. Set Up Docker 🐳

Docker is used to set up the project. First, make sure you have Docker and Docker Compose installed on your machine.

### 3. Build and Run with Docker 🏃‍♂️

To build and run the project using Docker, run the following command in the project root:

```bash
bun initialize
```

This will:

- Install the dependencies.
- Build the Docker image using Docker Compose.
- Start the containers for the application.
- Set up the environment with all necessary dependencies, including Drizzle migrations.

### 4. Drizzle Migrations 🧳

Drizzle migrations are automatically handled with Docker. If you need to run a migration manually, use the custom command defined in the `package.json`:

TODO

This will run the migration for Drizzle ORM on the database.

### 5. Access the Application 🌐

Once the Docker containers are up, you can access the application at `http://localhost:9000` (or another configured port).

---

## Available Scripts ✍️

Here are the key commands defined in the `package.json`:

| Command                | Description                                                 |
|------------------------|-------------------------------------------------------------|
| `bun install`           | 🛠️ Installs project dependencies using Bun.                    |
| `bun dev`               | 🚀 Starts the development server.                              |
| `bun initialize`             | 🌐 Starts the production server with docker and drizzle.|
| `bun test`              | 🧪 Runs tests using Bun's test runner.                         |
| `bun docker:up`     | 🐳 Starts the Docker containers as per `docker-compose.yaml`.   |
| `bun docker:build`  | 🔨 Builds Docker images defined in `docker-compose.yaml`.       |
| `bun docker:logs`   | 📥 Show the logs on the pomo-backend container.                   |
| `bun db:generate`   | 🔌 Generate the migrations scripts to update the db schema    |
| `bun db:push`   | ➡️  Push the migrations `sql` file to the db instance.                   |
| `bun db:migrate`   | 🖇️ Perform the migration.                   |
| `bun db:studio`   |🖥️ Start the drizzle studio.                   |

---

## Workflows 🔄

We use GitHub Actions for Continuous Integration (CI) and Continuous Deployment (CD).

The workflow is triggered on every push to the `main` branch, and it involves two main jobs:

### 1. Publish Docker Image to GHCR 🐳

The first job builds the Docker image and pushes it to the GitHub Container Registry (GHCR). Here’s a summary of the steps:

- **Checkout Code**: Pulls the latest code from the `main` branch.
- **Log in to GitHub Container Registry**: Authenticates with GHCR using GitHub secrets.
- **Build and Push Docker Image**: Builds the Docker image and pushes it to GHCR with the tag `latest`.

### 2. Deploy to VPS 🌍

The second job deploys the built Docker image to a Virtual Private Server (VPS). Here’s how it works:

- **Install SSH Key**: Installs the SSH private key for secure access to the VPS.
- **Pull and Deploy on VPS**: SSH into the VPS, pulls the latest code from the `main` branch, and rebuilds the Docker container with `docker-compose up --build -d`.

This setup ensures that your application is continuously built and deployed whenever there’s a change in the `main` branch.

---

## 📈 Monitoring and Logs

- Sentry: Ensure the SENTRY_DSN is set in your .env file for error tracking.
- Docker Logs: View Docker container logs.

```bash
bun docker:logs
```
## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE.md) file for details.

## Contributing 🤝

We welcome contributions to this project! If you'd like to help improve the project, please fork the repository, create a new branch for your feature or bug fix, and submit a pull request. Ensure that your code follows the existing style, includes relevant tests, and passes all linting and testing checks. If you’re unsure about something or have questions, feel free to open an issue, and we’ll be happy to assist! Your contributions help make this project better for everyone. Thank you for your support! 🙏
