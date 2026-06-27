import os
import asyncio
from dotenv import load_dotenv
from google.antigravity import Agent, LocalAgentConfig, types

# Load environment variables from .env file
load_dotenv()

async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set. Please add it to your .env file.")
        return

    # Define the local MCP server running via stdio transport
    mcp_servers = [
        types.McpStdioServer(
            command="python3",
            args=["src/mcp_server.py"],
        )
    ]

    # Initialize agent configuration with the MCP server
    config = LocalAgentConfig(mcp_servers=mcp_servers)

    print("=== MCP-Based Agent ===")
    print("Agent: Connecting to local ProductMetricsServer via Stdio...")
    
    async with Agent(config) as agent:
        # Prompt that requires both tools from the MCP server
        prompt = (
            "We have a new product named 'Quantum Processor' in the 'Electronics' category. "
            "It is priced at $150.00 and costs $85.00 to build. "
            "Please use the custom tools from the ProductMetricsServer MCP server to: "
            "1. Calculate its gross profit margin.\n"
            "2. Generate its product SKU.\n"
            "Then output a summary of the product metrics."
        )
        response = await agent.chat(prompt)
        text = await response.text()
        print("\n=== Final Response from Agent ===")
        print(text)

if __name__ == "__main__":
    asyncio.run(main())
