I am building a completely NEW product called RECLAIMX from scratch.

I want you to act as a senior product designer, UX architect, brand designer, and design-systems expert.

I will give you my current RECLAIMX specification below.

Your job is to REVIEW THE SPECIFICATION and produce an ENHANCED FINAL BUILD SPECIFICATION for a brand-new Figma Make project.

IMPORTANT:
This is NOT a redesign of an existing ReclaimX interface.
There is NO existing UI to preserve.
Start from a completely blank canvas.

Do not give me instructions like:
"change the existing card"
"modify the current dashboard"
"replace the existing hero"
"update the current UI"

Instead, define exactly what the NEW ReclaimX product should look and behave like from the first generated screen.

(NOTE: This is part 1 of 4 parts of one continuous specification. Treat all 4 parts as a single document — do not restart or redefine the product between parts.)

============================================================
PRIMARY GOAL
============================================================

I want ReclaimX to feel like a premium, launch-ready technology product.

The minimum visual ambition is extremely high.

It should feel like something created by a professional product design team rather than:

- an AI-generated hackathon template
- a student project
- a generic SaaS dashboard
- a generic lost-and-found website
- an ecommerce template
- a cybersecurity template
- a crypto product
- a futuristic AI landing page

The product should have a distinctive identity.

The design must prioritize:

1. Product clarity
2. UX quality
3. Brand identity
4. Typography
5. Information hierarchy
6. Interaction design
7. Visual consistency
8. Trust
9. Privacy
10. Demo clarity

Visual effects come AFTER these.

============================================================
DESIGN INSPIRATION
============================================================

Use the principles found in excellent modern products:

- X/Twitter-level information density
- Linear-level precision
- Stripe-level clarity
- premium fintech/security-product trust
- editorial typography
- modern SaaS product discipline

DO NOT copy any of these products.

Do not reproduce their:

- logos
- exact layouts
- exact colors
- exact components
- branding
- visual assets

Only take inspiration from their design principles.

============================================================
RECLAIMX VISUAL PERSONALITY
============================================================

The product should feel:

- premium
- calm
- intelligent
- trustworthy
- private
- precise
- modern
- understated
- confident
- slightly mysterious

It should NOT feel:

- playful
- childish
- noisy
- overly futuristic
- cyberpunk
- neon
- overly colorful
- overly rounded
- glassmorphic
- cartoon-like

The design should communicate:

LOST
↓
MATCHED
↓
VERIFIED
↓
RECLAIMED

This recovery journey is the conceptual foundation of the product.

============================================================
BRAND IDENTITY
============================================================

Brand:

RECLAIMX

Tagline:

Find it. Prove it. Reclaim it.

Create a distinctive ReclaimX symbol based on the concept of:

two paths +
reconnection +
lost item +
owner
=

recovery

The X should represent two paths reconnecting.

The logo must work as:

- desktop logo
- compact sidebar logo
- mobile icon
- favicon
- app icon
- loading mark

Do not use a generic:

- location pin
- magnifying glass
- shield
- package icon

as the primary logo.

The identity should be recognizable without relying on the wordmark.

============================================================
DESIGN SYSTEM
============================================================

Create the design system BEFORE designing individual screens.

Background:
#090B0F

Primary surface:
#0F1217

Secondary surface:
#14181E

Elevated surface:
#181D24

Primary text:
#F5F5F0

Secondary text:
#9299A4

Muted text:
#656D78

Border:
#252A32

Primary accent:
#7657FF

Secondary accent:
#55C7D9

Use violet extremely selectively.

The UI should NOT look purple.

No:

- giant purple gradients
- rainbow gradients
- neon glow
- glowing borders
- excessive shadows
- glowing cards

============================================================
TYPOGRAPHY
============================================================

Use a modern grotesk/sans-serif system inspired by:

Inter
Geist
SF Pro

Typography should carry much of the visual identity.

Use:

- large editorial headlines
- strong page titles
- restrained section headings
- readable body copy
- compact metadata
- small uppercase labels
- monospaced identifiers

Use monospace for:

- item IDs
- claim IDs
- handover codes
- verification identifiers

Avoid decorative fonts.

Avoid excessive bold typography.

============================================================
LAYOUT PHILOSOPHY
============================================================

Do NOT design the application as a collection of giant cards.

The product should use:

- editorial layout
- thin separators
- structured whitespace
- typography
- inline metadata
- feed-style content
- carefully controlled surfaces

Cards should exist only when they serve a real grouping or interaction purpose.

Do not put a rounded container around every section.

Avoid:

card inside card
card inside card inside card

The interface should feel like a sophisticated information network.

============================================================
VISUAL QUALITY FIX — TYPOGRAPHY & EFFECTS CONSISTENCY
============================================================

This section corrects a specific failure mode seen in early generated screens (e.g. the sign-up/auth screen): mixing an editorial serif headline with a sans-serif UI font, flat unstyled inputs, and a background with no life in it. This is not premium — it reads as two different design systems stitched together. The following is mandatory and overrides any conflicting interpretation elsewhere:

Typography — ONE type family, no exceptions:

- Do NOT introduce a serif typeface anywhere in the product — not for headlines, not for accent words, not italicized, not anywhere. The typography section already specifies a single grotesk/sans-serif system (Inter/Geist/SF Pro-inspired). Headlines, body copy, labels, and buttons all come from that one family. A serif headline paired with sans-serif body copy is exactly the inconsistency to eliminate.
- Headline treatment for editorial moments (e.g. "Every item has a path home."): large size (40–56px desktop), tight letter-spacing (-1% to -2%), medium-to-semibold weight — never a script/italic serif accent word. If a single phrase needs emphasis, use the Primary accent color on that phrase, not a different font or style.
- Establish and reuse a strict type scale across every screen: Display (headlines), Title (section headers), Body (paragraph/UI text), Label (uppercase, small, tracked-out — e.g. "JOIN THE NETWORK"), Mono (IDs/codes). Every piece of text on every screen maps to exactly one of these five — no ad hoc sizes or weights invented per screen.
- Uppercase eyebrow labels use Label style consistently: small size (11–12px), letterspacing (+8–10%), medium weight, Secondary accent or Muted text color — never the Primary accent at full saturation unless it's a true call-to-action.

Form & input polish:

- Inputs are not flat boxes: Elevated surface background, 1px Border, 8–10px radius (consistent with the rest of the system, not ad hoc), placeholder text in Muted text, comfortable internal padding (14–16px vertical). On focus, apply the Form fields focus treatment defined later in this spec (border shift to Primary accent + subtle outline) — a static, effect-less input reads as unfinished.
- Primary CTA buttons always carry the hover/press micro-interaction specified later in this spec — never a flat, static button with no feedback states defined.
- Small trust/privacy notes (e.g. "Your ownership proof stays private.") sit in a subtly distinct row: Secondary surface background, muted lock icon, Secondary text — never an ad hoc color per screen; if a privacy-signifier color is used, define it once in the Design System above and reuse it everywhere.

[END OF PART 1 — CONTINUE TO PART 2]
