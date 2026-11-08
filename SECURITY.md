# Security Policy

## Reporting Security Vulnerabilities

We take the security of student records, financial ledgers, and identity data seriously. If you discover a security vulnerability within SchoolOS, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please send an encrypted or direct email to security@schoolos.internal or reach out to the core maintainers privately.

Please include:
1. A description of the vulnerability and its potential impact.
2. Step-by-step instructions or proof-of-concept scripts to reproduce the issue.
3. The affected component (`pkg/db`, `services/api`, `services/telemetry`, `apps/desktop`, `apps/web`).

We will acknowledge receipt within 48 hours and work with you on a timeline for verification and public patch disclosure.

---

## Security Architecture & Invariants

SchoolOS employs defense-in-depth across the following layers:

1. **Kernel-Enforced Tenant Isolation:**
   - Multi-tenancy is enforced at the PostgreSQL kernel level using Row-Level Security (RLS).
   - Application connections authenticate as an unprivileged user (`schoolos_app`) with strict row filters keyed on `app.current_tenant_id`.
   - Direct cross-tenant data exfiltration is prevented even in the event of SQL injection vulnerabilities in unparameterized query branches.

2. **Zero-Float Financial Precision:**
   - All monetary calculations are performed with fixed-point decimal arithmetic.
   - Ledgers are append-only. Mutation of historical transaction rows is forbidden at the database schema level.

3. **Offline Desktop Protection:**
   - Local counter cash records stored in SQLite use WAL mode with immediate synchronization.
   - Receipt records are cryptographically hashed and deduplicated using primary key idempotency tokens during central sync.

4. **IoT Binary Stream Shielding:**
   - The GT06 telemetry daemon enforces fixed-size ring buffer limits to prevent memory exhaustion and buffer overflow attacks from untrusted external TCP sockets.
