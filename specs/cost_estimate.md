# Cost Estimate (Azure) — Deployment and Operations

This document provides ballpark monthly costs to run the app on Azure following our recommendations. Numbers are indicative only and will vary by region, discounts (EA, CSP), and usage. Use Azure’s pricing calculator for final projections.

Last updated: 2025-08 (assumptions noted below)


## Architecture Costed
- Backend API: Azure App Service (Linux)
- Frontend: Azure Static Web Apps (SWA)
- Database: Azure Database for PostgreSQL Flexible Server
- Secrets: Azure Key Vault
- Monitoring: Application Insights (+ Log Analytics)
- Optional: Azure Storage (artifacts), Azure Front Door (global edge), DNS (Azure DNS)


## Cost Summary (typical small setup)
- __Dev__: ~ $60–$120 / month
- __Staging__: ~ $100–$200 / month
- __Prod (small)__: ~ $180–$350 / month

These ranges assume modest usage (tens of users, light API traffic, < 5GB DB). Scale up or down as needed.


## Line Items — Ballpark per Environment

### 1) Backend API — Azure App Service (Linux)
- Plan: B1 (Basic) or P1v3 (Production)
  - B1: ~$13–$20 / mo (single instance; no SLA)
  - P1v3: ~$140–$180 / mo (better performance/SLA; deployment slots)
- Notes: You can start with B1 or S1 (Standard). Consider P1v3 for prod when traffic grows. Auto-scale adds cost per instance.

### 2) Frontend — Azure Static Web Apps
- SWA Standard: ~$9–$20 / mo
- Includes: Global CDN, SSL, custom domains, CI integration
- Notes: For very low traffic, SWA Free may suffice (limited features). If using Storage Static Website + CDN, costs can be similar at low traffic but involve more setup.

### 3) Database — Azure Database for PostgreSQL Flexible Server
- Burstable B1ms (~1 vCore): ~$50–$80 / mo
- Storage: 20–50 GB: ~$2–$7 / mo (plus backup storage)
- IO and backup storage can add small incremental costs. Start small and monitor.

### 4) Secrets — Azure Key Vault
- Operations: ~$0–$3 / mo for light usage
- Secret versions incur tiny storage costs. Soft-delete enabled by default.

### 5) Monitoring — Application Insights (+ Log Analytics)
- Application Insights: ~$5–$30 / mo for small apps (depends on ingestion)
- Log Analytics: Pay-as-you-go (~$2–$10 / mo at low volume)
- Tuning sampling and retention controls cost.

### 6) Optional — Azure Storage, Azure Front Door, Azure DNS
- Azure Storage (artifacts/backups): ~$1–$5 / mo (low usage)
- Azure Front Door (global edge/WAF): ~$35–$90+ / mo (depends on rules/traffic)
- Azure DNS: ~$0.5–$1 per zone / mo (+ negligible per-DNS query cost)


## Example Bundles

### Dev (single small instance, minimal monitoring)
- App Service B1: $15
- SWA Standard: $10
- Postgres B1ms + 20GB: $55
- Key Vault: $1
- App Insights + Logs (low): $7
- Total: ~$88 / month

### Staging (like prod, smaller scale)
- App Service S1: $75
- SWA Standard: $10
- Postgres B1ms + 50GB: $60
- Key Vault: $1
- App Insights + Logs (moderate): $12
- Total: ~$158 / month

### Prod (small; higher reliability)
- App Service P1v3 (1 instance): $160
- SWA Standard: $10
- Postgres B1ms + 50GB: $60
- Key Vault: $2
- App Insights + Logs: $20
- Azure DNS (1 zone): $1
- Total: ~$253 / month

Add-ons:
- Second App Service instance for scale-out: +$160 / instance
- Azure Front Door/WAF: +$35–$90+ / month


## Assumptions
- Region: EU or similar pricing tier
- 1–2 small instances for API depending on environment
- Low to moderate API traffic, small DB (< 5GB to start)
- CI/CD costs are negligible (GitHub Actions included in GitHub plan; bandwidth minimal)
- Egress bandwidth is low (mostly API/JSON, not large file downloads)


## Cost Control Tips
- Start small (B1/S1 tiers), monitor, then scale
- Use deployment slots only in prod (or when needed)
- Tune Application Insights sampling and retention (e.g., 30 days)
- Keep DB storage small; prune old data or move to archive storage
- Use reserved instances or savings plans if steady traffic justifies it
- Use separate resource groups for dev/staging/prod to track and cap costs


## How to Scale
- API: scale up (S1→P1v3) or out (more instances) when CPU/latency rises
- DB: increase vCores or move from burstable to general purpose tier as needed
- Frontend: SWA handles global distribution automatically; add Front Door if you need enterprise edge/WAF


## Ownership & Updates
- This document: `specs/cost_estimate.md`
- Keep updated when changing:
  - Tiers/instances, regions, database size, or monitoring settings
- Cross-reference with `specs/publishing_spec.md` for architecture and operational procedures
