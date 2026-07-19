# 志望動機 (Reason for Application) — template

Per-company file. Generate one per Japanese application as
`output/shibou-douki-{company-slug}-{YYYY-MM-DD}.md`. Never paste into `cv-japan.html` — that
file's style and structure are locked and it stays company-neutral so it can be reused.

## Where it goes

| Section | Purpose | Scope | Lives in |
|---------|---------|-------|----------|
| 職務要約 | Career summary, facts | Generic | top of 職務経歴書 (`cv-japan.html`) |
| 自己PR | Strengths, "what I'm good at" | Generic | end of 職務経歴書 (`cv-japan.html`) |
| 志望動機 | "Why your company", fit | **Per company** | 履歴書, cover letter, or application form |

Do not merge 自己PR and 志望動機. A Japanese reader expects them separate and in that order.

## Register

Formal and humble, not persuasive or enthusiastic. Sincere interest in **the company** outranks
personal career ambition. Avoid hard-sell verbs, superlatives, and "I want to grow / I'm looking
for" framing as the lead. Ambition comes last or not at all.

Written in English (see `cv-japan-style-locked` memory — Japanese-format, English body, because
she has no Japanese ability). No em-dashes, no AI-flavored phrasing.

## Structure (3 short paragraphs, ~150-250 words total)

1. **Them first.** What the company builds and the specific thing about it you find compelling.
   Name a real product, market position, or engineering problem. Requires actual research, so run
   the company scan first (X/LinkedIn/news, per `prep-scan-company-socials` memory). Generic praise
   any company could receive is the main failure mode.
2. **Fit second.** The concrete overlap between their needs and her real experience: payments and
   crypto-to-fiat on/off-ramp, KYC and compliance integrations, the Go indexer relay (contributed
   to and operates it — never "built from scratch"), NestJS/Next.js full-stack ownership, the
   ConnectX natural-language people search. Tie each to what they are trying to do, not to what
   she wants.
3. **Contribution last.** What she would contribute to their team, phrased as service to the team
   and long-term commitment rather than personal advancement. One sentence on ambition maximum.

## When this is used

Remove the closing sentence from the 自己PR in `cv-japan.html` ("I am now looking for a team in
Japan where I can make a long-term contribution...") only if a real 志望動機 accompanies that
application. If the 職務経歴書 travels alone, leave the sentence in so the doc still signals Japan
intent.

## Facts to draw on

Source of truth is `cv.md`. Team sizes, product names, and legal entity names are in `cv-japan.html`.
Interview stories are in `interview-prep/story-bank.md`. Do not invent metrics or claim technologies
she has not used.
