import os
import urllib.parse
import asyncio
from dotenv import load_dotenv
from google.antigravity import Agent, LocalAgentConfig
from playwright.async_api import async_playwright

# Load environment variables from .env file
load_dotenv()

async def browse_url(url: str) -> str:
    """Navigates to a specified URL and returns the visible text content of the page.
    
    Args:
        url: The absolute HTTP or HTTPS URL to load.
        
    Returns:
        The extracted visible text content of the page.
    """
    print(f"\n[Tool Execution] Navigating to URL: {url}...")
    try:
        async with async_playwright() as p:
            # Launch chromium in headless mode
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=15000)
            text = await page.inner_text("body")
            await browser.close()
            # Truncate output to prevent context window overload
            return text[:3000]
    except Exception as e:
        return f"Error loading URL: {e}"

async def search_google(query: str) -> str:
    """Performs a search on Google and returns the main text results from the search page.
    
    Args:
        query: The search terms to look up.
        
    Returns:
        Summarized text content of the search results page.
    """
    print(f"\n[Tool Execution] Searching Google for query: {query}...")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            # Set User Agent to avoid basic bot blocks
            await page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
            encoded_query = urllib.parse.quote(query)
            await page.goto(f"https://www.google.com/search?q={encoded_query}", wait_until="networkidle", timeout=15000)
            
            # Extract content from the main search element
            # Fallback to body text if main element is not found
            try:
                text = await page.inner_text("#search")
            except:
                text = await page.inner_text("body")
                
            await browser.close()
            return text[:2000]
    except Exception as e:
        return f"Error searching Google: {e}"

async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set. Please add it to your .env file.")
        return

    # Pass the custom browser tools to the Agent configuration
    config = LocalAgentConfig(
        tools=[browse_url, search_google]
    )

    print("=== Browser-Automating Agent ===")
    print("Agent: Ready with custom Playwright browser tools...")
    
    async with Agent(config) as agent:
        # Prompt the agent to browse and summarize a page
        prompt = (
            "Please use the browse_url tool to navigate to https://example.com. "
            "Describe what the website is about and summarize its content."
        )
        response = await agent.chat(prompt)
        text = await response.text()
        print("\n=== Final Response from Agent ===")
        print(text)

if __name__ == "__main__":
    asyncio.run(main())
