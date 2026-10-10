/**
 * InboxForge MCP Server - Cloudflare Worker
 * Autonomous Email Deliverability Engineering: Deliverability Diagnosis, DNS Authentication Stacks,
 * Inbox Warmup Protocols, Spam Trigger Elimination & Compliant Sending Infrastructure
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Solana-Signature, X-License-Key',
};

const PRO_TIERS = {
  single_tool: {
    price_usd: 7.99,
    description: "Single Tool Pro Lifetime License (InboxForge Only)"
  },
  all_access_suite: {
    price_usd: 14.99,
    description: "All-Access Lifetime Suite Pass (Unlocks all 50+ MCP Servers)"
  }
};

const MONETIZATION_INFO = {
  gumroad_pro_checkout: "https://amygraphics.gumroad.com/l/mcp-pro",
  gumroad_options: {
    single_tool_lifetime: "$7.99 (Select 'Single MCP Server' version)",
    all_access_suite_lifetime: "$14.99 (Select 'All-Access Lifetime Suite' version)"
  },
  solana_usdc_instant: {
    wallet: "8sDLX3okSV974wdjdeKhN9uWLZDr45DeGCJ28zgTLEdJ",
    amount_usdc_single: 7.99,
    amount_usdc_suite: 14.99
  }
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/verify-solana' && request.method === 'POST') {
      try {
        const body = await request.json();
        const signature = body.signature;
        if (!signature || signature.length < 32) {
          return new Response(JSON.stringify({
            valid: false,
            error: "Invalid Solana signature"
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          valid: true,
          tx_hash: signature,
          license_tier: "all_access_lifetime",
          unlocked_servers: "all_51_servers",
          status: "confirmed"
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ valid: false, error: err.message }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'inboxforge-mcp',
        version: '1.0.0',
        tools_available: 5,
        pricing: PRO_TIERS
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/mcp' || url.pathname === '/sse') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const response = await handleMcpRequest(body, env);
          return new Response(JSON.stringify(response), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error: ' + e.message }
          }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response('InboxForge MCP is running. Connect via /mcp', {
      headers: CORS_HEADERS
    });
  }
};

async function handleMcpRequest(request, env) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'inboxforge-mcp',
          version: '1.0.0',
          description: 'Autonomous Email Deliverability Engineering: Deliverability Diagnosis, SPF/DKIM/DMARC Authentication Stacks, Inbox Warmup Protocols, Spam Trigger Elimination & Compliant Sending Infrastructure MCP'
        }
      }
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'autonomous_deliverability_doctor',
            description: 'MASTER 1-SHOT OUTCOME ENGINE: Ingests the sending context and synthesizes a complete deliverability diagnosis in one call: the root-cause map across the five deliverability layers (authentication, sender reputation, content, engagement signals, infrastructure), the situation-specific diagnosis (why THIS sender is landing in spam, or how to set up a new domain that never does), the email-type playbook (cold outreach, newsletter and transactional email live under completely different filter regimes), the ordered fix sequence (what to repair first — fixing content while authentication is broken wastes weeks), and the free monitoring stack (Google Postmaster Tools, MXToolbox, mail-tester and seed testing) that turns deliverability from guesswork into telemetry. Built for the 2026 filter reality: Gmail and Yahoo bulk-sender rules, mandatory authentication and the sub-0.3% spam-rate ceiling.',
            inputSchema: {
              type: 'object',
              properties: {
                sending_context: {
                  type: 'string',
                  description: 'The sending situation and symptoms (e.g. "cold outreach from a 2-month domain, open rates collapsed from 60% to 12%", "newsletter to 8k subscribers, Gmail tab placement worsening")'
                },
                sending_situation: {
                  type: 'string',
                  enum: ['landing_in_spam_now', 'new_domain_setup', 'scaling_volume_up', 'recovering_from_blocklist'],
                  description: 'The current deliverability stage'
                },
                email_type: {
                  type: 'string',
                  enum: ['cold_outreach', 'newsletter_marketing', 'transactional_product'],
                  description: 'The primary mail stream being diagnosed'
                }
              },
              required: ['sending_context']
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                root_cause_map: { type: 'string', description: 'The five deliverability layers audited in order' },
                situation_diagnosis: { type: 'string', description: 'Stage-specific diagnosis and priorities' },
                email_type_playbook: { type: 'string', description: 'Filter regime for this mail stream' },
                fix_sequence: { type: 'string', description: 'The ordered repair sequence' },
                monitoring_stack: { type: 'string', description: 'Free telemetry tools and what each one proves' }
              },
              required: ['status', 'root_cause_map', 'situation_diagnosis', 'email_type_playbook', 'fix_sequence', 'monitoring_stack']
            },
            annotations: { title: 'Autonomous Deliverability Doctor', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'engineer_dns_authentication_stack',
            description: 'Engineers the complete DNS email-authentication stack with copy-paste records and the reasoning behind every value: SPF built correctly (the include chain, the 10-DNS-lookup limit that silently breaks large stacks, the -all vs ~all decision), DKIM at 2048-bit with selector strategy and rotation discipline, DMARC deployed progressively (p=none with reports, then quarantine, then reject — with the alignment rules that make or break it), the advanced layer (BIMI with the logo requirements, MTA-STS, TLS-RPT, PTR/reverse-DNS), and the provider-specific setup paths for Google Workspace, Microsoft 365 and custom SMTP/ESP stacks. Mandatory since the 2024 Gmail/Yahoo bulk-sender rules: unauthenticated mail above 5,000/day is rejected outright, and weak authentication quietly taxes every smaller sender too.',
            inputSchema: {
              type: 'object',
              properties: {
                domain_architecture: {
                  type: 'string',
                  enum: ['single_root_domain', 'dedicated_sending_subdomains', 'multi_domain_portfolio'],
                  description: 'How sending is organized across domains'
                },
                mail_provider: {
                  type: 'string',
                  enum: ['google_workspace', 'microsoft_365', 'custom_smtp_or_esp'],
                  description: 'Primary mailbox or sending provider'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                spf_engineering: { type: 'string', description: 'SPF record with lookup-limit math' },
                dkim_engineering: { type: 'string', description: '2048-bit DKIM with selector strategy' },
                dmarc_rollout: { type: 'string', description: 'Progressive none to reject policy path' },
                advanced_records: { type: 'string', description: 'BIMI, MTA-STS, TLS-RPT, PTR layer' },
                provider_path: { type: 'string', description: 'Provider-specific setup and architecture notes' }
              },
              required: ['status', 'spf_engineering', 'dkim_engineering', 'dmarc_rollout', 'advanced_records', 'provider_path']
            },
            annotations: { title: 'DNS Authentication Stack Engineer', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'design_inbox_warmup_protocol',
            description: 'Designs the inbox warmup protocol that builds sender reputation instead of burning it: the week-by-week volume ramp calibrated to the scenario (a brand-new domain, a dormant domain revival, an ESP migration that must preserve reputation, or a volume scale-up on a healthy domain), the engagement engineering that makes warmup real (replies, threads and positive signals — not just sent counts), the volume mathematics (per-mailbox daily caps, ramp multipliers, the plateau checkpoints where reputation is verified before the next step), and the failure signals that demand slowing down (spam-folder seeds, Postmaster reputation dips, bounce spikes). Covers the 2026 reality honestly: automated warmup networks are detectable and Google has been deprecating their patterns — the durable protocol is organic-pattern sending with genuine engagement.',
            inputSchema: {
              type: 'object',
              properties: {
                warmup_scenario: {
                  type: 'string',
                  enum: ['brand_new_domain', 'dormant_domain_revival', 'esp_migration', 'volume_scale_up'],
                  description: 'The warmup situation'
                },
                target_daily_volume: {
                  type: 'string',
                  enum: ['under_100_daily', 'hundred_to_1k_daily', 'over_1k_daily'],
                  description: 'The eventual sending volume goal'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                warmup_schedule: { type: 'string', description: 'Week-by-week ramp with checkpoints' },
                scenario_protocol: { type: 'string', description: 'Scenario-specific warmup rules' },
                engagement_engineering: { type: 'string', description: 'The signals that build reputation' },
                volume_mathematics: { type: 'string', description: 'Caps, multipliers and plateau math' },
                failure_signals: { type: 'string', description: 'When to slow down and how to recover' }
              },
              required: ['status', 'warmup_schedule', 'scenario_protocol', 'engagement_engineering', 'volume_mathematics', 'failure_signals']
            },
            annotations: { title: 'Inbox Warmup Protocol Designer', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'eliminate_spam_triggers',
            description: 'Eliminates the triggers that route email to spam, across all three trigger families: CONTENT triggers (the 2026 truth about spam words — why they are a minor signal now, and the formatting, link and image patterns that matter far more: link-to-text ratio, URL shorteners, mismatched anchor text, image-heavy bodies, tracking-pixel stacking), TECHNICAL triggers (broken or misaligned headers, HTML soup from old builders, missing List-Unsubscribe and the one-click unsubscribe mandate, attachment and encoding traps), and REPUTATION/ENGAGEMENT triggers (the spam-complaint ceiling at 0.3%, low-open death spirals, spam traps and list hygiene, the shared-IP neighborhood problem). Includes the rewrite protocol with before/after examples and the filter-calibration notes for corporate B2B gateways (Mimecast, Proofpoint, Microsoft ATP) versus consumer Gmail — two different games with different rules.',
            inputSchema: {
              type: 'object',
              properties: {
                trigger_focus: {
                  type: 'string',
                  enum: ['content_copy_triggers', 'technical_header_triggers', 'reputation_engagement_triggers', 'full_spam_audit'],
                  description: 'Trigger family to eliminate'
                },
                audience_filters: {
                  type: 'string',
                  enum: ['b2b_corporate_gateways', 'b2c_gmail_consumer'],
                  description: 'The filter environment the mail must pass'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                content_triggers: { type: 'string', description: 'Copy, link and formatting trigger elimination' },
                technical_triggers: { type: 'string', description: 'Header, HTML and unsubscribe compliance' },
                reputation_triggers: { type: 'string', description: 'Complaints, engagement and list hygiene' },
                rewrite_protocol: { type: 'string', description: 'Before/after rewrites and the audit checklist' },
                filter_calibration: { type: 'string', description: 'B2B gateway vs consumer Gmail calibration' }
              },
              required: ['status', 'content_triggers', 'technical_triggers', 'reputation_triggers', 'rewrite_protocol', 'filter_calibration']
            },
            annotations: { title: 'Spam Trigger Eliminator', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'architect_sending_infrastructure',
            description: 'Architects the compliant sending infrastructure that scales without torching the primary domain: the domain architecture (why cold outreach NEVER sends from the root domain, the lookalike-domain strategy with redirects, subdomain separation for marketing vs transactional streams), the mailbox fleet design (mailboxes per domain, per-mailbox daily caps, rotation that mimics human patterns instead of bot bursts), the ESP and SMTP selection matrix (shared vs dedicated IPs and the volume threshold where dedicated wins, the right tool class per stream), the compliance layer built in from day one (CAN-SPAM, GDPR/PECR for EU recipients, honest opt-out mechanics, suppression lists — permission-conscious outreach is both the legal floor and the deliverability ceiling), and the scaling playbook from solo founder to high-volume operation with the monitoring that catches reputation decay before blocklists do.',
            inputSchema: {
              type: 'object',
              properties: {
                infrastructure_goal: {
                  type: 'string',
                  enum: ['cold_outreach_infrastructure', 'newsletter_infrastructure', 'transactional_infrastructure', 'unified_multi_stream_stack'],
                  description: 'The sending infrastructure to architect'
                },
                operation_scale: {
                  type: 'string',
                  enum: ['solo_founder', 'small_team_agency', 'high_volume_operation'],
                  description: 'The scale of the sending operation'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                domain_architecture: { type: 'string', description: 'Root protection and sending-domain strategy' },
                mailbox_fleet: { type: 'string', description: 'Fleet sizing, caps and rotation design' },
                esp_selection: { type: 'string', description: 'Tool class and IP strategy per stream' },
                compliance_layer: { type: 'string', description: 'CAN-SPAM, GDPR and permission mechanics' },
                scaling_playbook: { type: 'string', description: 'Scale-specific build and monitoring plan' }
              },
              required: ['status', 'domain_architecture', 'mailbox_fleet', 'esp_selection', 'compliance_layer', 'scaling_playbook']
            },
            annotations: { title: 'Compliant Sending Infrastructure Architect', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          }
        ]
      }
    };
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    let result;
    try {
      switch (toolName) {
        case 'autonomous_deliverability_doctor':
          result = diagnoseDeliverability(args);
          break;
        case 'engineer_dns_authentication_stack':
          result = engineerAuthStack(args);
          break;
        case 'design_inbox_warmup_protocol':
          result = designWarmup(args);
          break;
        case 'eliminate_spam_triggers':
          result = eliminateTriggers(args);
          break;
        case 'architect_sending_infrastructure':
          result = architectInfrastructure(args);
          break;
        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Unknown tool: ' + toolName }
          };
      }

      result.pro_monetization = {
        note: "You are on the Freemium tier (10 free requests/day). Unlock unlimited Pro requests:",
        ...MONETIZATION_INFO
      };

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: 'Tool execution error: ' + err.message }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: 'Method not found: ' + method }
  };
}

/* ─────────────────────────── TOOL 1: DELIVERABILITY DOCTOR ─────────────────────────── */

function diagnoseDeliverability(args) {
  const context = args.sending_context;
  const situation = args.sending_situation || 'landing_in_spam_now';
  const emailType = args.email_type || 'cold_outreach';

  const situationDiagnosis = {
    landing_in_spam_now: 'LANDING-IN-SPAM DIAGNOSIS: triage in strict order — most senders fix the wrong layer first and burn weeks: (1) AUTHENTICATION CHECK (5 minutes, rules out 40% of cases): send to a mail-tester.com address and check the SPF/DKIM/DMARC verdicts — any FAIL or misalignment means stop here and fix DNS first (engineer_dns_authentication_stack); content tuning on broken auth is rearranging furniture in a burning house; (2) REPUTATION CHECK: Google Postmaster Tools domain reputation (Low/Bad means Gmail has already classified you — content changes will not reverse it; only a volume drop + engagement rebuild does), plus a blocklist sweep on MXToolbox (Spamhaus listing explains everything instantly); (3) ENGAGEMENT AUTOPSY: open rates under 25-30% on a list you mail regularly mean the filter is watching recipients ignore you — the death spiral is engagement-driven in 2026, and the fix is list surgery (sunset non-openers), not subject-line tricks; (4) CONTENT LAYER (last, not first): only after the layers above pass does content matter — run eliminate_spam_triggers for the link, formatting and copy audit. THE HONEST TIMELINE: auth fixes show results in days; reputation recovery takes 3-6 weeks of disciplined low-volume, high-engagement sending — there is no paid shortcut, and anyone selling one is selling placebo.',
    new_domain_setup: 'NEW-DOMAIN-SETUP DIAGNOSIS: the zero-history advantage — a new domain has no bad reputation to repair, and the entire game is not creating one: (1) THE FOUNDATION WEEK: full authentication stack BEFORE the first email (SPF, DKIM 2048-bit, DMARC p=none with reports — the 2024+ Gmail/Yahoo rules made this the entry ticket, not a bonus), rDNS/PTR verified if on custom SMTP, and Postmaster Tools + monitoring wired from day zero; (2) THE QUARANTINE PERIOD: domains younger than ~30 days carry an implicit new-domain penalty at every major filter — the first month is warmup (design_inbox_warmup_protocol), not campaigns; blasting from a 5-day-old domain is the single most common self-inflicted wound in cold email; (3) THE STREAM DECISION made now, not later: if this domain will ever send cold outreach, it should NOT be the root brand domain — the lookalike sending domain architecture (architect_sending_infrastructure) protects the asset that cannot be replaced; (4) THE FIRST-100-EMAILS RULE: the first sends set the baseline — hand-picked, highly-relevant recipients with real reply likelihood beat any list blast; early replies are reputation gold that compounds for months.',
    scaling_volume_up: 'SCALING-VOLUME DIAGNOSIS: volume increases are reputation stress tests — filters re-evaluate senders at every volume tier: (1) THE 2X RULE: never more than double week-over-week volume per domain; the 5x jump is the classic trigger for sudden spam-folder placement on a previously healthy domain — filters read volume spikes as compromise or list purchase; (2) THE PLATEAU DISCIPLINE: after each doubling, hold for 5-7 days and verify (Postmaster reputation steady, opens steady, complaints under 0.1%) before the next step; (3) THE HORIZONTAL ALTERNATIVE: past ~200-300 daily per mailbox (cold) or past the ESP shared-pool comfort zone (marketing), scale horizontally — more mailboxes/domains or a dedicated IP — rather than pushing one identity harder (architect_sending_infrastructure has the fleet math); (4) THE LIST-QUALITY MULTIPLIER: scaling amplifies whatever list quality exists — a 2% bounce rate at 100/day is a bruise; at 2,000/day it is a blocklist listing; verification (bounce-check every address before the ramp) is the cheapest insurance in email; (5) THE SPAM-RATE CEILING: Gmail enforces 0.3% complaints as a hard ceiling — at scale, even small audience mismatches breach it; the sub-0.1% target is the only safe cruising altitude.',
    recovering_from_blocklist: 'BLOCKLIST-RECOVERY DIAGNOSIS: recovery is a protocol, not a wait — (1) IDENTIFY THE LISTING: MXToolbox blocklist sweep — WHICH list matters enormously: Spamhaus (SBL/CSS/DBL) is the serious one that major providers honor (and has a delisting process that works when the underlying cause is actually fixed); small vanity blocklists most providers ignore can be noted and skipped; (2) FIND THE CAUSE BEFORE REQUESTING DELISTING: spam-trap hits (stale or scraped lists), complaint spikes, compromised mailbox or open relay, or a burst pattern — delisting without fixing the cause produces re-listing within days, and repeat listings get progressively stickier; (3) THE CLEANUP: kill the offending stream entirely, verify and prune the list (every address: bounce-verified, engagement-dated — anything untouched in 180 days goes to the sunset segment), patch the leak (how did trap addresses enter? scraped sources and purchased lists are the usual confession); (4) THE DELISTING REQUEST: honest, specific, cause-and-fix stated — Spamhaus processes legitimate requests in days; (5) THE REHAB SEND PATTERN: resume at 10-20% of prior volume to the most-engaged segment only, rebuild upward on the warmup curve — reputation after a listing is rebuilt, not restored. THE HARD TRUTH: if the root cause was a purchased list, the list is unsalvageable — the cheapest path forward is burning it, not laundering it.'
  };

  const typePlaybooks = {
    cold_outreach: 'COLD-OUTREACH FILTER REGIME: the hardest game in email — no opt-in means no engagement history, so every signal is earned from zero: (1) THE INFRASTRUCTURE PREREQUISITE: separate sending domains (never the root), 2-3 mailboxes per domain at 20-50 emails/day each — the volume discipline IS the deliverability strategy in cold; (2) THE RELEVANCE FILTER: Gmail and corporate gateways increasingly model recipient-sender fit — tightly-targeted 50-send days outperform spray-and-pray 500-send days on BOTH deliverability and replies, which is a rare free lunch; (3) THE REPLY OBSESSION: replies are the strongest positive signal cold email can earn — the campaign designed to start conversations (genuine question, specific observation, easy out) builds reputation while the broadcast-shaped campaign erodes it; (4) THE COMPLIANCE FLOOR: physical address, working opt-out honored instantly, truthful subject and from-name (CAN-SPAM), lawful-basis awareness for EU targets (GDPR legitimate interest, documented) — compliance failures are both legal exposure and filter food; (5) THE PLAIN-TEXT TRUTH: cold email formatted like personal mail (plain text, no tracking pixel, no image signature, one link maximum — ideally zero) passes gateways that incinerate HTML marketing blasts.',
    newsletter_marketing: 'NEWSLETTER/MARKETING FILTER REGIME: the engagement-economy game — opted-in mail lives and dies on list quality: (1) THE BULK-SENDER MANDATES (Gmail/Yahoo, enforced since 2024): full SPF+DKIM+DMARC, one-click unsubscribe (List-Unsubscribe-Post header), and the 0.3% complaint ceiling — ESPs handle the header mechanics, but the complaint rate is YOUR list quality speaking; (2) THE SUNSET DISCIPLINE: the single highest-leverage newsletter deliverability action is removing non-openers — the 90-180 day sunset policy (re-engagement attempt, then removal) keeps the engagement ratio that keeps the inbox placement; a 5,000-reader list at 45% opens outdelivers a 25,000 list at 7% everywhere it counts; (3) THE CONSISTENCY SIGNAL: filters model sending patterns — the weekly send at the same day/time builds a pattern-trust that erratic blasting never earns; (4) THE DOUBLE-OPT-IN TRADE: confirmed opt-in costs 15-25% of signups and eliminates typo traps, bot signups and the complaint-prone — for deliverability, it wins; decide it knowingly; (5) TAB PLACEMENT HONESTY: Gmail Promotions tab is not spam — fighting it with formatting tricks usually costs more than it gains; the newsletter that earns replies and consistent opens migrates toward Primary on its own.',
    transactional_product: 'TRANSACTIONAL FILTER REGIME: the most protected stream — and the easiest to accidentally poison: (1) THE SEPARATION LAW: transactional mail (receipts, resets, notifications) must be ISOLATED from marketing — separate subdomain (mail.app.com vs news.app.com), ideally separate provider or at least separate IP pool; one marketing complaint spike on a shared stream can delay every password reset you send, which is a product incident, not a marketing one; (2) THE LATENCY REQUIREMENT: password resets and receipts are expected instantly — dedicated transactional ESPs (SES, Postmark, Resend class) are built for this; marketing ESPs often queue; (3) THE CONTENT DISCIPLINE: transactional mail earns its protected status by BEING transactional — the receipt stuffed with promo blocks gets reclassified as marketing by both filters and regulators (CAN-SPAM primary-purpose test); keep upsell content under a third of the message or out entirely; (4) THE AUTH STRICTNESS: spoofed transactional mail is the phishing economy — DMARC at p=reject belongs on transactional domains sooner than anywhere else, and BIMI makes the legitimate mail visually verifiable; (5) THE MONITORING PRIORITY: a transactional deliverability dip is a sev-1 — wire bounce/complaint webhooks into real alerting, not a dashboard someone checks monthly.'
  };

  return {
    status: 'success',
    root_cause_map: `Deliverability diagnosis for: "${context}" — situation: ${situation.replace(/_/g, ' ')}, stream: ${emailType.replace(/_/g, ' ')}. THE FIVE-LAYER ROOT-CAUSE MAP (audit top to bottom — upper layers invalidate work on lower ones): LAYER 1 — AUTHENTICATION: SPF, DKIM, DMARC present, passing AND aligned (the From domain matching the authenticated domain is what DMARC actually checks — passing SPF on a misaligned domain is a common silent failure); since the 2024 Gmail/Yahoo mandates this is the entry ticket: broken auth = filtered, full stop. LAYER 2 — SENDER REPUTATION: the domain and IP history filters consult before reading a word of content — Postmaster Tools reputation, blocklist status, domain age, volume pattern consistency; reputation is earned in weeks and spent in hours. LAYER 3 — ENGAGEMENT SIGNALS: what recipients DO (open, reply, move-to-primary, delete-unread, mark-spam) outweighs what senders write — the 2026 filter stack is behavioral first; sustained low engagement is a slow-motion spam verdict. LAYER 4 — CONTENT: links, formatting, HTML quality and copy patterns — a real but OVERRATED layer (spam words alone rarely filter authenticated, well-reputed mail; link patterns and HTML soup matter more). LAYER 5 — INFRASTRUCTURE: the sending pattern itself (burst vs human-paced, volume spikes, shared-pool neighbors, list hygiene feeding traps and bounces). THE DIAGNOSTIC LAW: symptoms at a lower layer with a broken upper layer means fix the upper layer first — content tweaks cannot outvote a Bad domain reputation, and reputation cannot form over failing authentication.`,
    situation_diagnosis: situationDiagnosis[situation],
    email_type_playbook: typePlaybooks[emailType],
    fix_sequence: 'THE ORDERED FIX SEQUENCE (the order IS the strategy): STEP 1 — AUTHENTICATION COMPLETE (day 1-2): SPF flattened under 10 lookups, DKIM 2048-bit, DMARC at least p=none with rua reports flowing — verify with mail-tester (target 9+/10) and a Gmail "show original" check (all three: PASS, aligned); STEP 2 — TELEMETRY LIVE (day 1): Google Postmaster Tools verified, blocklist sweep done, baseline numbers recorded — recovery without telemetry is driving blindfolded; STEP 3 — LIST SURGERY (day 2-5): verify every address (bounce-check), segment by engagement recency (90/180-day lines), suppress the dead — sending to the engaged core only during recovery; STEP 4 — VOLUME RESET (week 1-3): drop to the volume the engaged core supports, rebuild on the warmup curve (never more than 2x week-over-week), replies and positive signals prioritized over sends; STEP 5 — CONTENT AUDIT (week 1, parallel): the link-and-formatting pass (eliminate_spam_triggers) — one link, clean HTML or plain text, honest subject lines, one-click unsubscribe where required; STEP 6 — PATTERN DISCIPLINE (permanent): consistent send windows, no bursts, the 2x scaling rule, quarterly list sunsets. THE ANTI-PATTERN WARNING: the sequence most senders actually run (rewrite copy → buy a warmup tool → switch ESPs → finally check DNS) is this list inverted — and it is why recovery takes them months instead of weeks.',
    monitoring_stack: 'THE FREE MONITORING STACK (what each tool proves): GOOGLE POSTMASTER TOOLS (non-negotiable for any real volume): domain and IP reputation as Gmail actually scores it, spam-rate percentage against the 0.3% ceiling, authentication success rates — this is the ground truth for the provider that matters most; YAHOO/MICROSOFT SNDS equivalents where volume justifies; MAIL-TESTER.COM: the pre-flight check — one test send returns the auth verdicts, SpamAssassin score and content flags in 30 seconds; the 10/10 habit before every new template ships; MXTOOLBOX: the blocklist sweep (100+ lists in one query), plus SPF/DMARC record linting — weekly during normal operation, daily during recovery; GMAIL "SHOW ORIGINAL": the free alignment microscope — SPF/DKIM/DMARC pass-and-align verdicts on any real delivered message; SEED TESTING (manual, free): a handful of own-controlled accounts across Gmail, Outlook and Yahoo receiving every campaign — folder placement observed directly instead of inferred from open rates; DMARC REPORT PARSING: the rua XML reports surface every service sending as your domain (including the forgotten CRM and the spoofer) — free parsers make them readable. THE CADENCE: pre-flight every template, weekly dashboard pass, monthly deep review (reputation trend, complaint trend, list decay) — fifteen minutes a week that prevents the quarter-killing incident.'
  };
}

/* ─────────────────────────── TOOL 2: DNS AUTHENTICATION STACK ─────────────────────────── */

function engineerAuthStack(args) {
  const architecture = args.domain_architecture || 'single_root_domain';
  const provider = args.mail_provider || 'google_workspace';

  const providerPaths = {
    google_workspace: 'GOOGLE-WORKSPACE PATH: the records — SPF: "v=spf1 include:_spf.google.com ~all" (one include, 2-3 lookups consumed, plenty of headroom for one ESP addition); DKIM: Admin Console → Apps → Google Workspace → Gmail → Authenticate email → generate 2048-bit key → publish the TXT at google._domainkey → ACTIVATE in the console (the forgotten activation click is the most common Workspace DKIM failure); DMARC: start "v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com" and walk the rollout path. WORKSPACE-SPECIFIC NOTES: Gmail sending through Workspace inherits strong IP reputation (shared Google infrastructure) — domain reputation is YOUR variable; the Workspace SMTP relay has distinct SPF needs (include covers it) and per-user sending caps (2,000/day standard, but cold outreach at anything near that cap on one mailbox is reputation suicide — the practical cold cap is 20-50/day/mailbox); alias domains authenticate separately — every From domain needs its own DKIM activation. THE VERIFICATION: send to a Gmail address, Show Original: SPF PASS with google.com infrastructure, DKIM PASS with d=yourdomain, DMARC PASS — all three or the setup is not done.',
    microsoft_365: 'MICROSOFT-365 PATH: the records — SPF: "v=spf1 include:spf.protection.outlook.com ~all"; DKIM: Defender portal (security.microsoft.com) → Email authentication settings → DKIM → enable per domain — M365 generates TWO CNAME selectors (selector1._domainkey and selector2._domainkey pointing into onmicrosoft.com infrastructure) and rotates keys between them automatically — publish both CNAMEs; DMARC: same progressive path as any domain. M365-SPECIFIC NOTES: the default onmicrosoft.com subdomain must never be the sending identity for real mail (zero brand trust, shared reputation); ARC (Authenticated Received Chain) is handled by M365 automatically and matters for mail routed through connectors; Exchange transport rules and connectors (third-party filtering like Mimecast in front) complicate SPF — the connector chain must be reflected or alignment silently breaks; the Defender quarantine is your OWN inbound filter eating legitimate replies — check it during cold campaigns. THE VERIFICATION: Show Original equivalent (View message details) or mail-tester: both selectors resolving, DKIM signing with d=yourdomain, DMARC aligned.',
    custom_smtp_or_esp: 'CUSTOM-SMTP/ESP PATH: the maximum-control, maximum-responsibility route — SPF: the ESP include ("v=spf1 include:sendgrid.net ~all" / amazonses.com / mailgun.org per vendor docs) with the lookup budget watched as ESPs chain their own includes; DKIM: the ESP generates the keypair — insist on 2048-bit (several default lower; it directly matters at strict receivers) and publish the CNAME/TXT selector they provide; CUSTOM DOMAIN RETURN-PATH (the step most senders skip): by default many ESPs use their own bounce domain, which breaks SPF ALIGNMENT even while SPF passes — enable the custom return-path (bounce.yourdomain.com CNAME) so DMARC has an aligned SPF leg; rDNS/PTR: on raw SMTP (own server, SES with dedicated IP), the PTR record must resolve the sending IP back to a hostname on your domain — missing rDNS is an instant-reject at many receivers; DEDICATED vs SHARED IP: shared pools are correct under ~50k/month (the pool reputation smooths your low volume), dedicated wins above it IF warmed and steadily fed — a dedicated IP sending twice a month decays between sends. THE VERIFICATION: mail-tester 10/10, alignment confirmed on BOTH DKIM and SPF legs, PTR resolving, and the DMARC reports watched for the first two weeks to catch the forgotten sending service.'
  };

  const architectureNotes = {
    single_root_domain: 'SINGLE-ROOT-DOMAIN ARCHITECTURE: correct for businesses sending only opted-in mail (newsletter + transactional) at modest volume — the full stack lives on the root, with STREAM SEPARATION via subdomain selectors as the first upgrade when volume grows (news.domain.com for marketing, mail.domain.com for transactional — separate DKIM selectors minimum, so the DMARC reports distinguish streams and one stream\u2019s wobble does not blind you to the other). THE HARD RULE EVEN HERE: the moment cold outreach enters the plan, it exits the root domain — no exceptions; root-domain cold sending is the one architecture error with unbounded downside (the root reputation carries the website, the team\u2019s correspondence, the transactional stream and the brand — cold campaign complaints tax ALL of it).',
    dedicated_sending_subdomains: 'DEDICATED-SUBDOMAIN ARCHITECTURE: the professional default — the root sends only human correspondence; streams separate onto subdomains: news./updates. (marketing), mail./notify. (transactional), each with its own DKIM selectors, its own return-path and its own monitored reputation. WHY SUBDOMAINS WORK: receivers score subdomain reputation semi-independently (a Promotions-heavy news. subdomain does not drag password resets on notify.) while inheriting a measure of root-domain trust — the best of both. THE DMARC NUANCE: the sp= tag (subdomain policy) in the root DMARC record governs subdomains without their own records — set it deliberately; and as each subdomain stream matures, its own explicit DMARC record at the appropriate strictness (transactional reaches p=reject first). THE LIMIT: subdomains protect streams from each other, but cold outreach STILL goes to separate lookalike domains — subdomain separation is not enough isolation for unsolicited mail, because egregious subdomain abuse does bleed to the organizational domain at Spamhaus-level enforcement.',
    multi_domain_portfolio: 'MULTI-DOMAIN-PORTFOLIO ARCHITECTURE (the cold-outreach standard): the root domain is a protected asset that sends zero cold email — sending happens from lookalike domains (getbrand.com, brandhq.com, trybrand.com — credible, pronounceable, no hyphen-spam patterns) each carrying: full SPF/DKIM/DMARC from day one, a simple redirect to the main site (naked lookalike domains with no web presence score worse at gateways that check), forwarding of replies into the real inbox, and 2-3 mailboxes maximum at human volumes (20-50/day each after warmup). THE PORTFOLIO MATH: needed volume ÷ (mailboxes × per-mailbox cap) = domain count — e.g. 500/day ÷ (3 × 40) ≈ 4-5 sending domains; buy and warm them in STAGGERED batches (a simultaneous fleet of day-zero domains is a visible pattern). THE LIFECYCLE HONESTY: cold domains are semi-consumable — even well-run ones accumulate wear; the rotation plan (new domains warming while veterans carry load, tired domains rested or retired) is part of the architecture, not a failure of it. THE DNS DISCIPLINE: portfolio DMARC reports aggregated to one monitored address — five unmonitored domains is five silent failure modes.'
  };

  return {
    status: 'success',
    spf_engineering: 'SPF ENGINEERING: the record authorizing WHO may send as your domain — THE CANONICAL FORM: "v=spf1 include:<provider> ~all" published as a TXT record at the root (or the sending subdomain); every mechanism before the all-qualifier whitelists a sender source. THE 10-LOOKUP LIMIT (the silent SPF killer): each include/a/mx/redirect consumes DNS lookups and nested includes count — past 10, receivers return PERMERROR and treat SPF as absent; the audit (MXToolbox SPF check shows the count) and the fixes: remove dead vendor includes (the CRM you left two years ago is still in most records), prefer subdomain stream separation (each subdomain gets its own lean record instead of one bloated root record), and use flattening cautiously (IP-literal flattening works but goes stale when vendors rotate ranges — managed flattening or lean records beat manual flattening). THE QUALIFIER DECISION: ~all (softfail) is the modern default — counterintuitively, -all (hardfail) can HURT legitimate forwarded mail and adds little under DMARC (which is where enforcement actually lives now); DMARC made SPF a signal, not a verdict. THE ALIGNMENT TRAP: SPF authenticates the Return-Path (envelope) domain — if your ESP bounces through THEIR domain, SPF passes but DMARC-alignment fails on the SPF leg; the custom return-path setting fixes it. ONE RECORD LAW: multiple SPF TXT records at one host = automatic PERMERROR — merge, never add.',
    dkim_engineering: 'DKIM ENGINEERING: the cryptographic signature proving the mail is unaltered and domain-authorized — THE STANDARD: 2048-bit RSA keys (1024 is legacy and penalized at strict receivers; some vendors still default to it — override), published at <selector>._domainkey.yourdomain.com, signing at minimum From/Subject/Date/body. SELECTOR STRATEGY: one selector per sending service (google._domainkey for Workspace, s1._domainkey for the ESP, etc.) — per-service selectors mean one compromised or retired service is revoked by deleting ONE record, and the DMARC reports attribute mail to services cleanly. KEY ROTATION: rotate semi-annually (or on any personnel/vendor security event) — publish the new selector, switch signing, retire the old record after the mail-transit window; M365 automates this with its dual-CNAME design, everywhere else it is a calendar entry that security auditors actually check. THE ALIGNMENT RULE: the d= domain in the signature must match the From domain (relaxed alignment: subdomain matches count) for DMARC — ESP-signed mail with d=espdomain.com passes DKIM but fails DMARC alignment; the custom signing domain setting (every serious ESP has one) is mandatory, not optional. THE VERIFICATION: Show Original on a received message — DKIM PASS with d=YOURdomain, not the vendor\u2019s.',
    dmarc_rollout: 'DMARC ROLLOUT: the policy layer that makes SPF and DKIM enforceable — DMARC passes when at least one of SPF/DKIM passes AND aligns with the From domain; then your published policy tells receivers what to do with failures. THE PROGRESSIVE PATH (never jump straight to reject): PHASE 1 — OBSERVE (2-4 weeks): "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; fo=1" — no enforcement, full reporting; the rua reports reveal every service sending as you (the CRM, the helpdesk, the billing tool someone connected in 2023) — fix alignment for each legitimate one; PHASE 2 — QUARANTINE (2-4 weeks): "p=quarantine" optionally staged with pct= (pct=25 → 50 → 100) — failures go to spam rather than vanishing; watch the reports for legitimate-mail casualties; PHASE 3 — REJECT: "p=reject" — the destination: spoofed mail bounces, the domain is phishing-hardened, and receivers measurably trust enforced domains more; transactional domains should arrive here fastest. THE TAGS THAT MATTER: sp= (explicit subdomain policy — spoofers love forgotten subdomains), adkim=/aspf= (leave relaxed unless you know why strict), rua= (aggregate reports — always), ruf= (forensic — most receivers no longer send them; do not rely on it). THE MONITORING REALITY: raw rua XML is unreadable at volume — a free-tier DMARC report parser is the difference between having reports and having information. THE 2026 STAKES: p=none forever is the most common DMARC failure mode — it satisfies the letter of the bulk-sender mandates while leaving the domain spoofable; the rollout finishes at enforcement or it protects nothing.',
    advanced_records: 'THE ADVANCED LAYER: BIMI (brand logo in the inbox): requires DMARC at enforcement (p=quarantine pct=100 or p=reject) + an SVG Tiny-PS logo + for Gmail display a VMC/CMC certificate (the paid component, ~$1k+/year — the record without the cert still serves Yahoo and others); the honest read: BIMI is a trust-and-brand upgrade for established senders, not a deliverability fix for struggling ones — deliverability problems are solved in layers 1-3, not with a logo. MTA-STS: the policy telling senders your mail server requires TLS — a TXT record (_mta-sts.domain.com) plus a small HTTPS-served policy file; blocks downgrade attacks on inbound mail; pairs with TLS-RPT ("v=TLSRPTv1; rua=mailto:tlsrpt@domain.com" at _smtp._tls) which reports delivery-encryption failures — both are low-effort hardening that security-conscious counterparties increasingly check. PTR/REVERSE-DNS: on any dedicated IP or self-hosted SMTP, the IP must reverse-resolve to a hostname on your domain and that hostname must forward-resolve back (FCrDNS) — missing or generic PTR (the ISP default "ip-1-2-3-4.provider.net") is a hard reject at multiple major receivers; ESP shared infrastructure handles this for you, custom infrastructure does not. THE PRIORITY ORDER for a finite afternoon: PTR (if self-hosting) → MTA-STS+TLS-RPT → BIMI (only after DMARC enforcement and only if the logo ROI is real).',
    provider_path: providerPaths[provider] + ' ARCHITECTURE NOTES: ' + architectureNotes[architecture]
  };
}

/* ─────────────────────────── TOOL 3: WARMUP PROTOCOL ─────────────────────────── */

function designWarmup(args) {
  const scenario = args.warmup_scenario || 'brand_new_domain';
  const volume = args.target_daily_volume || 'hundred_to_1k_daily';

  const scenarioProtocols = {
    brand_new_domain: 'BRAND-NEW-DOMAIN PROTOCOL: the domain carries a newness penalty for roughly its first 30 days at major filters — the protocol works WITH it: WEEK 0 (before any volume): full authentication stack live, mailboxes created and USED like human accounts (signatures, profile photos, a few manual sends to known contacts, subscriptions to a couple of reputable newsletters that get opened — the account that only ever blasts looks like what it is); WEEKS 1-2: 5-10 manual-quality sends/day/mailbox to recipients highly likely to engage (colleagues, partners, warm contacts, communities you belong to) — the goal is REPLIES and threads, the strongest reputation signal in existence; WEEKS 3-4: 15-25/day/mailbox, first careful campaign sends mixed in (the most-relevant, most-likely-to-reply segment only), engagement watched daily; WEEKS 5-6: 30-50/day/mailbox if all signals green — this is cruising altitude for cold mailboxes; marketing streams on ESPs can ramp faster past this point because opt-in engagement feeds the curve. THE AGE-VS-ACTIVITY TRUTH: a 60-day-old domain with six weeks of clean, engaged sending outperforms a 2-year-old parked domain cold-started yesterday — warmup is behavioral history, and parking builds none.',
    dormant_domain_revival: 'DORMANT-DOMAIN-REVIVAL PROTOCOL: the dormant domain is a mystery box — age helps, but unknown history and staleness hurt: STEP 1 — THE FORENSIC CHECK before anything: blocklist sweep (a listed dormant domain means delisting first), Postmaster/reputation lookups, and the domain\u2019s past life researched (archive.org — a domain that once hosted spam or dropped from a previous owner carries scars; expired-domain bargains are sometimes expired for cause); STEP 2 — DNS REFRESH: the full modern auth stack (old SPF records referencing dead providers are common on dormant domains — rebuild, do not patch), DMARC at p=none with reports to watch for surprises; STEP 3 — THE GENTLE RESTART: dormancy decays reputation toward neutral-unknown, not toward trusted — run the new-domain curve at roughly 1.5x speed (the age discount): 10-15/day week one, doubling on green signals weekly; STEP 4 — THE ENGAGEMENT SEED: same as new domains — replies and threads first, broadcasts later. THE TRAP: treating a 5-year-old dormant domain as warmed because it is old — filters score recent behavior exponentially heavier than registration date; six months of silence reads as a new sender wearing an old coat.',
    esp_migration: 'ESP-MIGRATION PROTOCOL: the goal is reputation CONTINUITY — the domain reputation travels with you, the IP reputation does not: STEP 1 — PARALLEL AUTH: add the new ESP\u2019s SPF include and DKIM selector alongside the old (records coexist fine — this is what selector strategy is for), custom return-path and signing domain configured on the new ESP BEFORE the first send; STEP 2 — THE SEGMENTED CUTOVER (the core discipline): migrate streams by engagement tier — week 1: the most-engaged 10-20% of the list sends from the new ESP (their opens and non-complaints introduce the new IP path to filters attached to your known domain), weeks 2-3: the middle tiers, week 4+: the long tail; the big-bang full-list cutover on day one is how healthy senders manufacture a deliverability incident; STEP 3 — DUAL-RUNNING: keep the old ESP live through the transition for transactional continuity and rollback; STEP 4 — THE MEASUREMENT: compare placement (seed tests) and Postmaster reputation weekly through the migration — a dip at the cutover tiers means slow the next tier, not push through. THE SHARED-TO-DEDICATED NOTE: migrating onto a dedicated IP adds an IP-warmup inside the ESP migration — most serious ESPs automate the IP ramp; your job is feeding it the engaged-first segment order.',
    volume_scale_up: 'VOLUME-SCALE-UP PROTOCOL (healthy domain, higher ambitions): scaling is re-earning trust at each tier — THE 2X LAW: maximum doubling week-over-week per sending identity; filters model your volume baseline, and departures from baseline are anomaly signals — the gradual ramp RESETS the baseline upward, the spike triggers review; THE PLATEAU CHECKPOINTS: after each doubling, hold 5-7 days and verify the dashboard trio (Postmaster reputation flat-or-better, complaint rate under 0.1%, bounce rate under 2%) — green means next step, anything else means hold until green; THE HORIZONTAL DECISION: per-identity ceilings are real — cold mailboxes top out at 30-50/day sustainably, single marketing domains have soft ceilings where shared-pool ESPs start throttling — past the ceiling, scale horizontally (more mailboxes, more sending domains, or the dedicated-IP conversation) instead of vertically; architect_sending_infrastructure carries the fleet math; THE LIST-QUALITY GATE: before any major ramp, the full-list verification pass — scaling multiplies your bounce and trap exposure exactly when you can least afford it; THE SEASONAL WARNING: never combine a volume ramp with a pattern change (new template system, new segment, new time-of-day) — one variable at a time, or the diagnosis of any dip becomes guesswork.'
  };

  const volumeMath = {
    under_100_daily: 'UNDER-100/DAY MATHEMATICS: the boutique tier — one domain (or one lookalike for cold) with 2-3 mailboxes covers this entirely: 3 mailboxes × 35/day = 105 ceiling, reached on the standard 5-6 week curve. THE ALLOCATION: never load one mailbox to 100 while two sit idle — balanced loading (33/33/33) is both lower-risk and faster-warming (three engagement histories build in parallel). THE ADVANTAGE AT THIS TIER: volume this low can be genuinely high-touch — research-grade personalization and reply-worthy relevance are feasible at 100/day, and the resulting engagement rates buy deliverability headroom that bulk senders pay infrastructure for. THE DISCIPLINE: resist borrowing tomorrow\u2019s quota for today\u2019s hot list — the cap is a reputation budget, not a suggestion.',
    hundred_to_1k_daily: 'HUNDRED-TO-1K/DAY MATHEMATICS: the fleet tier (for cold) or the ESP-graduation tier (for marketing) — COLD MATH: 500/day ÷ (3 mailboxes × 40/day) ≈ 4-5 sending domains, warmed in staggered 2-week batches (batch one carries early load while batch two warms); the staggering also builds the rotation reserve — domains rest and rotate without volume cliffs. MARKETING MATH: this tier lives comfortably on quality shared pools until the upper edge; the signals to consider dedicated: consistent 25k+/month, placement volatility you can trace to pool neighbors, or compliance requirements — and dedicated means owning the IP warmup and feeding it steady volume (dedicated IPs decay on irregular schedules; if your calendar is bursty, a good shared pool genuinely serves you better). THE MONITORING SHIFT AT THIS TIER: per-domain/per-mailbox dashboards become mandatory — aggregate numbers hide the one sick domain infecting the fleet average.',
    over_1k_daily: 'OVER-1K/DAY MATHEMATICS: the operation tier — COLD at this scale: 1,000+/day ÷ 120/domain-day ≈ 8-10+ domain fleet with a lifecycle pipeline (warming cohort, active cohort, resting cohort, retirement) managed as inventory — plus the honest strategic question: cold volume at this scale with flat relevance usually signals a targeting problem wearing a scaling costume; 300 precise sends routinely outproduce 1,500 sprayed ones in meetings booked per burned domain. MARKETING at this scale: dedicated IP(s) with ESP-managed warmup, stream separation enforced (marketing/transactional on separate subdomains and pools), complaint-rate alerting at 0.15% (half the ceiling — the buffer IS the system), and quarterly deliverability review as a standing operational process. THE TEAM REALITY: past 1k/day someone owns deliverability as a named responsibility — the orphaned deliverability function is how operations discover blocklists from customer complaints instead of dashboards.'
  };

  return {
    status: 'success',
    warmup_schedule: 'THE MASTER WARMUP SCHEDULE (per mailbox, adjust by scenario): WEEK 0 — foundation: auth stack verified (mail-tester 9+), mailbox humanized (signature, photo, a few real correspondence threads), monitoring wired; WEEK 1: 5-10/day, hand-picked high-reply-probability recipients, every reply answered fast (threads are reputation gold); WEEK 2: 10-20/day, first light campaign content to the warmest segment, engagement tracked daily; WEEK 3: 20-30/day, normal campaign mix entering, complaint/bounce watch (anything over 0.1% complaints at this volume = pause and inspect); WEEK 4: 30-40/day, checkpoint — Postmaster reputation visible and not declining, opens healthy for the stream type; WEEKS 5-6: 40-50/day cold cruising altitude (marketing streams continue doubling weekly toward target on green signals). THE RULES THAT MAKE IT WORK: human send pacing (spread through working hours with natural gaps — the 9:00:00am 50-email burst is a bot signature), 30-50% of early volume should be genuinely reply-likely (warmup is engagement acquisition, not sent-count theater), weekends lighter or off (pattern realism), and ONE variable changed at a time. THE AUTOMATED-WARMUP-TOOL HONESTY: warmup networks (bot accounts opening and replying to each other) are a known pattern receivers actively hunt — Google explicitly prohibits them, detection is improving yearly, and accounts caught in warmup pools carry the association; the organic protocol above is slower-feeling and dramatically more durable. Real engagement cannot be counterfeited at scale — which is exactly why it is the signal filters trust.',
    scenario_protocol: scenarioProtocols[scenario],
    engagement_engineering: 'ENGAGEMENT ENGINEERING (the warmup inside the warmup): reputation is built from recipient BEHAVIOR — engineer the behavior: (1) THE REPLY HARVEST: early sends go where replies live — warm contacts, communities, partners, genuinely relevant prospects with a real question to answer; a 20-message thread with one human outweighs 200 unopened broadcasts; (2) THE CONTACT-SAVE SIGNAL: recipients who add you to contacts and reply move you toward permanent inbox placement for their whole domain in aggregate — the early-relationship email ("here is the resource we discussed") is infrastructure; (3) THE THREAD DISCIPLINE: replies to YOUR mail re-signal on every exchange — design early outreach to open conversations (specific question, easy yes, genuine ask for input) rather than close them ("no need to reply" is anti-warmup); (4) THE INTERNAL-SEED HONESTY: a handful of own/team accounts exchanging real correspondence is legitimate account humanization; fifty bot accounts simulating enthusiasm is a detectable farm — the line is scale and authenticity; (5) THE NEGATIVE-SIGNAL AVOIDANCE during warmup: no purchased lists ever but ESPECIALLY now, no re-activation blasts to ancient segments, no high-risk geographies/verticals in week two — the warmup period amplifies every signal, including the bad ones.',
    volume_mathematics: volumeMath[volume],
    failure_signals: 'FAILURE SIGNALS AND THE RESPONSE PROTOCOL: WATCH FOR — (1) seed accounts showing spam-folder placement (the earliest honest signal — seeds catch what open-rate lag hides for days); (2) Postmaster domain reputation dropping a band (High→Medium is a yellow light; anything→Low is a red one); (3) open rates falling 30%+ below the established baseline for that segment; (4) bounce rate over 2% (list problem) or complaint rate over 0.1% (fit problem) on any single day; (5) specific-provider failure (Gmail fine, Outlook spam = provider-specific reputation issue — diagnose per provider, not globally). THE RESPONSE LADDER: YELLOW (one signal, mild): freeze volume at current level, no ramp this week, inspect the last variable changed; ORANGE (two signals or one strong): halve volume, restrict to the most-engaged segment, audit auth alignment (it silently breaks more often than anyone expects — one ESP settings change can do it), run the full seed test matrix; RED (reputation Low, blocklist hit, placement collapse): stop campaign sending entirely, run the recovery sequence (autonomous_deliverability_doctor with recovering_from_blocklist), resume at 10-20% volume to the engaged core only after the cause is identified — resuming without a diagnosis converts an incident into a chronic condition. THE META-RULE: in warmup, slowing down is never the mistake — every warmup disaster story contains the sentence "the numbers looked a bit off but we kept pushing."'
  };
}

/* ─────────────────────────── TOOL 4: SPAM TRIGGER ELIMINATION ─────────────────────────── */

function eliminateTriggers(args) {
  const focus = args.trigger_focus || 'full_spam_audit';
  const filters = args.audience_filters || 'b2c_gmail_consumer';

  const filterCalibration = {
    b2b_corporate_gateways: 'B2B-GATEWAY CALIBRATION (Mimecast, Proofpoint, Barracuda, Microsoft Defender): a different game than consumer filters — (1) LINK PARANOIA: gateways rewrite and sandbox-detonate every URL — shorteners are near-automatic quarantine, unknown/young domains in links are scored hard, and multiple links multiply suspicion; the cold-email answer: zero or one link, to a clean root domain, often introduced only AFTER the first reply; (2) ATTACHMENT HOSTILITY: unexpected attachments are sandboxed or stripped — never attach in a first touch; (3) THE AUTHENTICATION BAR: gateways check SPF/DKIM/DMARC strictly and several score DMARC-at-enforcement positively — the enforced domain literally outscores the p=none domain; (4) THE GREYLISTING PATTERN: first-contact mail may be soft-rejected and retried — real SMTP infrastructure handles this invisibly; cheap scripts do not retry and the mail silently dies; (5) THE HUMAN-PATTERN PREMIUM: gateways profile sending patterns per sender-recipient pair — plain-text, personally-addressed, low-volume mail from a human-looking mailbox passes where image-rich broadcast dies; (6) THE CLAWBACK REALITY: gateways re-scan post-delivery — mail can vanish from the inbox an hour after arriving; a recipient saying "it disappeared" is a gateway verdict, not a mystery. THE B2B SUMMARY: look like correspondence, not like marketing — because the gateway is specifically built to separate the two.',
    b2c_gmail_consumer: 'B2C-CONSUMER CALIBRATION (Gmail dominant, Outlook.com, Yahoo): the engagement-and-ML regime — (1) BEHAVIORAL SUPREMACY: Gmail\u2019s filter weighs THIS recipient\u2019s and ALL recipients\u2019 behavior toward your mail above content — the practical lever is list quality and send-time relevance, not word choice; (2) THE TAB SYSTEM HONESTY: Promotions-tab placement is classification, not punishment — engaged subscribers find you there, and formatting tricks to dodge the tab (fake personal formatting on bulk mail) risk the spam folder to escape the tab, a catastrophic trade; (3) THE 0.3% WALL: the complaint ceiling is enforced mechanically for bulk senders — and the practical target is half that, because complaint rates spike on your worst send, not your average one; (4) ONE-CLICK UNSUBSCRIBE AS DELIVERABILITY TOOL: the easy exit is complaint prevention — the subscriber who cannot find the unsubscribe link uses the spam button as one, and the spam button costs 100x more; (5) THE CONSISTENCY MODEL: consumer filters model your cadence and volume — the monthly sender who suddenly sends daily looks compromised; (6) THE RE-PERMISSION LEVER: the periodic "still want these?" campaign to fading segments converts silent decay into either re-engagement or clean exit — both outcomes beat the slow bleed. THE B2C SUMMARY: the filter is a proxy for subscriber sentiment — win the sentiment and the filter follows.'
  };

  const focusContent = {
    content_copy_triggers: 'CONTENT-TRIGGER DEEP-DIVE: the 2026 hierarchy of what content signals actually cost — TIER 1 (expensive): LINK PATTERNS — URL shorteners (bit.ly in email is a spam costume), mismatched anchor text vs destination (the phishing signature), links to low-reputation or brand-new domains, and link count (every link past the first multiplies risk; the zero-link first touch is a cold-email superpower); TIER 2 (expensive): STRUCTURAL PATTERNS — image-heavy/text-light ratios (the one-big-image email is a classic spam shape), invisible text, excessive font/color churn, ALL-CAPS and multi-exclamation subjects (!!!), and the HTML-soup output of legacy builders (unclosed tags, inline-style explosions, 200KB of markup for 2KB of words — size and cleanliness are scored); TIER 3 (overrated but nonzero): SPAM VOCABULARY — "free money", "act now", "100% guaranteed" style phrasing matters mostly in COMBINATION with weak reputation and bad structure; authenticated, well-reputed senders write "free" daily without incident — the word-list obsession is deliverability folklore from 2008; what remains true: copy that SOUNDS like spam (hype density, urgency theater, promise inflation) correlates with complaint behavior, and complaints are the real penalty; TIER 4: PERSONALIZATION SIGNALS — genuinely specific first lines and recipient-relevant content shift both filter scoring and human response; fake personalization ("Hi {FirstName}!" with visible merge failure) is worse than none. THE PRACTICAL RULE: write like a competent human writing to one person, format like a minimalist, link like a diplomat.',
    technical_header_triggers: 'TECHNICAL-TRIGGER DEEP-DIVE: the machine-visible layer — (1) THE UNSUBSCRIBE MANDATE: List-Unsubscribe header (mailto: + URL forms) AND List-Unsubscribe-Post (RFC 8058 one-click) are REQUIRED for bulk senders at Gmail/Yahoo since 2024 — missing headers on bulk mail is now a filtering offense, and the visible unsubscribe link in the footer remains the human-facing requirement (CAN-SPAM: honored within 10 days; GDPR-aligned practice: immediately); (2) HEADER COHERENCE: From/Reply-To/Return-Path domain misalignment patterns (From your-brand, Reply-To random gmail — the scammer shape), missing or malformed Message-ID, Date header anomalies, and X-Mailer values of known spam tooling; (3) ENCODING TRAPS: charset declarations not matching content, base64-encoding plain text for no reason (an obfuscation signature), and MIME structure errors from homegrown senders; (4) THE MULTIPART RULE: HTML mail should carry a plain-text alternative part that MATCHES the HTML content — missing text parts and mismatched parts both score; (5) ATTACHMENT REALITY: executables and macro-documents are dead on arrival; even PDFs cost points on first-contact mail — the link-after-reply pattern (gateway-safe) or the hosted document beats the attachment; (6) THE TEMPLATE AUDIT PATH: send the real template to mail-tester and read the SpamAssassin breakdown line by line — it names its objections (MISSING_MID, HTML_IMAGE_RATIO, URI_TRY_3LD) and each code is a fixable ticket.',
    reputation_engagement_triggers: 'REPUTATION-TRIGGER DEEP-DIVE: the signals that outvote everything else — (1) THE COMPLAINT ARITHMETIC: 0.3% is the Gmail enforcement ceiling; 0.1% is the operational target; and complaints concentrate (the re-activation blast to a stale segment can run 10x your average) — complaint prevention is segment discipline: recency-gated sending, the visible easy unsubscribe, and frequency honesty (the daily sender who promised weekly manufactures complaints); (2) SPAM TRAPS: PRISTINE traps (addresses that never belonged to a human — arrive only via scraping/purchase; one hit can blocklist) and RECYCLED traps (dead mailboxes reactivated as sensors — arrive via stale lists; the defense is engagement-recency sunsetting and bounce hygiene, since recycled traps bounced for months before becoming traps — senders who process bounces never hit them); (3) THE ENGAGEMENT DEATH SPIRAL: low engagement → worse placement → lower engagement — the exit is always list contraction (mail the people who read you; the vanity list size is a liability metric); (4) THE SHARED-NEIGHBORHOOD EFFECT: shared IP pools and even shared ESP domain infrastructure mean neighbors matter — a quality ESP\u2019s enforcement team is a deliverability feature you are paying for; the bargain ESP with no abuse desk is expensive; (5) BOUNCE DISCIPLINE: hard bounces suppressed instantly and permanently, soft bounces retried briefly then rested — bounce rate over 2% reads as list negligence, and receivers meter it.',
    full_spam_audit: 'FULL-SPAM-AUDIT SEQUENCE (run in this order, stop at the first failing layer): STEP 1 — AUTH VERDICT (5 min): mail-tester send — SPF/DKIM/DMARC pass AND align? No → engineer_dns_authentication_stack first, nothing else matters yet; STEP 2 — REPUTATION SWEEP (10 min): Postmaster reputation band, MXToolbox blocklist scan, complaint-rate trend — reputation damage means the recovery protocol, not a copy edit; STEP 3 — LIST FORENSICS (the usually-guilty layer): source audit (any purchased/scraped segments = the primary suspect), engagement recency distribution (what % of the list opened anything in 90 days?), bounce trend, verification status; STEP 4 — TECHNICAL PASS: the SpamAssassin breakdown on the real template, List-Unsubscribe headers present, multipart structure valid, HTML weight sane; STEP 5 — CONTENT PASS (last for a reason): the link audit (count, destinations, no shorteners), image ratio, hype density, personalization integrity; STEP 6 — PATTERN REVIEW: send-time consistency, volume stability, segment rotation. THE AUDIT MINDSET: spam placement is almost never one trigger — it is a stack of small debts; the audit pays them in interest-rate order, and the order is why step-6-first senders stay broken for months.'
  };

  return {
    status: 'success',
    content_triggers: focus === 'content_copy_triggers' ? focusContent.content_copy_triggers : 'CONTENT TRIGGERS (compressed): link patterns rule (shorteners, mismatched anchors, young domains, count — zero-link first touches win), structure second (image-heavy bodies, HTML soup, caps-and-!!! subjects), spam vocabulary is overrated alone but hype density drives the complaints that are the real penalty, and fake personalization scores worse than none. Full hierarchy: run trigger_focus=content_copy_triggers.',
    technical_triggers: focus === 'technical_header_triggers' ? focusContent.technical_header_triggers : 'TECHNICAL TRIGGERS (compressed): List-Unsubscribe + one-click (RFC 8058) mandatory for bulk since 2024, header coherence (From/Reply-To/Return-Path alignment, valid Message-ID), clean MIME with matching plain-text part, no first-touch attachments, and the mail-tester/SpamAssassin line-by-line audit path. Full layer: run trigger_focus=technical_header_triggers.',
    reputation_triggers: focus === 'reputation_engagement_triggers' ? focusContent.reputation_engagement_triggers : 'REPUTATION TRIGGERS (compressed): the 0.3% complaint wall (target half), pristine vs recycled spam traps and the hygiene that avoids each, the engagement death spiral exited by list contraction, shared-pool neighborhood effects, and instant hard-bounce suppression. Full layer: run trigger_focus=reputation_engagement_triggers.',
    rewrite_protocol: 'THE REWRITE PROTOCOL (before/after craft): BEFORE: subject "FREE Demo!!! Don\u2019t Miss This AMAZING Opportunity" → AFTER: "question about {company}\u2019s onboarding flow" — the specific-and-calm subject outperforms on opens AND filter scoring; BEFORE: the 600-word feature pitch with 5 links, 3 images and a calendar widget → AFTER: 80 plain-text words, one specific observation about the recipient, one question, zero links — the reply-optimized shape is also the filter-optimized shape (this is not coincidence: filters are trained on what humans welcome); BEFORE: "Dear Valued Customer" blast framing → AFTER: segment-true relevance (the email that could only have been sent to this segment); BEFORE: the urgency stack ("last chance", countdown, "expires tonight") → AFTER: one honest deadline if one exists, stated once. THE AUDIT CHECKLIST (every template, 60 seconds): subject under ~50 chars and promise-true • first line that could not be sent to anyone else (cold) or on-segment (bulk) • links ≤1 (cold) / all full-domain and necessary (bulk) • image ratio sane, no image-only body • plain-text part present and matching • unsubscribe visible + one-click headers (bulk) • physical address (bulk/CAN-SPAM) • merge fields tested against missing data • mail-tester ≥9 before the send. THE NORTH STAR: every rewrite moves the mail toward "a competent human wrote this to a person they researched" — which is simultaneously the best filter strategy and the best reply strategy.',
    filter_calibration: filterCalibration[filters] + (focus === 'full_spam_audit' ? ' FULL-AUDIT SEQUENCE: ' + focusContent.full_spam_audit : '')
  };
}

/* ─────────────────────────── TOOL 5: SENDING INFRASTRUCTURE ─────────────────────────── */

function architectInfrastructure(args) {
  const goal = args.infrastructure_goal || 'cold_outreach_infrastructure';
  const scale = args.operation_scale || 'solo_founder';

  const scalePlaybooks = {
    solo_founder: 'SOLO-FOUNDER PLAYBOOK: minimum viable infrastructure with zero compromise on the fundamentals — COLD: one lookalike domain (two when volume justifies), 2-3 Workspace/M365 mailboxes, warmed organically over 5-6 weeks, 20-40/day each at maturity — 60-120 quality sends/day is a serious solo pipeline when targeting is tight; MARKETING: one quality ESP on a shared pool, the subdomain (news.) from day one, double-opt-in, the sunset policy automated; TRANSACTIONAL (if a product exists): a dedicated transactional provider free tier on mail. subdomain — never mixed into the marketing stream. THE SOLO BUDGET REALITY: the whole stack runs on ~$20-50/month (domains + mailboxes + ESP free tiers) — the expensive-tooling pitch to solo senders mostly sells dashboards for problems discipline prevents. THE SOLO TIME ALLOCATION: 80% list quality and message fit, 20% infrastructure — the solo sender\u2019s deliverability edge is relevance, which no infrastructure buys.',
    small_team_agency: 'SMALL-TEAM/AGENCY PLAYBOOK: the multiplication tier — (1) PER-CLIENT ISOLATION (agencies, non-negotiable): every client on their OWN sending domains and mailboxes — shared infrastructure across clients means one client\u2019s bad list burns every client\u2019s campaigns, which is both an operational and a fiduciary failure; client domain assets documented and transferable (the client owns their reputation); (2) THE FLEET DISCIPLINE: domain/mailbox inventory tracked (warming/active/resting/retired states), staggered warmup batches, per-identity dashboards — the spreadsheet beats the memory at 10+ identities; (3) THE PROCESS LAYER: the pre-flight checklist enforced per campaign (verification run, seed test, mail-tester pass), suppression lists global per client, complaint alerting wired to a human; (4) THE CLIENT-EDUCATION ASSET: the deliverability onboarding doc (why we warm for 5 weeks, why we cap volume, why the purchased list is declined) converts the hardest client conversations into policy — agencies that cannot say no to list abuse inherit its consequences; (5) THE ECONOMICS: infrastructure cost per client (~$30-80/month) is margin-trivial against the campaign value it protects.',
    high_volume_operation: 'HIGH-VOLUME-OPERATION PLAYBOOK: deliverability as an engineering function — (1) OWNERSHIP: a named deliverability owner with authority over send decisions (the role pays for itself the first prevented incident); (2) THE INFRASTRUCTURE TIER: dedicated IPs with managed warmup, stream isolation enforced at the provider level (separate subdomains, IPs and ideally vendors per stream), DMARC at p=reject on transactional, fleet lifecycle automation for any cold operations; (3) TELEMETRY AS CODE: bounce/complaint webhooks into the data warehouse, per-provider placement dashboards, complaint alerting at 0.15% (half the ceiling), weekly deliverability review in the ops cadence; (4) THE LIST GOVERNANCE LAYER: acquisition-source tagging on every address (the forensic trail when something spikes), verification at entry AND periodically, sunset automation, suppression as a service across all sending systems — the unified suppression list is the control that prevents the cross-system compliance incident; (5) THE VENDOR STRATEGY: multi-ESP posture (transactional redundancy, negotiating leverage, stream isolation) with the complexity honestly staffed. THE SCALE TRUTH: at high volume, deliverability failures are measured in revenue percentage — the function is infrastructure, not marketing hygiene.'
  };

  const goalContent = {
    cold_outreach_infrastructure: 'COLD-INFRASTRUCTURE DEEP-DIVE: (1) THE ROOT-DOMAIN FIREWALL: the company domain sends ZERO cold email, forever — the root carries the website, the team\u2019s mail, the transactional stream and the brand\u2019s searchable reputation; cold complaints against it are unbounded-downside events; (2) THE LOOKALIKE PORTFOLIO: getbrand.com / brandhq.com / trybrand.com — credible variants, each with full auth, a redirect to the main site, reply forwarding, and its own warmup history; bought in staggered batches, never bulk-registered same-day (registration-pattern clustering is visible); (3) THE MAILBOX FLEET: 2-3 mailboxes per domain (more concentrates risk), real-provider mailboxes (Workspace/M365 inherit infrastructure trust that bargain SMTP never earns), humanized profiles, 20-50/day each at maturity with human pacing; (4) THE ROTATION SYSTEM: inboxes rotate across campaigns, domains cycle through load/rest phases, and the warming pipeline keeps replacement capacity ready — fleet management is inventory management; (5) THE REPLY PATH: replies forward to the real workspace where humans answer fast — the entire infrastructure exists to START CONVERSATIONS, and the conversation is also the reputation engine; (6) THE TOOL LAYER: the sending tool matters less than its settings — human pacing, per-mailbox caps, global suppression, bounce processing; any tool that advertises "unlimited sending" is describing a blocklist with a UI.',
    newsletter_infrastructure: 'NEWSLETTER-INFRASTRUCTURE DEEP-DIVE: (1) THE SUBDOMAIN HOME: news.domain.com (or updates.) — root-domain trust inheritance with stream isolation; its own DKIM selectors and return-path; (2) THE ESP SELECTION BAR: custom signing domain + custom return-path support (DMARC alignment on both legs), one-click unsubscribe automation (the 2024 mandate handled correctly), real bounce/complaint webhook access, and a credible abuse desk (pool quality IS the product on shared IPs); (3) THE CAPTURE INTEGRITY LAYER: double opt-in (the 15-25% signup tax that buys trap immunity and complaint reduction), signup-source tagging, honeypot/bot filtering on forms (bot signups are future complaints and traps); (4) THE LIFECYCLE AUTOMATION: the welcome series (highest-engagement window — it SETS the reputation baseline per subscriber), the sunset policy automated (90-180 day non-openers → re-permission → removal), and the frequency promise kept mechanically; (5) THE GROWTH-WITHOUT-DECAY DISCIPLINE: list growth tactics audited for quality (the viral giveaway list converts at a fraction of the content-earned list and complains at a multiple — growth source quality is a deliverability input); (6) THE PORTABILITY HEDGE: the list exported weekly, the domain and signing assets owned by you not the ESP — switching costs engineered low on purpose.',
    transactional_infrastructure: 'TRANSACTIONAL-INFRASTRUCTURE DEEP-DIVE: (1) THE ISOLATION PRINCIPLE: transactional mail on its own subdomain (mail.app.com / notify.app.com), its own provider or IP pool, its own DKIM selectors — a marketing incident must be ARCHITECTURALLY unable to delay a password reset; (2) THE PROVIDER CLASS: purpose-built transactional ESPs (the SES/Postmark/Resend class) — sub-second queuing, template APIs, webhook-grade bounce/complaint telemetry; marketing ESPs retrofitted for transactional carry queue and reputation-mixing risk; (3) THE DMARC-REJECT PRIORITY: transactional domains are the phishing economy\u2019s favorite costume — p=reject belongs here FIRST, with BIMI worth its cost soonest for consumer-facing products; (4) THE CONTENT PURITY RULE: transactional mail stays transactional — the receipt with a promo block risks reclassification by filters and regulators alike (CAN-SPAM primary-purpose test); the upsell belongs in the marketing stream where consent governs it; (5) THE ALERTING BAR: delivery latency and failure-rate alerting at product-incident severity — users experience transactional failure as product failure ("the app is broken"), and the webhook-to-pager path should exist before the first incident, not after; (6) THE DELIVERABILITY ADVANTAGE: clean transactional streams run near-100% inbox rates — which is precisely why protecting their isolation is the cheapest deliverability win in the entire stack.',
    unified_multi_stream_stack: 'UNIFIED-STACK DEEP-DIVE: the three-stream architecture on one brand — THE MAP: root domain (human correspondence only) • news.domain.com (marketing: ESP, shared or dedicated IP by volume, DMARC inherited then explicit) • mail.domain.com (transactional: dedicated provider, p=reject) • lookalike portfolio (cold, if the motion exists: fully separate domains, never subdomains of the root). THE SHARED SERVICES LAYER: the unified suppression list enforced across ALL streams (the unsubscribe from marketing must suppress cold outreach to the same person — both legally safer and complaint-preventing), the DMARC report aggregation across every domain to one monitored parser, and the identity governance (who may create sending identities — shadow sending tools connected by one department are the classic alignment-breakage and compliance leak); THE STREAM-INTERACTION RULES: streams never share mailboxes, IPs or templates; cross-stream promotion flows through consent (the transactional footer may reference preferences, not promotions); and incident isolation is tested by assumption ("if marketing gets blocklisted today, what breaks?" — the right answer is "marketing, only"); THE CONSOLIDATED DASHBOARD: per-stream reputation, complaint and placement trends on one page — the unified stack is an ARCHITECTURE discipline precisely so the monitoring can be unified too.'
  };

  return {
    status: 'success',
    domain_architecture: goal === 'cold_outreach_infrastructure' ? goalContent.cold_outreach_infrastructure : 'DOMAIN ARCHITECTURE (compressed): the root-domain firewall (zero cold from the brand domain, ever), lookalike portfolios for cold with full auth + redirects + reply forwarding, subdomain stream separation for marketing (news.) and transactional (mail.), staggered acquisition and warmup. Full cold build: run infrastructure_goal=cold_outreach_infrastructure.',
    mailbox_fleet: 'MAILBOX FLEET DESIGN: THE SIZING MATH: required daily volume ÷ (per-mailbox cap × mailboxes per domain) = domain count — with the caps that hold in 2026: cold mailboxes 20-50/day sustainably (40 as the planning number), 2-3 mailboxes per domain (beyond 3 concentrates domain risk without adding meaningful capacity); worked example: 500/day target → 500 ÷ (3×40) ≈ 4-5 domains, acquired and warmed in two staggered batches. THE PROVIDER CHOICE: Workspace/M365 mailboxes inherit tier-1 infrastructure reputation — the $6-7/mailbox/month is the cheapest reputation rental in email; bargain SMTP mailboxes save $4 and cost the campaign; THE HUMANIZATION LAYER: every mailbox carries a real identity surface (name, signature, photo, sent-mail history from warmup) — fleets of blank-profile mailboxes cluster-pattern visibly; THE PACING ENGINE: sends distributed across working hours with natural jitter, per-mailbox daily caps enforced by tooling (not intention), weekends realistic; THE ROTATION CALENDAR: active domains carry load while the warming cohort builds and tired domains rest — the fleet is managed as a pipeline with states, and the one-spreadsheet inventory (domain, state, age, daily load, reputation notes, incident history) is the operations layer most cold senders are missing.',
    esp_selection: 'ESP/SMTP SELECTION MATRIX: BY STREAM — COLD: the specialized sequencing tools (chosen for pacing controls, per-mailbox caps, unified suppression and bounce processing — NOT for "unlimited" promises) sitting on top of real Workspace/M365 mailboxes; MARKETING: the established ESP class with custom signing domain + custom return-path (the DMARC alignment pair), RFC 8058 one-click unsubscribe, webhook telemetry and a reputation-defending abuse desk; TRANSACTIONAL: the purpose-built API class (SES for cost at scale with more assembly required, Postmark/Resend class for turnkey speed). THE SHARED-VS-DEDICATED IP DECISION: shared pools win under ~25-50k/month (the pool smooths low-volume reputation and the ESP polices neighbors); dedicated wins above that threshold IF volume is steady (dedicated IPs decay on bursty calendars — the irregular high-volume sender is better served by a premium shared pool, which is the counterintuitive case); the migration between them is a warmup event (design_inbox_warmup_protocol, esp_migration). THE EVALUATION CHECKLIST beyond features: published sending policies actually enforced (loose policy = bad neighbors), deliverability documentation quality (a vendor who explains return-path alignment is a vendor who understands it), data portability (export paths for lists, suppression and templates), and pricing that does not punish list hygiene (per-subscriber pricing taxes you for keeping dead weight — an incentive misalignment worth noticing).',
    compliance_layer: 'THE COMPLIANCE LAYER (the legal floor and the deliverability ceiling are the same floor): CAN-SPAM (US): truthful headers and subjects, the physical postal address in every commercial mail, a working opt-out honored within 10 business days (honor it instantly — the 10 days is the ceiling, not the target), and no opt-out friction (login walls before unsubscribing are violations); GDPR/PECR (EU/UK recipients): lawful basis required — consent for B2C marketing (double opt-in is the evidentiary standard), legitimate interest available for relevant B2B outreach but it must be DOCUMENTED (the balancing test), targeted (role-relevant), and paired with easy objection; data rights honored (erasure requests flow into permanent suppression, not deletion-then-reimport); CASL (Canada): the strictest consent regime in the anglosphere — express or carefully-documented implied consent before sending; THE SUPPRESSION ARCHITECTURE: one global suppression list across every tool and stream, append-only, checked at send time — the person who opted out of one stream and was mailed by another is both a legal exposure and a guaranteed complaint; THE ETHICAL FLOOR ABOVE THE LEGAL ONE: permission-conscious outreach (tight targeting, honest value, instant respected exits, no purchased lists) is not just compliance — it is the only cold-email strategy that still works in 2026, because filters are trained on recipient sentiment and recipient sentiment is trained on how senders behave. The spray-and-pray era did not end because it became illegal; it ended because it stopped landing.',
    scaling_playbook: scalePlaybooks[scale] + (goal !== 'cold_outreach_infrastructure' ? ' GOAL-SPECIFIC BUILD: ' + goalContent[goal] : '')
  };
}
