CONTINUING THE SAME RECLAIMX SPECIFICATION — PART 4 OF 4, FINAL PART)

---

SIGNATURE INTERACTION MOMENTS
------------------------------------------------------------

1. Recovery journey progression (Home / How It Works / Reclaimed):
   - Stages fill left-to-right with a thin progress line; the connecting line between two stages animates its "fill" over ~500ms when a milestone is reached, rather than snapping instantly.

2. Proof Locker sealing (Report Found):
   - Each private clue starts in an "UNSEALED" state (dashed border, muted text).
   - On confirmation, a brief (300–400ms) sequence: dashed border solidifies, a small lock icon rotates/clicks shut, text shifts from muted to primary color, background tints slightly darker.
   - Should feel mechanical and satisfying, like a physical latch — not glowy or magical.

3. Match signal reveal (Item Detail / Matching):
   - Signal bars/indicators animate in sequentially with a 60–80ms stagger, each filling from 0 to its value over ~300ms with ease-out timing.

4. Verification progress (Ownership Verification):
   - Step indicator (01/03) advances with a quiet horizontal slide. On final submission, a brief "evaluating" state (slow, thin indeterminate progress line, not a spinner) plays for ~600–900ms before resolving.

5. Handover two-halves merging:
   - HANDOVER CODE starts visually split with a thin vertical divider. As each party confirms, their half brightens from Secondary text to Primary text. When both confirm, the divider fades and the halves shift subtly toward each other (~500ms) — implying reconnection, not collision.

6. Reclaimed journey completion:
   - The four-stage journey resolves into a single collapsed, solid state over ~600ms. Restrained, no celebratory burst.

---

LOADING & TRANSITION STATES
------------------------------------------------------------

- Skeleton loading (not spinners) for feed content in Discover and My Claims — thin, low-contrast placeholder blocks with a very slow, subtle shimmer.
- Page/route transitions: content fades and shifts up 8–12px over ~200ms.
- Toasts: enter from the edge with a quiet slide + fade (~200ms), auto-dismiss with a thin countdown line.
- Modals: background dims (no glassmorphism), content fades and scales in from 98% to 100%.

Explicitly reaffirm: none of the above should ever produce particles, confetti, glow, bounce/spring overshoot, or parallax-heavy scroll-jacking. Every motion choice must be justifiable as clarifying state, hierarchy, or brand meaning.

============================================================
ICONOGRAPHY
============================================================

Use one consistent modern line-icon system: search, location, clock, image, lock, check, arrow, plus, filter, user, settings, bell, package/item.

No emoji in production UI.

============================================================
CONTENT
============================================================

Use believable fictional campus data:

Black backpack, Wireless earbuds, Scientific calculator, Blue water bottle, USB-C adapter, Wallet, Keys, Notebook, ID card

Locations: Central Library, Student Center, Cafeteria, Bus Stop, Academic Block, Sports Complex

Avoid lorem ipsum. Avoid generic AI marketing copy.

Use direct language: "Find what you lost." / "Someone found it." / "Prove it's yours." / "Keep your proof private." / "Ready to return."

============================================================
FUNCTIONAL PROTOTYPE
============================================================

This is a NEW Figma Make project. Use realistic mock data and local state. The complete prototype must be clickable.

Flow: Home → Report Lost → Submit → Potential Matches → Match Detail → Claim → Verification → Verified → Handover → Reclaimed

Second flow: Home → Report Found → Details → Proof Locker → Review → Publish → Discover

Functional requirements:

- navigation, buttons, forms, search, filters, tabs, modals, toasts, status changes all work
- mock data is realistic; loading and error states exist; responsive behavior works
- all micro-interactions and hover states are implemented (not just described)
- ambient background motion is implemented sitewide per the two-tier system — no screen, including auth, is left visually flat or static
- typography is strictly single-family — no serif fonts, no mixed type systems, no ad hoc sizes outside the defined type scale, on any screen including auth
- parallax is implemented ONLY on the Home page journey strip, offset capped at low single-digit-to-~10px, absent everywhere else
- parallax fully disables under prefers-reduced-motion and is dampened/disabled on mobile if needed

============================================================
ARCHITECTURE
============================================================

Structure the frontend so mock functionality can later be replaced with AWS services.

Separate: UI components / mock data / application state / service-API abstraction.

Conceptual services: itemsService, claimsService, matchingService, verificationService.

Do not tightly couple mock data to visual components.

============================================================
AWS
============================================================

AWS integration will be implemented AFTER the frontend prototype is finalized. Do not fake AWS integration. Do not put AWS credentials in the frontend. Do not put API keys in prompts. Do not create fake AWS credentials.

Future architecture: Frontend → AWS Amplify Hosting → API Gateway → Lambda → DynamoDB. Images: S3. Authentication: Cognito. Monitoring: CloudWatch. Potential intelligent matching: appropriate AWS AI/ML service if genuinely useful.

Do not add AWS services just to make the architecture diagram larger.

============================================================
FINAL DESIGN QUALITY BAR
============================================================

Before considering the design complete, ask:

Does this look like a real product? Does it have a recognizable ReclaimX identity? Does it avoid generic AI-generated UI? Does typography carry the design? Is information easy to scan? Are cards being overused? Does it feel premium without excessive effects? Is privacy immediately understandable? Does Proof Locker feel like a genuine innovation? Does verification feel trustworthy? Does handover feel memorable? Does Reclaimed feel satisfying? Does every screen belong to the same design system? Would it still look premium with all decorative effects removed? Does every motion moment clarify state, hierarchy, or brand meaning?

The final design should prioritize PRODUCT QUALITY over visual spectacle.

============================================================
MOST IMPORTANT INSTRUCTION
============================================================

BUILD RECLAIMX AS A NEW PRODUCT FROM A BLANK CANVAS.

Do not imitate a generic hackathon template. Do not create a landing page pretending to be an application. Do not create a dashboard pretending to be a product.

Create a cohesive, premium recovery network with its own visual language, brought to life with restrained, meaningful motion.

The final experience should communicate one simple idea:

LOST → MATCHED → PROVED → RECLAIMED

RECLAIMX

Find it. Prove it. Reclaim it.

[END OF SPECIFICATION — ALL 4 PARTS COMPLETE]
