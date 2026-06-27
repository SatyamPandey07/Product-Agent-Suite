import os
import asyncio
from dotenv import load_dotenv
from google.antigravity import Agent, LocalAgentConfig

# Load environment variables from .env file
load_dotenv()

async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set. Please add it to your .env file.")
        return

    # LocalAgentConfig automatically picks up GEMINI_API_KEY from environment
    config = LocalAgentConfig()

    print("=== 1. Standard Chat Response ===")
    async with Agent(config) as agent:
        response = await agent.chat("Introduce yourself briefly as the Single Agent in the Product Agent Suite.")
        text = await response.text()
        print(text)
        print("\n")

    print("=== 2. Streaming Response ===")
    async with Agent(config) as agent:
        response = await agent.chat("Explain RAG (Retrieval-Augmented Generation) in 3 bullet points.")
        print("Agent: ", end="", flush=True)
        async for token in response:
            print(token, end="", flush=True)
        print("\n\n")

    print("=== 3. Streaming Reasoning/Thoughts ===")
    async with Agent(config) as agent:
        response = await agent.chat("Why is the sky blue? Answer in one sentence.")
        print("Thinking: ", end="", flush=True)
        async for thought in response.thoughts:
            print(thought, end="", flush=True)
        print("\nFinal Answer: ", end="", flush=True)
        async for token in response:
            print(token, end="", flush=True)
        print("\n")

if __name__ == "__main__":
    asyncio.run(main())
