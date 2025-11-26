# קהילת נתניה - Custom Subagents

This directory contains specialized AI subagents for the קהילת נתניה project. These agents are automatically available in Claude Code and will be invoked when relevant tasks are detected.

## Available Subagents

### 1. 🌍 i18n-specialist (Sonnet)
**Purpose**: Hebrew/Russian bilingual translation management

**Use cases**:
- Finding missing translation keys
- Checking RTL/LTR compliance
- Detecting hardcoded Hebrew/Russian text
- Verifying translation quality

**Example invocations**:
```
> Use the i18n-specialist to check for missing translations
> Have i18n-specialist verify RTL compliance in the new component
> Ask i18n-specialist to audit translation keys
```

**Proactive**: Automatically activates when working with i18n files or bilingual content

---

### 2. 💾 prisma-expert (Sonnet)
**Purpose**: Prisma ORM and PostgreSQL database specialist

**Use cases**:
- Database schema design review
- Query optimization
- Migration safety checks
- Finding N+1 query problems

**Example invocations**:
```
> Use prisma-expert to optimize the search query
> Have prisma-expert review the new migration
> Ask prisma-expert to check for missing indexes
```

**Proactive**: Activates when working with Prisma schema or database queries

---

### 3. 🔐 admin-tester (Haiku)
**Purpose**: Admin panel testing and verification

**Use cases**:
- Testing admin CRUD workflows
- Verifying authentication guards
- Checking business management features
- Security compliance validation

**Example invocations**:
```
> Use admin-tester to verify the new admin feature
> Have admin-tester check category management
> Ask admin-tester to test the approval workflow
```

**Proactive**: Activates when working on admin routes or server actions

---

### 4. 🎯 seo-auditor (Haiku)
**Purpose**: SEO and structured data compliance

**Use cases**:
- Verifying Open Graph tags
- Checking Twitter Cards
- Validating LocalBusiness schema
- Testing hreflang implementation

**Example invocations**:
```
> Use seo-auditor to check business page metadata
> Have seo-auditor verify structured data
> Ask seo-auditor to audit SEO compliance
```

**Proactive**: Activates when working on metadata or SEO-related code

---

### 5 ♿ accessibility-auditor (Haiku)
**Purpose**: WCAG AA accessibility compliance (Israeli law)

**Use cases**:
- WCAG AA compliance testing
- Keyboard navigation verification
- Screen reader compatibility
- Color contrast checks

**Example invocations**:
```
> Use accessibility-auditor to check the new form
> Have accessibility-auditor verify ARIA labels
> Ask accessibility-auditor to audit keyboard navigation
```

**Proactive**: MUST BE USED for accessibility testing (Israeli law requirement)

---

### 6. ✅ netanya-qa (Haiku)
**Purpose**: Comprehensive end-to-end QA testing

**Use cases**:
- Testing user flows
- Regression testing
- Cross-browser compatibility
- Production readiness checks

**Example invocations**:
```
> Use netanya-qa to test the search flow
> Have netanya-qa check for regressions
> Ask netanya-qa to verify the new feature works
```

**Proactive**: Activates for comprehensive testing tasks

---

## How to Use

### Automatic Invocation
Claude Code will automatically use these agents when it detects relevant tasks. For example:
- Working on translations → i18n-specialist activates
- Optimizing database queries → prisma-expert activates
- Testing admin features → admin-tester activates

### Explicit Invocation
You can explicitly request a specific agent:
```
> Use the [agent-name] subagent to [task]
```

### View All Agents
Run the following command to see all available agents:
```
/agents
```

## Tool Access

Each agent has specific tool permissions:

| Agent | Tools | Model |
|-------|-------|-------|
| i18n-specialist | Read, Edit, Grep, Glob, Bash | Sonnet |
| prisma-expert | Read, Edit, Bash, Grep, Glob | Sonnet |
| admin-tester | Read, Bash, Grep, Glob | Haiku |
| seo-auditor | Read, Grep, Glob, Bash | Haiku |
| accessibility-auditor | Read, Grep, Glob, Bash | Haiku |
| netanya-qa | Read, Bash, Grep, Glob | Haiku |

**Note**: Haiku agents are faster and cheaper for testing/auditing tasks. Sonnet agents are used for more complex analysis and code generation.

## Cost Optimization

**When to use each model:**
- **Haiku** (fastest, cheapest): Testing, auditing, verification tasks
- **Sonnet** (balanced): Translation management, database optimization
- **Opus** (most capable): Not used by default (can be configured if needed)

## Project-Specific Context

All agents include קהילת נתניה project context:
- Bilingual (Hebrew RTL + Russian LTR)
- Next.js 14 App Router
- Prisma ORM + PostgreSQL
- Admin authentication (single superadmin)
- Critical business logic (search ordering, phone validation)
- Israeli accessibility compliance requirements

## Best Practices

1. **Let Claude decide**: Allow automatic agent invocation for efficiency
2. **Be specific**: When explicitly invoking, provide clear task descriptions
3. **Chain agents**: You can request multiple agents sequentially
   ```
   > First use i18n-specialist to check translations, then use netanya-qa to test the flows
   ```
4. **Review output**: Agents provide file paths and line numbers for easy fixes

## Modifying Agents

To customize an agent:
1. Run `/agents` command
2. Select the agent to edit
3. Modify the system prompt or tool permissions
4. Save changes

Or edit the Markdown files directly in `.claude/agents/`

## Version Control

These agents are checked into version control so your team benefits from them. Any improvements you make will be shared with collaborators.

## Related Documentation

- [Anthropic Subagents Docs](../docs/3rdParty/antropic.md)
- [DevPlan Verification Report](../docs/DEVPLAN-VERIFICATION-REPORT.md)
- [V2.0 Deployment Report](../docs/V2.0-DEPLOYMENT-REPORT.md)

---

**Created**: November 15, 2025
**Project**: קהילת נתניה Business Directory
**Total Agents**: 6 specialized subagents
