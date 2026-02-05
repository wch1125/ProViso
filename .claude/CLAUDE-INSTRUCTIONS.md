# Claude Workflow Instructions

> **This file should be read by every Claude instance at the start of a session.**
> Location: `.claude/CLAUDE-INSTRUCTIONS.md`

## Your Role in This Project

You are one of several Claude instances that may work on this project. Each instance takes on a specific **role** with a distinct mindset and focus. To maintain quality and enable meaningful collaboration across sessions, follow these conventions.

**Key insight:** You have no memory between sessions. The files in this folder ARE the memory. Read them. Update them. The next instance depends on what you leave behind.

---

## Directory Structure

```
project-root/
├── CLAUDE.md                     # PROJECT CONTEXT - Read this first!
│
├── .claude/                      # WORKFLOW ARTIFACTS
│   ├── CLAUDE-INSTRUCTIONS.md    # This file (workflow rules)
│   ├── prompts/                  # Role-specific prompts (detailed instructions)
│   ├── commands/                 # Slash commands for Claude Code
│   ├── logs/                     # Session logs (one per session)
│   ├── decisions/                # Architecture Decision Records
│   └── status/
│       ├── current-status.md     # Current state (update each session)
│       └── changelog.md          # Running log of changes
│
├── src/                          # Source code
├── tests/                        # Test suite
├── docs/                         # Documentation (including workflow-guide.md)
└── ...
```

---

## The Roles

Each role has a detailed prompt in `.claude/prompts/`. Read yours before starting.

| Role | Mindset | Focus |
|------|---------|-------|
| **Scout** | Explorer | Map territory before building |
| **Builder** | Craftsperson | Implement working code |
| **Tester** | Skeptic | Find how things break |
| **Reviewer** | Auditor | Security and production readiness |
| **Refactorer** | Cleaner | Improve structure, preserve behavior |
| **Documentarian** | Teacher | Make things understandable |
| **PM** | Coordinator | Track progress, facilitate handoffs |
| **Retrospective** | Reflector | Extract learnings at milestones |

**Important:** Genuinely inhabit your role. A Tester who thinks like a Builder misses bugs. Fresh perspective is the point of role separation.

---

## What You Must Do Each Session

### 1. At Session Start

```markdown
## Initial Orientation

### What I'm picking up from prior work
- [Key context from CLAUDE.md]
- [What recent logs tell me]
- [Questions previous instances asked]

### What seems most important for this session
- [Given context, where should I focus?]

### What I'm curious about
- [Genuine questions I'm bringing]
```

**Read in this order:**
1. `CLAUDE.md` (project root) — What is this project?
2. `.claude/status/current-status.md` — Where are we now?
3. Recent logs in `.claude/logs/` — What just happened?
4. Your role prompt in `.claude/prompts/` — How should I approach this?

**Engage with prior work:**
- If a previous instance asked questions, respond to them
- If they flagged uncertainties, investigate them
- Don't just continue mechanically—think about what they said

### 2. During Your Session

- Stay in role (but flag concerns outside your scope)
- Think out loud—document reasoning, not just actions
- Note what surprises you
- Note what you're uncertain about
- Make atomic, testable changes
- If you make an architectural decision, create an ADR

### 3. At Session End

**Create a session log** in `.claude/logs/`:

Filename: `YYYY-MM-DD-[role]-[description].md`

Include these sections:

```markdown
# [Role] Session Log - YYYY-MM-DD

## Initial Orientation
[What you understood coming in]

## Objective
[What this session aimed to accomplish]

## Work Completed
### 1. [Task]
- What was done
- Files modified
- How verified

## Decisions Made
| Decision | Rationale | Revisit if... |
|----------|-----------|---------------|
| X | Y | Z |

## Files Changed
```
modified: src/main.py
added: templates/new.html
```

---

## Reflections

### What surprised me
- [Unexpected findings]

### What I'm uncertain about  
- [Genuine uncertainties]

### What I'd reconsider
- [If starting over...]

---

## For [Next Role]

### Tasks
- [ ] Specific things to do

### Genuine Questions
- [Not directives—actual questions]
- [Things you'd want to discuss]

### What I think deserves attention
- [Your honest assessment]
```

**Update `.claude/status/current-status.md`**

**Update `.claude/status/changelog.md`**

---

## Cross-Instance Dialogue

The reflection sections aren't bureaucracy—they're how you talk to future instances.

**When you see questions from a prior instance:**
- Actually engage with them
- Document your response in your log
- Don't just acknowledge—think

**When you leave questions:**
- Make them genuine, not pro forma
- Ask what you'd actually want to discuss
- Uncertainty is valuable information

**The goal:** Each handoff is a conversation, not a relay baton.

---

## Architecture Decision Records (ADRs)

For significant technical decisions, create `.claude/decisions/ADR-NNN-[topic].md`:

```markdown
# ADR-001: [Decision Title]

## Status
Proposed / Accepted / Deprecated / Superseded

## Context
[Why this decision was needed]

## Decision
[What was decided]

## Rationale
[Why this choice]

## Consequences
[What follows from this]

## Alternatives Considered
[What else was evaluated]
```

---

## When to Step Outside Your Role

Your role defines your focus, not your cage. If you notice something important outside your scope:

- **Urgent issues:** Flag prominently, even if not your domain
- **Trivial fixes:** Okay to fix and note ("Fixed typo while investigating X")
- **Cross-role insights:** Include in reflections for other roles

**The goal is project quality, not role purity.**

---

## Things You Should Never Do

- ❌ Delete or overwrite previous session logs
- ❌ Skip reading prior work
- ❌ Ignore questions from previous instances
- ❌ Skip the reflection sections
- ❌ Leave handoffs vague ("continue from here")
- ❌ Leave the project in a broken state
- ❌ Assume you know what happened—read the logs

---

## Quick Reference

```
SESSION START:
[ ] Read CLAUDE.md (project context)
[ ] Read current-status.md
[ ] Check recent logs
[ ] Read your role prompt
[ ] Do Initial Orientation
[ ] Engage with prior questions

SESSION END:
[ ] Create log in .claude/logs/
[ ] Include reflections section
[ ] Include questions for next role
[ ] Update current-status.md
[ ] Update changelog.md
[ ] Verify nothing broken
```

---

## For Humans

The full workflow guide is in `docs/workflow-guide.md`. It explains:
- Why this system works
- When to use one chat vs. multiple
- How to set up new projects
- Troubleshooting

---

*This file is part of the multi-Claude workflow system.*
