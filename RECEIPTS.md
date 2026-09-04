# Silicon Exchange — the receipts

This repository is the application **exactly as the CodeLead pipeline produced it** on
2026-09-02: one commit per verified increment, in order, plus one governed repair pass.
The build story, numbers, and reproducibility pack live in the companion repository:
**https://github.com/CodeLead-ai/silicon-exchange-case-study**.

To audit: `npm install && npm test && npm run build` (53/53 tests, build green), then walk
`git log` — each commit message names its increment; `.codeleadsessions/` carries the
per-increment evidence ledger (`increment-ledger.json`) and run summaries.

**What is withheld:** model prompt/response transcripts (`model/*` and `session.jsonl`)
are excluded from this public history — the underlying methods are the subject of pending
patent applications. Every code commit, the evidence ledger, and the run summaries are
intact. No human wrote or edited any application code in this history.
