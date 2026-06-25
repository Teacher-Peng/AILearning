# Decision Log

This file records important product and engineering decisions for the Spelling Bee app.

## Working Agreement

- Ask before making decisions that affect architecture, data shape, UX behavior, naming, or long-term maintainability.
- Make small, reversible implementation choices directly when they are necessary to complete an already-approved decision.
- Record important decisions here with date, context, decision, and rationale.

## Decisions

### 2026-06-25 - Keep a Project Decision Log

Context: The project is growing from a single HTML file into a maintainable spelling practice system with PDF-backed levels.

Decision: Use this Markdown file as the shared decision log.

Rationale: A short, durable log helps preserve why the app is structured a certain way and prevents repeated re-decisions as the project evolves.

### 2026-06-25 - Ask Before Major Decisions

Context: The user requested explicit questions before decisions are made.

Decision: Before changing architecture, data modeling, UX behavior, or maintainability strategy, pause and ask concise questions. Continue only after the user answers, unless the change is small, reversible, and clearly implied by the request.

Rationale: The app is becoming a learning tool with product choices that matter to the user, so alignment should happen before implementation.

### 2026-06-25 - Mobile-First Single Panel

Context: The expected users are likely using phones rather than desktop screens.

Decision: Keep the app to one primary panel at a time. The entry screen asks users to choose Testing or Practice before choosing level/settings. Avoid desktop sidebars and multi-panel layouts.

Rationale: A single-panel flow is easier to use on phones, keeps focus on the current task, and avoids dense desktop-style controls.

### 2026-06-25 - Traditional Chinese UI

Context: The app is intended for Traditional Chinese users.

Decision: Use Traditional Chinese for user-facing app UI text. The `Listen` action label can remain English, and English spelling words/source vocabulary data remain unchanged.

Rationale: The surrounding controls and instructions should match the users' reading language while preserving the English learning content.

### 2026-06-25 - Premature Exit

Context: Users may accidentally start a large test such as all levels and should not be forced to finish before leaving.

Decision: Provide visible exit actions in long-running app areas, especially during testing. Exiting a test early concludes the test, shows the result screen, and scores only the questions already answered. If no questions were answered, no score is saved.

Rationale: Users need control at every stage, and ending early should still feel like a complete session without forcing unattempted questions into the score.
