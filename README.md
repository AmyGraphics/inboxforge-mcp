# 📬 InboxForge MCP — Autonomous Email Deliverability Engineering

[![MCP](https://img.shields.io/badge/MCP-Server-blue)](https://modelcontextprotocol.io)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com)
[![Smithery](https://img.shields.io/badge/Smithery-100%2F100-brightgreen)](https://smithery.ai)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Your emails are landing in spam and you don't know why.** Open rates collapsed. Cold outreach vanishes. The newsletter sits in Promotions — or worse. Meanwhile Gmail and Yahoo now **reject unauthenticated bulk mail outright**, enforce a 0.3% spam-rate ceiling, and mandate one-click unsubscribe. Deliverability stopped being optional in 2024 — InboxForge turns it into engineering.

**InboxForge** is a 5-tool MCP server that diagnoses why mail gets filtered, engineers the complete SPF/DKIM/DMARC stack with copy-paste records, designs organic inbox warmup protocols, eliminates spam triggers across all three trigger families, and architects compliant sending infrastructure that scales without torching your primary domain.

🔗 **Live endpoint:** `https://inboxforge-api.agentweb-hub.workers.dev/mcp`
🏠 **Full 51-server catalog:** [MCP Hub](https://mcp-hub.agentweb-hub.workers.dev)

---

## 🛠️ Tools

| Tool | What it does |
|------|--------------|
| `inbox.architect` | **Master 1-shot engine** — full diagnosis across the 5 deliverability layers (auth → reputation → engagement → content → infrastructure), situation-specific triage, ordered fix sequence & the free monitoring stack |
| `inbox.dns_auth` | Complete SPF/DKIM/DMARC engineering: the 10-lookup limit, 2048-bit DKIM selector strategy, progressive DMARC rollout (none → quarantine → reject), BIMI/MTA-STS/TLS-RPT/PTR, with Google Workspace / Microsoft 365 / custom SMTP paths |
| `inbox.warmup` | Week-by-week warmup ramps for new domains, dormant revivals, ESP migrations & volume scale-ups — with engagement engineering, volume math and failure-signal response ladders |
| `inbox.spam_triggers` | Kills content, technical and reputation triggers: link patterns, HTML soup, List-Unsubscribe compliance, spam traps, the 0.3% complaint wall — with before/after rewrites and B2B gateway vs consumer Gmail calibration |
| `inbox.sending_infra` | Root-domain firewall, lookalike portfolios, mailbox fleet math, ESP selection matrix, CAN-SPAM/GDPR compliance layer & scaling playbooks from solo founder to high-volume ops |

---

## ⚡ Quick Start

Add to your MCP client (Cursor, Claude Code, Windsurf, or any MCP-compatible agent):

```json
{
  "mcpServers": {
    "inboxforge": {
      "url": "https://inboxforge-api.agentweb-hub.workers.dev/mcp"
    }
  }
}
```

Then ask your agent things like:

- *"My cold emails dropped from 60% to 12% opens — diagnose it"*
- *"Generate the full SPF/DKIM/DMARC setup for my Google Workspace domain"*
- *"Design a warmup plan for a brand-new sending domain targeting 500/day"*
- *"Audit my email template for spam triggers before I send to 10k subscribers"*

---

## 🔴 NEW in v1.1 — Live DNS Audit

`inbox.audit_domain_live` queries **real DNS records in real time** (DNS-over-HTTPS): your actual SPF record and lookup-count risk, your DMARC policy level, MX records, and optional DKIM selector verification — with a prioritized fix list computed from what is actually published right now. Try it: pass your own domain.

## 💰 Pricing

**Start free — 10 requests/day, no signup, no card.**

| Tier | Price | What you get |
|------|-------|--------------|
| **Freemium** | $0 | 10 requests/day, all 5 tools |
| **Single Tool Pro** | $7.99 lifetime | Unlimited InboxForge requests |
| **All-Access Suite** | $14.99 lifetime | Unlimited requests across **all 51 MCP servers** |

### 🛒 Gumroad (PayPal & Cards)

👉 **[Get Pro on Gumroad](https://amygraphics.gumroad.com/l/mcp-pro)** — instant license delivery.

### ⚡ Solana USDC (instant, borderless)

Send $7.99 (single) or $14.99 (suite) USDC to:

```
8sDLX3okSV974wdjdeKhN9uWLZDr45DeGCJ28zgTLEdJ
```

Then verify: `POST https://inboxforge-api.agentweb-hub.workers.dev/verify-solana` with `{"signature":"<tx_signature>"}`.

---

## 🏗️ Architecture

- **Runtime:** Cloudflare Workers (global edge, ~0ms cold starts)
- **Protocol:** MCP via streamable HTTP (`/mcp`), JSON-RPC 2.0
- **Spec:** protocol `2024-11-05`, full `inputSchema` + `outputSchema` + annotations on every tool
- **Health:** `GET /health`

## 🌐 More MCP Servers

InboxForge is part of a 51-server autonomous MCP suite — SEO, databases, security, video, design, courses, agencies, personal brands and more:

👉 **[Browse the full MCP Hub](https://mcp-hub.agentweb-hub.workers.dev)**

## 📄 License

MIT — build freely.
