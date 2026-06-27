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

    # Enable subagents (multi-agent delegation capability)
    config = LocalAgentConfig(
        capabilities=types.CapabilitiesConfig(
            enable_subagents=True,
        )
    )

    print("=== Multi-Agent Coordinator ===")
    print("Coordinator: Spawning a subagent to help solve a complex multi-step request...")
    
    async with Agent(config) as agent:
        # Prompt the coordinator to delegate work
        prompt = (
            "I need you to generate a content strategy for a new AI startup. "
            "Please delegate the writing of a sample marketing blog post to a specialized writer subagent, "
            "and then review their work and output the final strategy and blog post together."
        )
        response = await agent.chat(prompt)
        text = await response.text()
        print("\n=== Final Response from Coordinator ===")
        print(text)

if __name__ == "__main__":
    asyncio.run(main())
