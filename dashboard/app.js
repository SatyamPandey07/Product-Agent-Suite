/* ==========================================================================
   PRODUCT AGENT SUITE - DYNAMIC SIMULATION ENGINE
   Visualizing Single, Multi, MCP, and Browser Agents with Custom User Input
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Navigation / Tab Handler
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".simulator-section");
    const breadcrumb = document.getElementById("current-breadcrumb");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            const simulatorId = item.getAttribute("data-simulator");
            const tabId = item.getAttribute("data-tab");
            const targetId = simulatorId || tabId;

            navItems.forEach(nav => nav.classList.remove("active"));
            sections.forEach(sec => sec.classList.remove("active"));

            item.classList.add("active");

            const activeSection = document.getElementById(`view-${targetId}`);
            if (activeSection) {
                activeSection.classList.add("active");
            }

            const navText = item.querySelector("span").textContent;
            breadcrumb.textContent = simulatorId ? `${navText} Simulator` : navText;
        });
    });

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // HTML-safe character-by-character typist
    async function streamTextHTML(element, htmlContent, delayMs = 20) {
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
    function renderUserMessage(chatLogId, text) {
        const chatLog = document.getElementById(chatLogId);
        if (!chatLog) return;
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message user-message";
        msgDiv.innerHTML = `
            <div class="avatar"><i class='bx bx-user'></i></div>
            <div class="message-bubble">${text}</div>
        `;
        chatLog.appendChild(msgDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function clearChat(chatLogId) {
        const chatLog = document.getElementById(chatLogId);
        if (chatLog) chatLog.innerHTML = "";
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

    // Helper: Call Gemini API from Browser (if API key is supplied)
    async function fetchGeminiAPI(apiKey, promptText, systemInstruction) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: promptText }]
                    }
                ]
            })
        });
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // ==========================================================================
    // 1. SINGLE AGENT SIMULATION
    // ==========================================================================
    const runSingleBtn = document.getElementById("run-single-sim");
    const singleSendBtn = document.getElementById("single-send-btn");
    const singleInput = document.getElementById("single-input");
    const singleChatLog = document.getElementById("single-chat-log");

    async function executeSingleAgent() {
        const promptText = singleInput.value.trim() || "Why is the sky blue?";
        
        // Disable Controls
        runSingleBtn.disabled = true;
        singleSendBtn.disabled = true;
        singleInput.disabled = true;

        clearChat("single-chat-log");
        clearTerminal("single-terminal");

        // Render User Query in Chat UI
        renderUserMessage("single-chat-log", promptText);

        logTerminal("single-terminal", "> Starting Agent run (single_agent.py)...", "system-line");
        await delay(800);
        
        logTerminal("single-terminal", "[INFO] Initializing Gemini model configuration...", "info-line");
        await delay(600);
        
        logTerminal("single-terminal", `[INFO] Analyzing prompt: "${promptText}"`, "info-line");
        await delay(800);

        const apiKey = document.getElementById("global-api-key").value.trim();
        let thoughtText = "";
        let answerText = "";

        if (apiKey) {
            logTerminal("single-terminal", "[INFO] Contacting Gemini API in real-time...", "info-line");
            try {
                const systemPrompt = "You are a helpful AI assistant. Always structure your response by placing your internal thinking process inside a <thought>...</thought> block first, and then write your final response below it.";
                const rawOutput = await fetchGeminiAPI(apiKey, promptText, systemPrompt);
                
                // Parse thoughts vs final output
                const thoughtMatch = rawOutput.match(/<thought>([\s\S]*?)<\/thought>/i);
                if (thoughtMatch) {
                    thoughtText = thoughtMatch[1].trim();
                    answerText = rawOutput.replace(/<thought>[\s\S]*?<\/thought>/i, "").trim();
                } else {
                    thoughtText = "Analyzing prompt keywords and preparing a structured answer.";
                    answerText = rawOutput;
                }
            } catch (e) {
                logTerminal("single-terminal", `[ERROR] Live API Call failed: ${e.message}. Falling back to simulation...`, "system-line");
                // Fallback to mock
                thoughtText = `Planning how to answer: "${promptText}". Identifying keywords and formulating explaining sentences.`;
                answerText = `I ran a local simulation for your question. You asked: "${promptText}". AI agents use logical chains to process queries. Try pasting a valid Gemini API key in the topbar to see my live responses!`;
            }
        } else {
            // Smart local simulation response
            if (promptText.toLowerCase().includes("blue") && promptText.toLowerCase().includes("sky")) {
                thoughtText = "User wants a single sentence explanation for sky color. I should explain that the Earth's atmosphere scatters shorter wavelengths of light (blue and violet) in all directions. I will mention Rayleigh scattering.";
                answerText = "The sky is blue because the Earth's atmosphere scatters shorter wavelengths of sunlight (blue and violet) in all directions more than other colors, a process known as Rayleigh scattering.";
            } else {
                // Generic response mock
                const keyword = promptText.split(" ").slice(0, 3).join(" ") + "...";
                thoughtText = `User query contains topic "${keyword}". I will structure a helpful, informative reply addressing the user's intent.`;
                answerText = `Here is a custom simulated response to your question: "<strong>${promptText}</strong>".<br><br>AI Agents analyze sentences to determine user intent, retrieve relevant context from memory, and construct a concise summary. Enter your Gemini API key in the top-right field to experience live, real-time responses!`;
            }
        }

        logTerminal("single-terminal", `[THOUGHT] ${thoughtText}`, "thought-line");
        
        const agentMsg = createAgentMessagePlaceholder("single-chat-log");
        await delay(1200);

        const bubble = agentMsg.querySelector(".message-bubble");
        bubble.innerHTML = ""; // Clear typing indicator

        // Stream Thought process into Chat UI
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
        
        logTerminal("single-terminal", `[OUTPUT] ${answerText.replace(/<[^>]+>/g, "")}`, "output-line");
        
        await streamTextHTML(answerSpan, answerText, 20);
        await delay(600);
        
        logTerminal("single-terminal", "[SUCCESS] Run complete. Terminated gracefully.", "success-line");
        
        // Re-enable Controls
        runSingleBtn.disabled = false;
        singleSendBtn.disabled = false;
        singleInput.disabled = false;
    }

    if (runSingleBtn) runSingleBtn.addEventListener("click", executeSingleAgent);
    if (singleSendBtn) singleSendBtn.addEventListener("click", executeSingleAgent);
    if (singleInput) {
        singleInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") executeSingleAgent();
        });
    }

    // ==========================================================================
    // 2. MULTI-AGENT SIMULATION
    // ==========================================================================
    const runMultiBtn = document.getElementById("run-multi-sim");
    const multiSendBtn = document.getElementById("multi-send-btn");
    const multiInput = document.getElementById("multi-input");
    const multiChatLog = document.getElementById("multi-chat-log");

    async function executeMultiAgent() {
        const promptText = multiInput.value.trim() || "I need a marketing blog post for my new AI startup.";

        runMultiBtn.disabled = true;
        multiSendBtn.disabled = true;
        multiInput.disabled = true;

        clearChat("multi-chat-log");
        clearTerminal("multi-terminal");

        renderUserMessage("multi-chat-log", promptText);

        logTerminal("multi-terminal", "> Starting Multi-Agent Coordinator run (multi_agent.py)...", "system-line");
        await delay(800);

        logTerminal("multi-terminal", "[INFO] Spawning Lead Manager agent...", "info-line");
        await delay(600);

        logTerminal("multi-terminal", "[INFO] Lead Manager analyzing task requirements...", "info-line");
        await delay(800);

        // Extract topic
        let topic = "AI startup";
        const topicMatch = promptText.match(/(?:for|about|on)\s+([^.]+)/i);
        if (topicMatch) {
            topic = topicMatch[1].trim();
        }

        const mThought = `The user request involves: "${topic}". This requires a multi-step task: content strategy and writing the draft. I will delegate the writing task to my Copywriter subagent while I build the overall strategy outline.`;
        logTerminal("multi-terminal", `[THOUGHT] ${mThought}`, "thought-line");

        const managerMsg = createAgentMessagePlaceholder("multi-chat-log");
        await delay(1000);

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

        const managerBodyText = `I will coordinate this project. First, I am setting the <strong>Content Strategy</strong> for "${topic}":<br>1. <strong>Target Segment:</strong> Early adopters & target consumers.<br>2. <strong>Key Hook:</strong> Solving core pain points directly related to ${topic}.<br><br>Now, I will spawn a specialized Copywriter subagent to draft the actual copy.`;
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

        const writerThought = `Drafting an engaging and punchy copy focused on: ${topic}. Keeping it professional and high-converting.`;
        logTerminal("multi-terminal", `[THOUGHT] (Copywriter-Agent) ${writerThought}`, "thought-line");
        await delay(1500);

        // Dynamic blog draft generation
        const blogDraft = `<strong>Title: Why You Should Care About ${topic}</strong><br><br>In today's fast-paced environment, keeping up with the latest trends in ${topic} can be a challenge. However, taking a structured approach to solving these issues is the key to unlocking major growth. Modern tools and workflows are making ${topic} more efficient, enabling you to save time, scale your efforts, and focus on what truly matters. Read on to discover how to get started today!`;
        logTerminal("multi-terminal", "[INFO] Subagent Copywriter-Agent returning response to Lead Manager.", "info-line");

        // Update subagent card
        delegationCard.querySelector(".delegation-status").innerHTML = `<i class='bx bx-check-circle' style='color: var(--accent-emerald)'></i> Draft complete!`;
        await delay(1000);

        // Lead Manager final review
        logTerminal("multi-terminal", "[INFO] Lead Manager reviewing copywriter output...", "info-line");
        await delay(600);
        
        const reviewThought = "The draft looks strong. I will format the final response package for the user.";
        logTerminal("multi-terminal", `[THOUGHT] ${reviewThought}`, "thought-line");
        await delay(800);

        // Post Final Answer
        const finalMsg = createAgentMessagePlaceholder("multi-chat-log");
        await delay(800);
        const finalBubble = finalMsg.querySelector(".message-bubble");
        finalBubble.innerHTML = "";

        const finalIntro = "Here is the final output prepared by the multi-agent team:<br><br><hr style='opacity: 0.15; margin: 0.5rem 0;'><br>";
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
        multiSendBtn.disabled = false;
        multiInput.disabled = false;
    }

    if (runMultiBtn) runMultiBtn.addEventListener("click", executeMultiAgent);
    if (multiSendBtn) multiSendBtn.addEventListener("click", executeMultiAgent);
    if (multiInput) {
        multiInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") executeMultiAgent();
        });
    }

    // ==========================================================================
    // 3. MCP CONNECTOR SIMULATION
    // ==========================================================================
    const runMcpBtn = document.getElementById("run-mcp-sim");
    const mcpSendBtn = document.getElementById("mcp-send-btn");
    const mcpInput = document.getElementById("mcp-input");
    const mcpChatLog = document.getElementById("mcp-chat-log");

    async function executeMcpAgent() {
        const promptText = mcpInput.value.trim() || "We have a product priced at $150 costing $85 to build. Calculate gross profit margin and generate SKU.";

        runMcpBtn.disabled = true;
        mcpSendBtn.disabled = true;
        mcpInput.disabled = true;

        clearChat("mcp-chat-log");
        clearTerminal("mcp-terminal");

        renderUserMessage("mcp-chat-log", promptText);

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

        // Math parser
        let price = 150;
        let cost = 85;
        let category = "Electronics";
        let prodName = "SmartWidget";

        // Find numbers in prompt
        const numberMatches = promptText.match(/\d+(?:\.\d+)?/g);
        if (numberMatches && numberMatches.length >= 2) {
            const num1 = parseFloat(numberMatches[0]);
            const num2 = parseFloat(numberMatches[1]);
            // Assume larger is price, smaller is cost
            price = Math.max(num1, num2);
            cost = Math.min(num1, num2);
        } else if (numberMatches && numberMatches.length === 1) {
            price = parseFloat(numberMatches[0]);
            cost = price * 0.55; // default to 55% cost
        }

        // Try to parse category/name keywords
        const lowerPrompt = promptText.toLowerCase();
        if (lowerPrompt.includes("coffee") || lowerPrompt.includes("drink")) {
            category = "Beverage";
            prodName = "DarkRoast";
        } else if (lowerPrompt.includes("shoe") || lowerPrompt.includes("clothing")) {
            category = "Apparel";
            prodName = "Sneakers";
        } else if (lowerPrompt.includes("software") || lowerPrompt.includes("app")) {
            category = "SaaS";
            prodName = "SuiteLic";
        }

        const marginVal = (((price - cost) / price) * 100).toFixed(2);
        const skuString = `${category.slice(0,4).toUpperCase()}-${prodName.slice(0,4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const mcpThought1 = `User needs margin calculations for price of $${price} and cost of $${cost}. Calling calculate_margin tool first.`;
        logTerminal("mcp-terminal", `[THOUGHT] ${mcpThought1}`, "thought-line");

        const agentMsg = createAgentMessagePlaceholder("mcp-chat-log");
        await delay(1000);

        const bubble = agentMsg.querySelector(".message-bubble");
        bubble.innerHTML = "";

        // Tool card 1 (Calling)
        logTerminal("mcp-terminal", `[TOOL CALL] calling calculate_margin(price=${price}, cost=${cost})`, "tool-line");
        const toolCard1 = document.createElement("div");
        toolCard1.className = "tool-call-card";
        toolCard1.innerHTML = `
            <div class="tool-name-badge">calculate_margin</div>
            <div class="tool-params">
                <span class="tool-label">Inputs:</span>
                <span class="tool-value">price: ${price}, cost: ${cost}</span>
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
        logTerminal("mcp-terminal", `[TOOL RESPONSE] calculate_margin response: {'margin': ${marginVal}}`, "tool-line");
        toolCard1.querySelector(".tool-output").innerHTML = `
            <span class="tool-label">Result:</span>
            <span class="tool-value" style="color: var(--accent-emerald)">{"margin": ${marginVal}}</span>
        `;
        await delay(1000);

        // Tool call 2
        const mcpThought2 = `Margin is ${marginVal}%. Now generating a SKU for Category: "${category}", Name: "${prodName}".`;
        logTerminal("mcp-terminal", `[THOUGHT] ${mcpThought2}`, "thought-line");
        logTerminal("mcp-terminal", `[TOOL CALL] calling generate_sku(category='${category}', name='${prodName}')`, "tool-line");
        
        const toolCard2 = document.createElement("div");
        toolCard2.className = "tool-call-card";
        toolCard2.innerHTML = `
            <div class="tool-name-badge">generate_sku</div>
            <div class="tool-params">
                <span class="tool-label">Inputs:</span>
                <span class="tool-value">category: "${category}", name: "${prodName}"</span>
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
        logTerminal("mcp-terminal", `[TOOL RESPONSE] generate_sku response: {'sku': '${skuString}'}`, "tool-line");
        toolCard2.querySelector(".tool-output").innerHTML = `
            <span class="tool-label">Result:</span>
            <span class="tool-value" style="color: var(--accent-emerald)">{"sku": "${skuString}"}</span>
        `;
        await delay(1000);

        // Final response
        const finalThought = "All tool data retrieved. Displaying final margin calculations and product SKU.";
        logTerminal("mcp-terminal", `[THOUGHT] ${finalThought}`, "thought-line");
        await delay(600);

        const finalResponse = `Using connected MCP databases and calculations:<br><br>• <strong>Price:</strong> $${price}<br>• <strong>Cost:</strong> $${cost}<br>• <strong>Gross Profit Margin:</strong> ${marginVal}%<br>• <strong>Generated SKU:</strong> ${skuString}`;
        logTerminal("mcp-terminal", `[OUTPUT] Gross Margin: ${marginVal}%, SKU: ${skuString}`, "output-line");

        const responseTextSpan = document.createElement("div");
        responseTextSpan.style.marginTop = "0.75rem";
        bubble.appendChild(responseTextSpan);
        await streamTextHTML(responseTextSpan, finalResponse, 20);
        chatInterface.scrollTop = chatInterface.scrollHeight;

        await delay(600);
        logTerminal("mcp-terminal", "[SUCCESS] Run complete. Connected tools shut down safely.", "success-line");

        runMcpBtn.disabled = false;
        mcpSendBtn.disabled = false;
        mcpInput.disabled = false;
    }

    if (runMcpBtn) runMcpBtn.addEventListener("click", executeMcpAgent);
    if (mcpSendBtn) mcpSendBtn.addEventListener("click", executeMcpAgent);
    if (mcpInput) {
        mcpInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") executeMcpAgent();
        });
    }

    // ==========================================================================
    // 4. BROWSER AUTOMATOR SIMULATION
    // ==========================================================================
    const runBrowserBtn = document.getElementById("run-browser-sim");
    const browserSendBtn = document.getElementById("browser-send-btn");
    const browserInput = document.getElementById("browser-input");
    const browserChatLog = document.getElementById("browser-chat-log");

    async function executeBrowserAgent() {
        const promptText = browserInput.value.trim() || "Navigate to https://example.com and summarize it.";

        runBrowserBtn.disabled = true;
        browserSendBtn.disabled = true;
        browserInput.disabled = true;

        clearChat("browser-chat-log");
        clearTerminal("browser-terminal");

        renderUserMessage("browser-chat-log", promptText);

        logTerminal("browser-terminal", "> Starting Browser Automator Agent (browser_agent.py)...", "system-line");
        await delay(800);

        logTerminal("browser-terminal", "[INFO] Initializing Playwright browser instance (headless=True)...", "info-line");
        await delay(1000);

        const agentMsg = createAgentMessagePlaceholder("browser-chat-log");
        await delay(600);

        const bubble = agentMsg.querySelector(".message-bubble");
        bubble.innerHTML = "";

        // Extract URL
        let url = "https://example.com";
        const urlMatch = promptText.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) {
            url = urlMatch[0];
        } else {
            const domainMatch = promptText.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
            if (domainMatch) {
                url = `https://${domainMatch[0]}`;
            }
        }

        // Customize mock browser viewport based on URL
        let mockPageTitle = "Example Domain";
        let mockPageBody = "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.";
        let mockLink = "More information...";

        if (url.includes("github.com")) {
            mockPageTitle = "GitHub: Let's build from here";
            mockPageBody = "GitHub is an AI-powered developer platform that allows developers to create, share, and ship software. Millions of developers and companies build on top of GitHub repositories.";
            mockLink = "Explore GitHub repositories...";
        } else if (url.includes("satyampandey.online")) {
            mockPageTitle = "Satyam Pandey | Portfolio";
            mockPageBody = "AI Engineer and Full-stack builder. Specializing in AI workflow designs, single & multi-agent systems, and customized RAG pipelines. Check out featured projects like DocuShift and Precision Oncology.";
            mockLink = "Contact Satyam Pandey...";
        } else if (url.includes("google.com")) {
            mockPageTitle = "Google Search";
            mockPageBody = "Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for.";
            mockLink = "Google Services Overview...";
        }

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
                    <i class='bx bxs-lock-alt'></i> ${url}
                </div>
            </div>
            <div class="browser-viewport">
                <div class="browser-loading-overlay">
                    <div class="spinner"></div>
                    <span style="font-size: 0.75rem; color: #9ca3af;">Loading page...</span>
                </div>
                <div class="browser-content" style="opacity: 0;">
                    <h1 class="browser-title">${mockPageTitle}</h1>
                    <p class="browser-body-text">${mockPageBody}</p>
                    <a href="#" style="color: #60a5fa; text-decoration: none; font-size: 0.75rem;">${mockLink}</a>
                </div>
            </div>
        `;
        bubble.appendChild(browserCard);
        const chatInterface = document.getElementById("browser-chat");
        chatInterface.scrollTop = chatInterface.scrollHeight;

        logTerminal("browser-terminal", `[INFO] Browser launched. Navigating to ${url}...`, "info-line");
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
        const bThought = `Scrape complete. Extracted text from "${mockPageTitle}". Generating brief summary for user.`;
        logTerminal("browser-terminal", `[THOUGHT] ${bThought}`, "thought-line");
        await delay(1000);

        const summaryResponse = `I successfully navigated to <strong>${url}</strong> using Playwright. Here is a summary of the site content:<br><br>The website is titled <strong>"${mockPageTitle}"</strong>. Main contents detail:<br><em>"${mockPageBody}"</em>`;
        logTerminal("browser-terminal", `[OUTPUT] Scraped: "${mockPageTitle}"`, "output-line");

        const finalTextDiv = document.createElement("div");
        finalTextDiv.style.marginTop = "0.75rem";
        bubble.appendChild(finalTextDiv);
        await streamTextHTML(finalTextDiv, summaryResponse, 20);
        chatInterface.scrollTop = chatInterface.scrollHeight;

        await delay(600);
        logTerminal("browser-terminal", "[SUCCESS] Browser closed. Process terminated.", "success-line");

        runBrowserBtn.disabled = false;
        browserSendBtn.disabled = false;
        browserInput.disabled = false;
    }

    if (runBrowserBtn) runBrowserBtn.addEventListener("click", executeBrowserAgent);
    if (browserSendBtn) browserSendBtn.addEventListener("click", executeBrowserAgent);
    if (browserInput) {
        browserInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") executeBrowserAgent();
        });
    }
});
