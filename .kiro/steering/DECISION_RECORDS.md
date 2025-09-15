# Decision Records

This directory contains Architecture Decision Records (ADRs) for the MailSense project. These records document important architectural decisions made by the team.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Template

```markdown
# [ADR-XXX]: Short title of the decision

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXX](<link>)

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

## Alternatives Considered

- Option 1
- Option 2
- Option N

## References

- [Reference 1](https://example.com)
- [Reference 2](https://example.com)
```

## List of ADRs

### Active Decisions

- [ADR-001: Use Next.js for Frontend](decisions/001-use-nextjs.md)
- [ADR-002: Implement JWT Authentication](decisions/002-jwt-authentication.md)
- [ADR-003: Use Firestore as Primary Database](decisions/003-use-firestore.md)

### Superseded Decisions

- [ADR-000: Initial Architecture (Superseded by ADR-001)](decisions/000-initial-architecture.md)

## How to Propose a New ADR

1. Create a new markdown file in the `decisions` directory using the template above
2. Name the file `NNN-short-description.md` where NNN is the next sequential number
3. Submit a pull request for review
4. Once approved, merge the ADR into the main branch

## Review Process

ADRs should be reviewed by at least two senior team members before being accepted. Once accepted, they should be considered binding unless superseded by a new ADR.
