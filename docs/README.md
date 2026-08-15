# Engineering Documentation

Read only what the work needs. Git history, issues, pull requests, test output, and CI carry
temporary work; this directory holds knowledge that should remain useful after the work closes.

## Start here

1. [Engineering workflow](engineering-workflow.md) — how the owner and AI agents move from a
   problem to a reviewed change.
2. [Domain](domain.md) — users, product boundaries, data meanings, and current capabilities.
3. [Architecture](architecture.md) — components, data flow, security boundaries, and invariants.
4. [Deployment](deployment.md) and [runbook](runbook.md) — local/release expectations and the
   limits on production claims.

Related durable references:

- [Product direction](../PRODUCT.md) and [design system](../DESIGN.md)
- [Research scope](research/device-comparison-scope.md)
- [CI checks](testing/ci-checks.md) and [pipeline smoke tests](testing/pipeline-smoke-tests.md)
- [University server/network handoff](operations/university-server-network-handoff.md)

## Documentation rules

- Keep a document when it defines a stable system fact, invariant, contract, operating procedure,
  or decision that future work needs.
- Keep change-specific reasoning in the conversation, issue, PR, commit, and test evidence unless
  it changes one of those stable facts.
- Do not create task handoffs, audit ledgers, or roadmap state for routine work.
- Historical workflow records are preserved in [archive/old-ai-workflow](archive/old-ai-workflow/).
  They are provenance, not active instructions or a list of work to resume.
