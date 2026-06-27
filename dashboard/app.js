/* ==========================================================================
   PRODUCT AGENT SUITE - SIMULATION ENGINE
   Visualizing Single, Multi, MCP, and Browser Agents for Non-Technical Users
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Navigation / Tab Handler
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".simulator-section");
    const breadcrumb = document.getElementById("current-breadcrumb");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Get action type: either data-simulator or data-tab
            const simulatorId = item.getAttribute("data-simulator");
            const tabId = item.getAttribute("data-tab");
            const targetId = simulatorId || tabId;

            // Remove active classes
            navItems.forEach(nav => nav.classList.remove("active"));
            sections.forEach(sec => sec.classList.remove("active"));

            // Set active navigation
            item.classList.add("active");

            // Show active section
            const activeSection = document.getElementById(`view-${targetId}`);
            if (activeSection) {
                activeSection.classList.add("active");
            }

            // Update Breadcrumb text
            const navText = item.querySelector("span").textContent;
            breadcrumb.textContent = simulatorId ? `${navText} Simulator` : navText;
        });
    });

    // Timing helper
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // HTML-safe character-by-character typist
    async function streamTextHTML(element, htmlContent, delayMs = 25) {
        const tokens = tokenizeHTML(htmlContent);
        for (const token of tokens) {
            if (token.startsWith("<") && token.endsWith(">")) {
                element.innerHTML += token;
            } else {
                for (let i = 0; i < token.length; i++) {
                    element.innerHTML += token[i];
                    await delay(delayMs);
                }
            }
        }
    }

    function tokenizeHTML(html) {
        const regex = /(<[^>]+>|[^<]+)/g;
        return html.match(regex) || [];
    }

    // Terminal Logging Helper
    function logTerminal(terminalId, text, type = "system-line") {
        const terminal = document.getElementById(terminalId);
        if (!terminal) return;
        const line = document.createElement("div");
        line.className = `terminal-line ${type}`;
        line.textContent = text;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Chat Message Helpers
    function clearChatToPrompt(chatLogId, promptText) {
        const chatLog = document.getElementById(chatLogId);
        if (!chatLog) return;
        chatLog.innerHTML = `
            <div class="chat-message user-message">
                <div class="avatar"><i class='bx bx-user'></i></div>
                <div class="message-bubble">${promptText}</div>
            </div>
        `;
    }

    function clearTerminal(terminalId) {
        const terminal = document.getElementById(terminalId);
        if (terminal) terminal.innerHTML = "";
    }

    function createAgentMessagePlaceholder(chatLogId) {
        const chatLog = document.getElementById(chatLogId);
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message agent-message";
        msgDiv.innerHTML = `
            <div class="avatar"><i class='bx bxs-bot'></i></div>
            <div class="message-bubble">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatLog.appendChild(msgDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
        return msgDiv;
    }

    // 1. SINGLE AGENT SIMULATION
    const runSingleBtn = document.getElementById("run-single-sim");
    const singleChatLog = document.getElementById("single-chat-log");
    const singlePrompt = "Why is the sky blue? Answer in one sentence.";

    if (runSingleBtn) {
        runSingleBtn.addEventListener("click", async () => {
            runSingleBtn.disabled = true;
            clearChatToPrompt("single-chat-log", singlePrompt);
            clearTerminal("single-terminal");

            logTerminal("single-terminal", "> Starting Agent run (single_agent.py)...", "system-line");
            await delay(800);
            
            logTerminal("single-terminal", "[INFO] Initializing Gemini model configuration...", "info-line");
            await delay(600);
            
            logTerminal("single-terminal", `[INFO] Analyzing prompt: "${singlePrompt}"`, "info-line");
            await delay(800);
            
            // Thinking thoughts
            const thoughtText = "User wants a single sentence explanation for sky color. I should explain that the Earth's atmosphere scatters shorter wavelengths of light (blue and violet) in all directions. I will mention Rayleigh scattering.";
            logTerminal("single-terminal", `[THOUGHT] ${thoughtText}`, "thought-line");
            
            const agentMsg = createAgentMessagePlaceholder("single-chat-log");
            await delay(1200);

            // Stream Thought process into Chat UI
            const bubble = agentMsg.querySelector(".message-bubble");
            bubble.innerHTML = ""; // Clear typing indicator

            const thoughtBlock = document.createElement("div");
            thoughtBlock.className = "thought-block";
            thoughtBlock.innerHTML = `
                <div class="thought-header"><i class='bx bx-brain'></i> Thought Process</div>
                <div class="thought-content"></div>
            `;
            bubble.appendChild(thoughtBlock);
            const thoughtContent = thoughtBlock.querySelector(".thought-content");
            await streamTextHTML(thoughtContent, thoughtText, 15);
            await delay(1000);

            // Stream Final Answer
            const answerSpan = document.createElement("span");
            bubble.appendChild(answerSpan);
            
            const finalAnswer = "The sky is blue because the Earth's atmosphere scatters shorter wavelengths of sunlight (blue and violet) in all directions more than other colors, a process known as Rayleigh scattering.";
            logTerminal("single-terminal", `[OUTPUT] ${finalAnswer}`, "output-line");
            
            await streamTextHTML(answerSpan, finalAnswer, 25);
            await delay(600);
            
            logTerminal("single-terminal", "[SUCCESS] Run complete. Terminated gracefully.", "success-line");
            runSingleBtn.disabled = false;
        });
    }

    // 2. MULTI-AGENT SIMULATION
    const runMultiBtn = document.getElementById("run-multi-sim");
    const multiPrompt = "I need a marketing blog post for my new AI startup. Create a content strategy and draft the post.";

    if (runMultiBtn) {
        runMultiBtn.addEventListener("click", async () => {
            runMultiBtn.disabled = true;
            clearChatToPrompt("multi-chat-log", multiPrompt);
            clearTerminal("multi-terminal");

            logTerminal("multi-terminal", "> Starting Multi-Agent Coordinator run (multi_agent.py)...", "system-line");
            await delay(800);

            logTerminal("multi-terminal", "[INFO] Spawning Lead Manager agent...", "info-line");
            await delay(600);

            logTerminal("multi-terminal", "[INFO] Lead Manager analyzing task requirements...", "info-line");
            await delay(800);

            const mThought = "The request has two parts: content strategy and writing the draft. I should delegate the copywriting subtask to a specialized writer subagent while I coordinate and review the final strategy.";
            logTerminal("multi-terminal", `[THOUGHT] ${mThought}`, "thought-line");

            const managerMsg = createAgentMessagePlaceholder("multi-chat-log");
            await delay(1000);

            // Set manager thoughts and initial message in chat
            const bubble = managerMsg.querySelector(".message-bubble");
            bubble.innerHTML = "";

            const thoughtBlock = document.createElement("div");
            thoughtBlock.className = "thought-block";
            thoughtBlock.innerHTML = `
                <div class="thought-header"><i class='bx bx-brain'></i> Coordinator Thought</div>
                <div class="thought-content"></div>
            `;
            bubble.appendChild(thoughtBlock);
            await streamTextHTML(thoughtBlock.querySelector(".thought-content"), mThought, 12);
            await delay(800);

            const managerBodyText = "I will coordinate this project. First, I am setting the <strong>Content Strategy</strong>:<br>1. <strong>Target Audience:</strong> Busy professionals looking to automate routines.<br>2. <strong>Key Message:</strong> AI Agents save up to 10 hours a week.<br><br>Now, I will spawn a specialized Copywriter subagent to draft the actual blog post.";
            const strategySpan = document.createElement("div");
            bubble.appendChild(strategySpan);
            await streamTextHTML(strategySpan, managerBodyText, 18);
            await delay(1000);

            // Spawning subagent card
            logTerminal("multi-terminal", "[INFO] Invoking subagent: Copywriter-Agent (enable_subagents=True)...", "info-line");
            await delay(800);

            const delegationCard = document.createElement("div");
            delegationCard.className = "delegation-card";
            delegationCard.innerHTML = `
                <div class="delegation-header">
                    <span><i class='bx bx-git-branch'></i> Copywriter Subtask</span>
                    <span class="agent-badge">Copywriter-Agent</span>
                </div>
                <div class="delegation-status"><i class='bx bx-loader-alt bx-spin'></i> Writing blog post draft...</div>
            `;
            bubble.appendChild(delegationCard);
            const chatInterface = document.getElementById("multi-chat");
            chatInterface.scrollTop = chatInterface.scrollHeight;

            logTerminal("multi-terminal", "[INFO] Subagent Copywriter-Agent online.", "info-line");
            await delay(600);

            const writerThought = "Drafting a short, high-impact blog draft. Emphasizing timezone-free autonomous actions and productivity.";
            logTerminal("multi-terminal", `[THOUGHT] (Copywriter-Agent) ${writerThought}`, "thought-line");
            await delay(1500);

            const blogDraft = "<strong>Title: Delegate Your Day to AI Agents</strong><br><br>Imagine waking up to find your inbox sorted, your research done, and your reports prepared—all while you slept. This is not the future; it is what you get today using autonomous AI agents. By coupling AI intelligence with custom software integrations, agents take action on your behalf, giving you back hours of creative freedom. Read on to see how you can bootstrap your workspace.";
            logTerminal("multi-terminal", "[INFO] Subagent Copywriter-Agent returning response to Lead Manager.", "info-line");

            // Update subagent card
            delegationCard.querySelector(".delegation-status").innerHTML = `<i class='bx bx-check-circle' style='color: var(--accent-emerald)'></i> Draft complete!`;
            await delay(1000);

            // Lead Manager final review
            logTerminal("multi-terminal", "[INFO] Lead Manager reviewing copywriter output...", "info-line");
            await delay(600);
            
            const reviewThought = "The copy is excellent and matches the strategy perfectly. I will package it with the final delivery layout.";
            logTerminal("multi-terminal", `[THOUGHT] ${reviewThought}`, "thought-line");
            await delay(800);

            // Post Final Answer
            const finalMsg = createAgentMessagePlaceholder("multi-chat-log");
            await delay(800);
            const finalBubble = finalMsg.querySelector(".message-bubble");
            finalBubble.innerHTML = "";

            const finalIntro = "Here is the final output prepared by the team:<br><br><hr style='opacity: 0.15; margin: 0.5rem 0;'><br>";
            const introSpan = document.createElement("span");
            finalBubble.appendChild(introSpan);
            await streamTextHTML(introSpan, finalIntro, 10);

            const postSpan = document.createElement("div");
            postSpan.style.background = "rgba(255,255,255,0.02)";
            postSpan.style.padding = "0.75rem";
            postSpan.style.border = "1px solid rgba(255,255,255,0.05)";
            postSpan.style.borderRadius = "8px";
            finalBubble.appendChild(postSpan);
            await streamTextHTML(postSpan, blogDraft, 15);
            chatInterface.scrollTop = chatInterface.scrollHeight;

            await delay(600);
            logTerminal("multi-terminal", "[SUCCESS] Multi-Agent team execution complete.", "success-line");
            runMultiBtn.disabled = false;
        });
    }

    // 3. MCP CONNECTOR SIMULATION
    const runMcpBtn = document.getElementById("run-mcp-sim");
    const mcpPrompt = "We have a product priced at $150 costing $85 to build. Use custom tools to calculate gross profit margin and generate a SKU.";

    if (runMcpBtn) {
        runMcpBtn.addEventListener("click", async () => {
            runMcpBtn.disabled = true;
            clearChatToPrompt("mcp-chat-log", mcpPrompt);
            clearTerminal("mcp-terminal");

            logTerminal("mcp-terminal", "> Launching FastMCP Server (mcp_server.py)...", "system-line");
            await delay(800);

            logTerminal("mcp-terminal", "[INFO] Server running on stdio transport.", "info-line");
            await delay(600);

            logTerminal("mcp-terminal", "> Starting Client Agent (mcp_agent.py)...", "system-line");
            await delay(600);

            logTerminal("mcp-terminal", "[INFO] Connecting to local MCP server via stdio pipes...", "info-line");
            await delay(600);

            logTerminal("mcp-terminal", "[INFO] Handshake successful. Found 2 tools: calculate_margin, generate_sku", "info-line");
            await delay(800);

            const mcpThought1 = "User needs gross profit margin for a price of 150 and cost of 85. I have the 'calculate_margin' tool. I will call it now.";
            logTerminal("mcp-terminal", `[THOUGHT] ${mcpThought1}`, "thought-line");

            const agentMsg = createAgentMessagePlaceholder("mcp-chat-log");
            await delay(1000);

            const bubble = agentMsg.querySelector(".message-bubble");
            bubble.innerHTML = "";

            // Tool card 1 (Calling)
            logTerminal("mcp-terminal", "[TOOL CALL] calling calculate_margin(price=150, cost=85)", "tool-line");
            const toolCard1 = document.createElement("div");
            toolCard1.className = "tool-call-card";
            toolCard1.innerHTML = `
                <div class="tool-name-badge">calculate_margin</div>
                <div class="tool-params">
                    <span class="tool-label">Inputs:</span>
                    <span class="tool-value">price: 150, cost: 85</span>
                </div>
                <div class="tool-output">
                    <span class="tool-label">Status:</span>
                    <span class="tool-value" style="color: var(--accent-amber)"><i class='bx bx-loader-alt bx-spin'></i> Requesting from MCP...</span>
                </div>
            `;
            bubble.appendChild(toolCard1);
            const chatInterface = document.getElementById("mcp-chat");
            chatInterface.scrollTop = chatInterface.scrollHeight;
            await delay(1200);

            // Tool response 1
            logTerminal("mcp-terminal", "[TOOL RESPONSE] calculate_margin response: {'margin': 43.33}", "tool-line");
            toolCard1.querySelector(".tool-output").innerHTML = `
                <span class="tool-label">Result:</span>
                <span class="tool-value" style="color: var(--accent-emerald)">{"margin": 43.33}</span>
            `;
            await delay(1000);

            // Tool call 2
            const mcpThought2 = "Margin calculation received: 43.33%. Now I must generate a SKU for this widget. I will call 'generate_sku(category='Electronics', name='SmartWidget')'.";
            logTerminal("mcp-terminal", `[THOUGHT] ${mcpThought2}`, "thought-line");
            logTerminal("mcp-terminal", "[TOOL CALL] calling generate_sku(category='Electronics', name='SmartWidget')", "tool-line");
            
            const toolCard2 = document.createElement("div");
            toolCard2.className = "tool-call-card";
            toolCard2.innerHTML = `
                <div class="tool-name-badge">generate_sku</div>
                <div class="tool-params">
                    <span class="tool-label">Inputs:</span>
                    <span class="tool-value">category: "Electronics", name: "SmartWidget"</span>
                </div>
                <div class="tool-output">
                    <span class="tool-label">Status:</span>
                    <span class="tool-value" style="color: var(--accent-amber)"><i class='bx bx-loader-alt bx-spin'></i> Requesting from MCP...</span>
                </div>
            `;
            bubble.appendChild(toolCard2);
            chatInterface.scrollTop = chatInterface.scrollHeight;
            await delay(1200);

            // Tool response 2
            logTerminal("mcp-terminal", "[TOOL RESPONSE] generate_sku response: {'sku': 'ELEC-SMAR-5829'}", "tool-line");
            toolCard2.querySelector(".tool-output").innerHTML = `
                <span class="tool-label">Result:</span>
                <span class="tool-value" style="color: var(--accent-emerald)">{"sku": "ELEC-SMAR-5829"}</span>
            `;
            await delay(1000);

            // Final message compile
            const finalThought = "Both tools completed successfully. Formulating summary response.";
            logTerminal("mcp-terminal", `[THOUGHT] ${finalThought}`, "thought-line");
            await delay(600);

            const finalResponse = "I connected to the local MCP product database and executed your calculations:<br><br>• <strong>Gross Profit Margin:</strong> 43.33%<br>• <strong>Generated SKU:</strong> ELEC-SMAR-5829";
            logTerminal("mcp-terminal", `[OUTPUT] ${finalResponse.replace(/<br>/g, " ")}`, "output-line");

            const responseTextSpan = document.createElement("div");
            responseTextSpan.style.marginTop = "0.75rem";
            bubble.appendChild(responseTextSpan);
            await streamTextHTML(responseTextSpan, finalResponse, 20);
            chatInterface.scrollTop = chatInterface.scrollHeight;

            await delay(600);
            logTerminal("mcp-terminal", "[SUCCESS] Run complete. Connected tools shut down safely.", "success-line");
            runMcpBtn.disabled = false;
        });
    }

    // 4. BROWSER AUTOMATOR SIMULATION
    const runBrowserBtn = document.getElementById("run-browser-sim");
    const browserPrompt = "Navigate to https://example.com and summarize its contents.";

    if (runBrowserBtn) {
        runBrowserBtn.addEventListener("click", async () => {
            runBrowserBtn.disabled = true;
            clearChatToPrompt("browser-chat-log", browserPrompt);
            clearTerminal("browser-terminal");

            logTerminal("browser-terminal", "> Starting Browser Automator Agent (browser_agent.py)...", "system-line");
            await delay(800);

            logTerminal("browser-terminal", "[INFO] Initializing Playwright browser instance (headless=True)...", "info-line");
            await delay(1000);

            const agentMsg = createAgentMessagePlaceholder("browser-chat-log");
            await delay(600);

            const bubble = agentMsg.querySelector(".message-bubble");
            bubble.innerHTML = "";

            // Render browser mockup card
            const browserCard = document.createElement("div");
            browserCard.className = "browser-mockup";
            browserCard.innerHTML = `
                <div class="browser-navbar">
                    <div class="browser-dots">
                        <span class="browser-dot dot-red"></span>
                        <span class="browser-dot dot-yellow"></span>
                        <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-address-bar">
                        <i class='bx bxs-lock-alt'></i> https://example.com
                    </div>
                </div>
                <div class="browser-viewport">
                    <div class="browser-loading-overlay">
                        <div class="spinner"></div>
                        <span style="font-size: 0.75rem; color: #9ca3af;">Loading page...</span>
                    </div>
                    <div class="browser-content" style="opacity: 0;">
                        <h1 class="browser-title">Example Domain</h1>
                        <p class="browser-body-text">This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.</p>
                        <a href="#" style="color: #60a5fa; text-decoration: none; font-size: 0.75rem;">More information...</a>
                    </div>
                </div>
            `;
            bubble.appendChild(browserCard);
            const chatInterface = document.getElementById("browser-chat");
            chatInterface.scrollTop = chatInterface.scrollHeight;

            logTerminal("browser-terminal", "[INFO] Browser launched. Navigating to https://example.com...", "info-line");
            await delay(1500);

            // Show loaded website contents
            logTerminal("browser-terminal", "[INFO] Webpage successfully loaded. Status: 200 OK", "info-line");
            const loadingOverlay = browserCard.querySelector(".browser-loading-overlay");
            const browserContent = browserCard.querySelector(".browser-content");
            loadingOverlay.style.opacity = "0";
            await delay(300);
            loadingOverlay.style.display = "none";
            browserContent.style.opacity = "1";
            await delay(800);

            logTerminal("browser-terminal", "[INFO] Extracting page text elements...", "info-line");
            await delay(800);

            logTerminal("browser-terminal", "[INFO] Extraction complete. Closing browser session.", "info-line");
            const bThought = "Webpage loaded and context read successfully. The website is a standard reference placeholder for documentation. I will write a simple summary for the user.";
            logTerminal("browser-terminal", `[THOUGHT] ${bThought}`, "thought-line");
            await delay(1000);

            const summaryResponse = "I successfully navigated to <strong>example.com</strong> using browser automation. Here is the summary of the page:<br><br>The website is a lightweight placeholder domain maintained by IANA/ICANN. It serves as a universal example for technical documentation, tutorials, and development test cases, ensuring developers can use it without license conflicts.";
            logTerminal("browser-terminal", `[OUTPUT] ${summaryResponse.replace(/<br>/g, " ")}`, "output-line");

            const finalTextDiv = document.createElement("div");
            finalTextDiv.style.marginTop = "0.75rem";
            bubble.appendChild(finalTextDiv);
            await streamTextHTML(finalTextDiv, summaryResponse, 20);
            chatInterface.scrollTop = chatInterface.scrollHeight;

            await delay(600);
            logTerminal("browser-terminal", "[SUCCESS] Browser closed. Process terminated.", "success-line");
            runBrowserBtn.disabled = false;
        });
    }
});
