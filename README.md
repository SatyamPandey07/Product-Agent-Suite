# Product Agent Suite

A collection of autonomous AI agents built using the **Google SDK** and Python. 

---

## 🎨 Interactive Visual Dashboard

To help non-technical users understand how these agents function behind the scenes, we have built a beautiful, fully interactive **Visual Dashboard** showcasing simulations of each agent's execution process.

![Dashboard Simulation Demo](assets/demo.webp)

### How to Launch the Dashboard
You can run a local server to view the dashboard in your web browser:

```bash
python3 -m http.server --directory dashboard 8000
```
Then navigate to **[http://localhost:8000/index.html](http://localhost:8000/index.html)** in your web browser.

---

## Agent Types

1. **Single-Agent (`src/single_agent.py`)**: A simple conversational agent demonstrating token streaming and reasoning (thoughts) retrieval.
2. **Multi-Agent (`src/multi_agent.py`)**: A master coordinator agent that spawns subagents to delegate complex subtasks.
3. **MCP-Based Agent (`src/mcp_agent.py`)**: An agent that connects to a local custom Model Context Protocol (MCP) server (`src/mcp_server.py`) to run custom tools.
4. **Browser-Automating Agent (`src/browser_agent.py`)**: An agent equipped with custom tools utilizing **Playwright** to automate web browsing, navigation, and page reading.

---

## Getting Started

### 1. Setup Environment
Ensure Python 3.9+ is installed. Run the setup script to create a virtual environment, install dependencies, and setup browser automation binaries:

```bash
chmod +x run_setup.sh
./run_setup.sh
```

### 2. Configure Credentials
Copy `.env.example` to `.env` and fill in your Gemini API key:
```bash
cp .env.example .env
```
Open `.env` and replace `your_gemini_api_key_here` with your actual API key from [Google AI Studio](https://aistudio.google.com/app/api-keys).

### 3. Run the Agents
Ensure you activate your virtual environment before running the scripts:
```bash
source .venv/bin/activate
```

#### Run Single-Agent
```bash
python3 src/single_agent.py
```

#### Run Multi-Agent (Delegation)
```bash
python3 src/multi_agent.py
```

#### Run MCP Agent
Start the MCP server (it will run on standard I/O) and let the agent call it:
```bash
python3 src/mcp_agent.py
```

#### Run Browser Agent
```bash
python3 src/browser_agent.py
```
