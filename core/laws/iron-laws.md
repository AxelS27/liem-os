# The 5 Iron Laws of Liem OS

These laws are universal, absolute, and non-negotiable across all domains of Liem OS (coding, research, writing, business, ops).

1. **ONE ARTIFACT = ONE RESPONSIBILITY**
   - Every file, document, prompt, or report must state its purpose in 5 words or less.
   - If a purpose contains "and" or "or", the artifact must be split.
   - Prevents file bloat, prompt drift, and spaghetti code.

2. **OUTPUT RENDERS INPUT. IT NEVER CREATES IT.**
   - Everything produced by an agent must reflect a source brief, corpus, requirements, or data.
   - Do not invent data, fabricate quotes, or pull marketing claims (e.g., "120K+ users") out of thin air.
   - Ensures absolute alignment and factual credibility.

3. **DECOUPLED ARCHITECTURE OVER COUPLING (MODULE ISLANDS)**
   - Avoid direct cross-imports or coupling between sibling features or report sections.
   - Inter-module communication must go through shared packages/libraries, common sources, or decoupled message patterns (such as domain events, CQRS, or explicit shared state).
   - Keeps boundaries clear and clean.

4. **VISIBLE PROGRESS WITHIN 500MS. ALWAYS.**
   - Every action must return visible, progressive feedback within 500ms.
   - Never show a blank screen or a silent hang.
   - For heavy tasks like compiling, deep research, or complex AI generation, the system must stream progress, return structure immediately, and fill details progressively.

5. **EVERY INTERACTION HAS A RESPONSE.**
   - Every click, hover, submit, prompt, or delegation must trigger an immediate reaction.
   - If an agent takes a task, it must acknowledge or stream progress within 500ms. Silent systems are broken systems.
