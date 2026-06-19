# Context7 MCP Server Integration Guide

This guide describes how to configure and use the official **Context7 MCP server** (developed by Upstash, official website: https://context7.com, source repository: https://github.com/upstash/context7-mcp) within this template. Context7 allows AI coding assistants to fetch real-time, version-specific documentation and code examples from external repositories (e.g., Next.js, React, Supabase, Hono) during development.

> [!IMPORTANT]
> **Mandatory Reference Rule:** For any external library, framework, or API integration (e.g., Next.js App Router, Hono, Supabase JS client, Tailwind CSS, etc.), AI agents MUST retrieve the live documentation via Context7 before writing or modifying code. This prevents obsolete syntax and coding hallucinations.

---

## 1. What is Context7?

Context7 acts as a **Model Context Protocol (MCP)** server. Instead of the AI assistant relying solely on its static training data (which might contain outdated API signatures), Context7 retrieves up-to-date documentation live at query time, preventing code hallucinations.

---

## 2. Configuration Instructions

Ensure you have **Node.js v18.0.0** or newer installed. You can configure Context7 for your specific assistant using one of the following methods:

### Option A: Automatic CLI Setup (Recommended)

Run the Context7 setup CLI and follow the prompts to configure your IDE automatically:

```bash
npx ctx7 setup
```

### Option B: Manual IDE Configuration

#### For Cursor

1. Go to **Settings** -> **Features** -> **MCP**.
2. Click **+ Add New MCP Server**.
3. Fill in the fields:
   - **Name:** `context7`
   - **Type:** `command`
   - **Command:** `npx -y @upstash/context7-mcp`
4. Click **Save** and restart Cursor.

#### For Claude Desktop

Add the configuration to your global `claude_desktop_config.json` file (typically located in `%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

#### For Claude Code (CLI)

Add the server entry to your global `claude.json` configuration file:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

---

## 3. Recommended: API Key Setup

While Context7 works out-of-the-box, it operates under default rate limits. To get higher limits, obtain a free API key from [context7.com/dashboard](https://context7.com/dashboard).

Provide the API key by passing it as an argument:

```json
"args": [
  "-y",
  "@upstash/context7-mcp",
  "--api-key",
  "YOUR_API_KEY"
]
```

Alternatively, set the `CONTEXT7_API_KEY` environment variable in your terminal environment.

---

## 4. How to Use

When asking the AI assistant about an external API or library, prompt it to use Context7 by including `use context7`:

- _Example:_ `"How do I configure routing in Hono? use context7"`
- _Example:_ `"Show me how to perform pagination in Supabase using JS. use context7"`

The agent will automatically use the MCP server to fetch the latest docs.
