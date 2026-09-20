(CONTINUING THE SAME RECLAIMX SPECIFICATION — PART 3 OF 4)

============================================================
RECLAIMED
============================================================

Final state:

RECLAIMED

"Back where it belongs."

Show the completed recovery journey:

Reported
→
Matched
→
Verified
→
Reclaimed

Resolve the journey into a single completed visual state.

This is the emotional conclusion of the product.

Keep it restrained.

============================================================
MY CLAIMS
============================================================

Tabs:

Lost
Found
Claims

Each item:

Item
Date
Location
Status

Statuses:

Searching
Potential Match
Verification Required
Verified
Handover Pending
Reclaimed

============================================================
HOW IT WORKS
============================================================

Headline:

Recovery is a process, not a search result.

Four stages:

01 REPORT
02 MATCH
03 PROVE
04 RECLAIM

Explain the privacy model.

============================================================
PRIVACY
============================================================

Make the public/private distinction extremely clear.

PUBLIC:

Black backpack
Library
6:15 PM

PRIVATE:

Red keychain
Tear on strap
Blue notebook

Explain:

"Your proof stays private."

============================================================
RESPONSIVE DESIGN
============================================================

Desktop:

three-column shell

Tablet:

two-column shell

Mobile:

single-column

Bottom navigation:

Home
Discover +
Claims
Profile

The + action should be prominent but elegant.

No giant floating button.

No horizontal overflow.

Forms must remain excellent on mobile.

============================================================
MOTION SYSTEM
============================================================

Motion must have meaning. It should feel like precision engineering, not decoration — closer to the feel of a well-made physical object (a lock, a hinge, a dial) than a "modern web app."

Global motion rules:

- Base easing: a custom cubic-bezier resembling "ease-out-quint" for entrances, and a slightly slower "ease-in-out" for state changes. Never use bouncy/elastic/spring overshoot easing.
- Base durations: micro-interactions 120–180ms, component transitions 200–320ms, full-screen/state transitions 400–600ms. Nothing should feel sluggish or theatrical.
- Motion should always originate from the element the user acted on, not fly in from an arbitrary direction.
- Respect prefers-reduced-motion: every animation must have a static, instant fallback.
- One motion idea per moment. Never combine scale + fade + slide + color change on the same element at once.

---

MICRO-INTERACTIONS & HOVER EFFECTS
------------------------------------------------------------

Buttons:

- Primary buttons: subtle 2–4% brightness lift on hover, 1px inset shadow or border-tint shift on press (no scale bounce).
- Secondary/ghost buttons: border color shifts from Border (#252A32) to Secondary text tone on hover; background stays flat.
- Never scale buttons up on hover. A very slight (0.98x) scale-down on press/active is acceptable to convey tactility.

Links & nav items:

- Sidebar items: background fades in from transparent to Secondary surface over ~120ms on hover; active item gets a thin left accent rule (1–2px, Primary accent) rather than a filled pill.
- Underlines on text links animate width from 0 to 100% on hover, not a static underline.

List rows / feed items (Discover):

- On hover: background tints to Secondary surface, and the row's "action" control (Claim / View) fades in from 0 opacity — it should not be visible at rest, keeping the feed clean and dense.
- Status pills: no hover animation; these are informational, not interactive.

Form fields:

- Focus state: border shifts from Border to Primary accent over 150ms; label (if floating) lifts and shrinks with ease-out timing.
- Do not use glowing focus rings. A crisp 1px border shift plus a very subtle 1px accent-tinted outline is enough.

Icons:

- Icon buttons get a quiet background tint circle/square on hover (Secondary surface), fading in — icons themselves do not animate unless they are stateful (e.g., a chevron rotating 180° when a section expands, over 180ms).

Cards / grouped surfaces (used sparingly per Layout Philosophy):

- On hover, elevate one step in the surface scale (Secondary → Elevated) rather than adding a shadow. No lift/translateY bounce — max 1–2px upward shift if any.

---

AMBIENT BACKGROUND MOTION
------------------------------------------------------------

Ambient background motion is a sitewide baseline, not a Home-only feature — every screen should feel quietly alive, including auth screens (sign in / create account), Home, How It Works, and the Reclaimed state. It is dampened (not removed) on dense functional screens so it never competes with information density.

Two intensity tiers:

TIER 1 — Full ambient presence (Home, How It Works, auth/sign-up/sign-in, Reclaimed, empty states):

- A single, extremely subtle drifting gradient mesh or grain texture in the background, using Primary accent and Secondary accent at very low opacity (4–8%), moving on a slow 20–40 second loop. It should be almost subliminal.
- Alternative/complementary treatment: a faint, slow-moving constellation of thin connecting lines (echoing the "two paths reconnecting" brand concept) drifting at very low opacity behind hero/panel content.
- On a split-panel screen like sign-up (form on one side, brand/marketing content on the other), the ambient texture lives primarily behind the brand/marketing side, with a much fainter (1–3% opacity) continuation behind the form side so the whole screen feels like one coherent surface rather than "half alive, half flat."

TIER 2 — Dampened ambient presence (Discover, Item Detail, My Claims, forms/multi-step flows, Verification, Handover):

- The same gradient mesh or line texture at roughly half the opacity of Tier 1 (2–4%) and a slower loop (30–50s), positioned only at the page edges/corners so it never sits behind dense text, list rows, or form fields.
- This tier exists so no screen ever feels like static, dead background — while keeping information-dense screens scannable and precise.

Global ambient rules (apply to both tiers):

- No animated gradients on text, buttons, or foreground UI. Ambient motion is background-only.
- On the LOST → MATCHED → VERIFIED → RECLAIMED journey indicator, allow a slow, almost imperceptible pulse (opacity 90–100%, ~3s cycle) only on the currently active stage marker — never on completed or future stages.
- Ambient motion always respects prefers-reduced-motion (freezes to a static texture, zero animation) and is dampened further or disabled on low-power/mobile devices if needed to protect performance.

---

PARALLAX SCROLLING
------------------------------------------------------------

Parallax exists in exactly one place in the product: the Home page, around the LOST → MATCHED → VERIFIED → RECLAIMED journey strip and its ambient background layer. It does not exist anywhere else.

Where it is allowed:

- The journey strip's background layer may scroll at a slightly different rate than the foreground journey content — e.g. background at ~0.9x–0.95x of scroll speed, foreground stage markers/labels at 1x, or a second foreground layer at ~1.03–1.05x. That is the entire depth budget.
- Total resulting offset between layers should stay in the low single-digit pixels to at most ~8–10px at extreme scroll ranges — never more.
- The effect should read as the background layer settling slightly "behind" the journey line, echoing "two paths reconnecting."

Where it is explicitly forbidden (no exceptions):

- Navigation (sidebar, top bar, bottom nav on mobile).
- Any functional UI: buttons, form fields, inputs, filters, tabs, toggles.
- Discover, Item Detail, Report Lost, Report Found, Matching, Claim Flow, Ownership Verification, Verification Result, Handover, Reclaimed, My Claims, How It Works, Profile, Settings.
- Hero headline text, primary/secondary CTA buttons, and Recent Activity — these stay fixed at 1x scroll speed even on Home.

Hard technical constraints:

- No scroll-jacking: native scroll behavior, speed, and momentum are never intercepted.
- No large floating elements, no z-axis "camera move" effects, no scale changes tied to scroll position.
- Implement via transform (translateY) only, lightweight rAF-throttled — must stay performant on mid-range mobile.
- Must respect prefers-reduced-motion: zero relative offset, all layers at 1x, background fully static.
- Disable or dampen further on small/mobile viewports if needed — a static background on mobile is an acceptable fallback.

The test: a user should describe the Home page as "feeling polished" without being able to say why — never "the background moves when I scroll."

[END OF PART 3 — CONTINUE TO PART 4]
