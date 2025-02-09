# DataOmni

DataOmni is a project designed to help you:
1. **View and manage database schemas.**  
2. **Edit and manage metadata.**  
3. **Access and review historical queries.**  
4. **Build RAG (Retrieval-Augmented Generation) systems** to leverage LLMs (Large Language Models) for data-driven conversations.

---

## Features

1. **Schema Viewer**  
   - Browse databases and tables.  
   - Visualize relationships between various entities.

2. **Metadata Editor**  
   - Create, update, and manage metadata.  
   - Associate user-defined metadata with tables and columns.

3. **Historical Queries**  
   - View a list of past queries.  
   - Review query execution times, results, and metadata.

4. **RAG System Builder**  
   - Construct retrieval-augmented generation pipelines to leverage external data with LLMs.  
   - Integrate with your choice of LLM for conversational data access.  
   - Manage embeddings, vector stores, and retrieval configurations.

5. **Responsive UI**  
   - Fully responsive layout for desktops, tablets, and mobile devices.

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) (version 16+ recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/) package manager

---

## Project Setup

1. **Clone the repository** (if you haven’t already):
    ```bash
    git clone https://github.com/the-data-omni/dataomnifrontend.git
    cd dataomnifrontend

2. **Install Dependancies**
    ```bash
    # Using npm
    npm install
  
    # Using yarn
    yarn
  
    # Using pnpm
    pnpm install

3. **Development**
    ```bash
    # Using npm
    npm run dev
  
    # Using yarn
    yarn dev
  
    # Using pnpm
    pnpm dev

4. **Build**
    ```bash
    # Using npm
    npm run build
  
    # Using yarn
    yarn build
  
    # Using pnpm
    pnpm build

## How to run using Docker and docker-compose

It is possible to do a 'one-touch' installation of data-omni using containers (AKA "Docker"). This will deploy both the frontend and backend

As Prerequisites, you must have docker and docker-compose installed on your machine; see [Docker Install](https://docs.docker.com/get-started/get-docker/) and [Docker Compose Install](https://docs.docker.com/compose/install/).

1. `git clone https://github.com/the-data-omni/dataomnifrontend.git`
2. `cd dataomnifrontend`
3. `docker compose up -d`
4. frontend is running at [http://localhost](http://localhost)
5. backend is running at [http://localhost:5000](http://localhost:5000)