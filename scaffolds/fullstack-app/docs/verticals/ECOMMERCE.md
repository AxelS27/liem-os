# Ecommerce And Marketplace Playbook

> Use this when the product is an ecommerce store, local commerce site, marketplace,
> seller platform, catalog, deals site, or shopping experience.
>
> This playbook does not override `docs/engineering/FRONTEND.md`. It translates the universal frontend
> rules into ecommerce-specific product instincts. Record the final product-specific choices
> in `docs/product/UI_UX.md`, then turn them into tasks in `docs/engineering/PROGRESS.md`.

## Core Principle

An ecommerce landing page is an active storefront, not a corporate hero page.

The first screen should make the user feel they can immediately search, browse, compare,
claim a deal, or continue shopping. If the page mostly shows a large headline, faint
product imagery, and a few quiet CTAs, it will feel like a SaaS landing page wearing an
ecommerce label.

Use Shopee and Tokopedia as the local-market lesson:

- Shopee feels alive because it prioritizes promo energy, icon-led shortcuts, shopping
  actions, vouchers, cart, account, and dense campaign modules.
- Tokopedia feels trustworthy and usable because search is dominant, categories are easy
  to scan, utility actions are visible, and the page quickly shifts from banner to
  shopping modules.

Reference pages to study:

- [Shopee Indonesia](https://shopee.co.id) - high-energy marketplace density, promo rails,
  icon-led shortcuts, cart/search/account controls, and campaign-first shopping modules.
- [Shopee Pilih Lokal](https://shopee.co.id/m/shopee-pilih-lokal) - local-brand campaign
  page with strong banner art, icon navigation, voucher modules, and product/category
  momentum.
- [Tokopedia](https://www.tokopedia.com) - search-led marketplace home with clear category
  entry points, utility actions, delivery context, and organized shopping modules.

Do not copy their visual clutter directly. Borrow the ecommerce structure and scanability,
then tune density, color, and restraint to the product.

The target is balanced and alive, not chaotic. Use product imagery, meaningful icons,
useful hover/tap panels, clear price/rating hierarchy, and controlled color accents to make
the page feel active. Do not rely on full-page animation, random decoration, or card-heavy
paper layouts.

## First Viewport

The first viewport should contain real shopping affordances:

- A visible navigation surface with brand, categories, search, cart, auth/account, and
  seller/help links where relevant.
- A large search bar or search-led hero. Search is often the primary ecommerce action, not
  a secondary navbar detail.
- A campaign banner, promo panel, product story, or carousel that shows real products,
  offers, or shopping categories.
- Fast entry points into categories, deals, vouchers, local brands, best sellers, or new
  arrivals.
- Enough density that the page feels stocked. Avoid a sparse hero with one large sentence
  and faded decorative product images.

The first viewport should answer: what can I buy here, how do I find it, and what is worth
checking right now?

This must actually fit the first screen. The brand/nav, search, and the first shopping module
should be visible without scrolling at common desktop heights (~720-768px) and on mobile. If a
user has to scroll just to reach the hero or the search bar, the fold is being wasted, usually
by an oversized headline band or too much top padding. Tighten spacing instead of stacking a
tall atmospheric hero above the real storefront.

### Storefront hard rules (learned from real builds)

- **The storefront sells products, not the concept of the marketplace.** A
  badge + headline + subcopy + input + buttons + stats stack is a SaaS hero skeleton in
  marketplace clothes. Real merchandise (images, names, prices) must appear above the
  fold.
- **One dominant search.** The header search IS the search. Do not render a second large
  search input in the hero - replace it with category chips or a product module.
- **A promo panel carries one message.** Heading + product imagery + one action. Stacked
  badges + paragraph + tiles + bullet list + button in a single card is clutter.
- **Category entry points are light chips/rails** (icon + label), not a row of heavy
  uniform cards with subtitle noise. Distinct icons or imagery per category; never the
  same glyph repeated across different items.
- **Deals need a visual signal.** Use the semantic discount/price accent on price drops
  and deal badges - a storefront that is 100% neutral + brand color has no "deal" energy.
  One accent, applied at the price/badge level, never sprayed across sections.
- **Utility bar items cluster purposefully** - location/delivery context on one side,
  account/help on the other. No item floats alone in the middle, no link appears twice.

## Navigation And Search

Ecommerce navigation is a product control surface.

**Search is the dominant element, not one item among many.** The single most common
marketplace-navbar mistake is cramming everything into one row: logo, a small search box,
several text nav links (Categories, Deals, Seller Center), utility icons, and auth buttons
all fighting for the same line. The search box ends up squeezed and the whole bar feels
unbalanced. Look at Tokopedia and Shopee: search takes the dominant central width, and
everything else is minimal around it.

- **Give the search bar the most horizontal space in the header.** It should visibly be the
  primary action, wide and central, not a narrow input wedged between text links.
- **Budget the top row.** A marketplace header should not carry logo + search + 3-4 marketing
  text links + utility icons + 2 auth buttons in one line. Keep the main row to: logo,
  dominant search, and a compact cluster of utility/account/cart controls.
- **Prefer a two-tier header when there is a lot to show.** Shopee's pattern: a thin top
  utility strip (seller center, help, notifications, language, account) above a main row
  that is logo + big search + cart. This keeps the primary row calm and lets search dominate.
  A category entry point (menu button, "Categories" with a chevron mega-menu, or a chip rail)
  can sit just below the search row rather than competing inside it.
- Do not treat the navbar as a marketing navbar with a search box bolted on. Categories and
  Deals are browse surfaces (mega-menu, chip rail, category page), not text links crowding
  the search.
- Give the nav a deliberate background or surface. It should not be invisible text floating
  over a plain page.
- Anchor the header (sticky) so search, cart, and account stay reachable while the user
  scrolls a long storefront. A header that scrolls away forces users back to the top to
  search or check the cart.
- Make search easy to find on desktop and mobile. On desktop, a wide search input in the
  header is usually better than a small search button. On mobile, use a prominent search
  field or search row near the top.
- Use familiar icon + label controls for cart, account, notifications, store/seller center,
  location or delivery, menu, and search.
- Include a category entry point early. A "Categories" link alone is often too quiet for a
  marketplace; use a category menu, rail, chips, or icon grid when category browsing is
  important.
- Show delivery or location context when it matters to buying decisions.
- Keep primary nav links route-based. Category and campaign shortcuts can be route links or
  secondary in-page modules, but top nav should not be a set of same-page anchors.

## Icon-Led Scanability

Icons are especially useful in ecommerce because users scan quickly and recognize shopping
symbols.

Commerce controls should be icon-first when the action is universally recognizable, icon +
label when the item is part of navigation or browsing, and text-led when the wording carries
the meaning.

Use icon + label patterns for:

- Search, cart, checkout, account, notifications, menu.
- Categories such as fashion, beauty, electronics, home, kitchen, groceries, baby, sports,
  pets, automotive, and digital products.
- Deal modules such as vouchers, flash sale, discounts, free shipping, local brands,
  bundles, new arrivals, and best sellers.
- Seller-side actions such as start selling, seller center, manage store, orders, payouts,
  and inventory.

Do not add icons everywhere. Use text-only controls for actions where an icon does not add
meaning. Use icon-only controls only for compact universal actions and always include an
accessible label.

### Commerce Icon Decision Table

| Pattern              | Use for                                                                                                                                                   | Rules                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Icon-only            | Compact universal controls: search submit, cart, menu, close, more actions, notification bell, wishlist                                                   | Must have an accessible label, visible focus state, and badge/count when status matters.                                                |
| Icon + label         | Navigation and scan-heavy entry points: notifications, help, language, seller center, category rail, voucher, flash sale, local brands, delivery/location | Best default for ecommerce nav and category/deal shortcuts when there is enough space.                                                  |
| Text + optional icon | Major CTAs: shop products, start selling, checkout, view all categories, claim voucher                                                                    | Keep the text label primary. Add an icon only when it reinforces the action, often leading for nouns and trailing for forward movement. |
| Text-only            | Legal/help links, long copy actions, destructive confirmations, simple secondary links, actions where no familiar icon exists                             | Prefer clarity over decoration.                                                                                                         |

Examples:

- Search button in a header can be icon-only with `aria-label="Search"`.
- Cart can be icon-only with an item count badge, or icon + "Cart" in roomy layouts.
- Notifications can be icon + "Notifications" on desktop utility nav, or icon + badge in a
  compact header.
- Account can be avatar/icon + user name, with a dropdown panel for profile and orders.
- Category rails should usually be icon + label because the visual rhythm helps browsing.

## Interactive Commerce Controls

Ecommerce navigation should feel interactive because many header controls are not simple
links. They are compact entry points into useful panels.

Use hover, focus, and click depth for controls that reveal real follow-up content:

- Cart: mini cart preview, item count, recent items, empty cart state, and checkout/cart
  link.
- Account: sign in/sign up prompts for guests; profile, orders, settings, and sign out for
  signed-in users.
- Notifications: recent order updates, promo alerts, read state, and a link to all
  notifications.
- Categories: category tree, mega menu, popular categories, or department shortcuts.
- Search: recent searches, popular keywords, suggested products, suggested categories, and
  clear submit behavior.
- Location or delivery: address summary, delivery area selector, shipping estimate, or
  pickup options when relevant.
- Language or region: compact selector with the current choice highlighted.
- Seller center: seller quick links, onboarding CTA, orders, inventory, or payouts when
  the user is a seller.

This is not the same as adding hover animation to everything. Ordinary CTAs can use subtle
feedback such as a color shift, icon nudge, underline, or quiet shadow. Controls with more
content should open a dropdown, popover, sheet, or mega menu.

Interaction rules:

- Desktop can use hover when it is fast and predictable, but every panel must also be
  reachable by keyboard focus and click.
- Mobile uses tap, not hover. The same content should become a drawer, sheet, popover, or
  route depending on complexity.
- Use visible focus states and `aria-expanded`/`aria-controls` where a control opens a
  panel.
- Panels need useful empty states. An empty cart preview should show a calm message and a
  shopping CTA, not a blank box.
- Do not open panels that contain fake filler. If there is no useful content yet, use a
  direct link or a simple menu until the feature exists.
- Keep panel density intentional. A marketplace can show more information than a SaaS nav,
  but the panel should still be scannable.
- Avoid page-wide dim overlays for tiny hover menus. Use overlays only for larger drawers,
  mobile sheets, or modal-like flows where focus should be trapped.

The goal is a storefront that responds to the user's intent. A static navbar with text links
only will often feel unfinished for ecommerce.

## Banner And Promo System

Ecommerce pages need campaign energy.

Good banner modules include:

- Seasonal or date-based campaigns.
- Free shipping or shipping threshold.
- Voucher claims.
- Flash sale countdowns.
- Local brand or seller campaigns.
- Category-specific promos.
- Featured brands or curated collections.
- New product launches.

Banners should show real product or campaign content, not generic atmospheric images. A
banner can be bold, colorful, and dense if it remains readable and on-brand.

Avoid the SaaS-style ecommerce mistake: a large abstract hero with a soft image collage,
one paragraph of trust copy, and no direct shopping module above the fold.

## Category Entry Points

Categories should feel browseable, not like documentation.

Prefer:

- Horizontal icon rail for top categories.
- Compact category chips with icons.
- Category tiles with product imagery, but only when images are strong and not faded.
- "Popular categories" close to the top of the page.
- Counts, deal labels, or short helper text only when they add useful context.

Avoid:

- Plain text category cards with lots of whitespace.
- Too many bordered cards where icon chips or open grids would scan faster.
- Category labels that are too clever. Use conventional shopping terms.

## Product And Deal Modules

A shopping homepage should quickly move from brand promise to inventory.

Common modules:

- Flash deals.
- Recommended for you.
- Trending products.
- Best sellers.
- New arrivals.
- Local seller highlights.
- Vouchers and coupons.
- Recently viewed.
- Top-up or digital product panels, when relevant.
- Category rows with product cards.

Product cards should prioritize product image, title, price, discount, rating or sold count,
seller/location when relevant, and a clear action. Do not overload every card with every
metric. Use progressive disclosure for secondary actions.

## Product Card Hierarchy

Product cards are where ecommerce pages most often turn into plain text soup. A good card
uses semantic visual treatment so users can scan product identity, price, trust, and action
without reading every line.

Prioritize information in this order:

1. Product image.
2. Product name.
3. Price and discount.
4. Rating, sold count, stock, delivery, and seller/location signals.
5. Category or campaign badge.
6. Primary action.

Visual hierarchy rules:

- Product name should be readable and link-like when it opens detail. Use clear weight and
  color, but do not make every metadata label equally dark.
- Price should be more prominent than normal body copy and should use a commerce/brand or
  price token. It should not look identical to the product title or description.
- Discounts and old prices need a separate treatment: muted strikethrough for old price,
  promo/accent token for discount labels, and compact badges where useful.
- Rating should use a star icon or equivalent rating symbol plus the numeric score. A raw
  text string like "4.7 rating" is slower to scan.
- Sold count should use muted metadata text and can pair with a shopping bag, package, or
  small dot separator. Keep it secondary to price.
- Stock and delivery signals should use familiar icons or badges: check for ready stock,
  truck for delivery/dispatch, map pin for location, store for seller, and package for
  shipped items.
- Category and campaign labels should be compact badges or chips, not heavy black text.
- Descriptions should be short and muted. Avoid letting description copy compete with price
  and product name.
- Product actions should be explicit. "View" is usually too generic; prefer "View item",
  "Add to cart", "Choose options", or a clear icon + label action based on the flow.
- If the whole card is clickable, still provide a visible title link, trailing arrow, or
  action control so users can see the affordance.

Example metadata treatment:

- Star icon + `4.7`
- Shopping bag/package icon + `410 sold`
- Truck icon + `Fast dispatch`
- Store icon + seller name or location
- Badge: `Best seller`, `Ready stock`, `Local pick`, `Free shipping`

Avoid:

- Product title, price, rating, sold count, category, and description all using the same
  black text weight.
- Plain metadata strings like `4.7 rating - 410 sold` when icons and separators would scan
  faster.
- Clickable product names or section actions that look like normal body text.
- CTA labels that are too vague for ecommerce, such as a lone `View` button.

## Density And Rhythm

Ecommerce can be denser than a corporate site, but density must be organized.

- Use a compact rhythm for nav, category rails, promo modules, and product grids.
- Keep gutters smaller on desktop so the store feels broad and stocked.
- Use section spacing to create breathing room, not huge empty bands.
- Avoid a one-note palette. Commerce UIs often need controlled accents for discounts,
  urgency, shipping, trust, and category identity.
- Use cards where they clarify product or module boundaries. Do not wrap every section,
  filter, row, and banner in separate bordered cards.
- Avoid the "paper marketplace" look: pale surfaces, faded product images, quiet text-only
  links, and repeated bordered cards with little interaction. A storefront should feel
  usable and stocked, not like a printed wireframe.

The goal is "busy store, clear aisles", not chaos.

## Color Direction

Ecommerce color can be more expressive than SaaS UI, especially for deals and categories.

- Pick one primary brand color, and make it a deliberate product choice. Do not reach for
  whatever palette is currently in heavy AI rotation (forest-green + cream, muted sage, and
  the like are examples, not the only ones); a safe trendy default reads as a template, not
  a store. Commit to a palette that fits the actual catalog and audience.
- Add a small set of semantic commerce accents, such as promo, discount, warning, delivery,
  success, and muted surfaces.
- Keep colors in `globals.css` tokens. Do not scatter raw Tailwind palette classes or hex
  values through components.
- Use bright accents for actionable commerce information, not random decoration.
- Do not let every module compete. A promo banner can be loud; product grids and nav should
  usually be calmer.

## Copy Direction

Ecommerce copy should be direct and action-oriented.

Prefer:

- "Search products, brands, or categories"
- "Shop local deals"
- "Claim voucher"
- "Browse categories"
- "Start selling"
- "Free shipping over ..."
- "Flash sale ends soon"
- "Popular near you"

Avoid:

- Long abstract promises like "Shop trusted products from local sellers" as the only first
  impression.
- Generic startup copy such as "discover clear product options" or "a focused path from
  idea to release".
- Over-explaining obvious modules. A section titled "Flash Sale" does not need a subtitle
  saying "Explore discounted products".

## Mobile Behavior

Marketplace users are often mobile-first.

- Keep search reachable immediately.
- Use horizontal scroll rails for categories and campaign shortcuts when they fit.
- Keep cart/account/menu actions easy to tap.
- Product grids should become one or two columns depending on content density and image
  quality.
- Large desktop banners may need mobile-specific cropping or stacked content.
- Touch targets should remain comfortable; density must not create tiny controls.

## Seller And Marketplace Considerations

If the product supports sellers:

- Separate buyer actions from seller actions. "Start selling" and "Seller Center" can be
  present, but buyer shopping should remain the primary first impression unless the product
  is seller-first.
- Do not show seller operational metrics on buyer-facing landing pages. Buyers do not need
  to see orders today, weekly revenue, stock alert counts, seller workflow coverage, or
  sample order values. Those belong in seller/admin contexts.
- Seller dashboards should be more operational and less promotional: orders, inventory,
  payouts, product status, shipping, and support.
- Buyer-facing proof points should answer buyer questions: product availability, shipping,
  return policy, ratings, sold count, seller trust, vouchers, and price clarity.
- Marketplace payment, payout, refund, and seller settlement flows must follow
  `docs/engineering/PAYMENTS.md` before implementation.

## Common Anti-Patterns

Avoid:

- Treating ecommerce like a SaaS landing page with one hero, two buttons, and a few feature
  cards.
- Faded product images used as soft decoration. Products should be inspectable and
  desirable.
- Text-only category cards where users expect visual shortcuts.
- A small search link hidden in nav.
- A crammed single-row header where logo, a squeezed search box, several marketing text
  links, utility icons, and auth buttons all compete on one line. Let search dominate; move
  the overflow into a two-tier header, a category mega-menu, or a chip rail.
- A heavy near-black (`bg-foreground`) promo panel in the hero's first viewport that
  out-weighs the headline and steals the focal point. Use a soft surface for hero-side promos.
- Too much whitespace above the first real product or category module.
- A hero so tall the user must scroll before reaching search or the first shopping module.
- A header that scrolls away instead of staying anchored for search, cart, and account.
- Any safe trendy default palette (forest-green + cream, muted sage, and the like) standing
  in for a real brand identity.
- Promo modules that look like generic cards instead of campaigns.
- Icons used randomly or on every button without meaning.
- A single muted brand color used for everything, making deals and actions feel lifeless.
- Primary navigation that jumps to landing sections instead of real routes.
- Public UI that exposes provider names or implementation details.
- Buyer-facing pages that show seller/admin KPIs, revenue, operations counters, workflow
  coverage, or other data that only internal teams can act on.

## Storefront Layout & Navigation Guardrails (Buyer-Centric)

To optimize conversion and design trust, adhere to these buyer-first layout rules:
1. **Showcase Featured Products Above the Fold:** Always show real product cards (merchandise, pricing, images) directly on the landing page's first viewport. Do not waste the above-the-fold space on generic SaaS headline/copy blocks.
2. **Buyer-First Navbar:** The navbar is built for buyers. Never include seller recruitment prompts like "Sell on this website" or "Seller registration" in the primary navbar. Seller options should live at the footer of the landing page or as a quiet secondary link.
3. **Order History Placement:** "Order History" must live inside the customer's account/profile page. Do not clutter the main navbar with an order history link.
4. **Shopping Bag Icon:** Cart/Shopping bag in the navbar should use an icon-only representation (with a numeric count badge) rather than a text label next to it.

## Detailed Seller & Admin Dashboards

Sellers and Admins require robust operational interfaces:
1. **Sales & Performance Graphics:** Both dashboards must feature visual analytics (e.g., using Recharts) for sales tracking, order volume, daily/weekly revenue, and transaction trends.
2. **Comprehensive Product Creation (Seller):**
   - Input fields: Product Name, Price, Quality description, category, and inventory count.
   - Media upload: Must support user-uploaded images and videos directly. Allow multiple image uploads (at least 3-5 images) and a video preview file.
3. **Advanced Customer & Seller Registration:**
   - Identity collection: Registration must collect full name, active phone number (`nohp`), and location detail.
   - Multi-Address Support: Customers must be able to save and manage multiple shipping addresses (e.g., Home, Office, Pick-up) and select which address to use at checkout.
   - Auto-suggest and Map Select: Connect address inputs to the Google Maps Autocomplete API (see `docs/engineering/FRONTEND.md` for API rules) for auto-suggesting streets/locations, and provide a visual Google Maps selector to place a pin for precise coordinates.
4. **Voucher System:**
   - Voucher / Coupon codes: Customers can apply vouchers at checkout.
   - Backend logic: Validate voucher code, active dates, min spend thresholds, and discount calculation (flat rate or percentage).

## Simulation & Testing Systems (Development Mode)

To make testing checkout, payment, shipping, and roles effortless, build these simulation tools directly into the template:
1. **Role Selector Dropdown:**
   - Include a floating dropdown selector (visible only in development/staging environments) allowing developers to hot-swap roles dynamically between: `Guest`, `Customer`, `Seller`, and `Admin`.
   - Swapping roles should immediately update the session state, navbar controls, and route access to allow rapid end-to-end flow validation.
2. **Payment Simulation:**
   - In sandbox/development checkouts, provide a simulation toggle to select transaction outcomes: `Payment Success`, `Payment Failed`, or `Pending/Timeout`.
   - Simulating success should invoke the payment webhook and transition the order status to `Paid` automatically.
3. **Shipping & Courier Simulation:**
   - Provide an operational control panel on the order status view to simulate fulfillment stages: `Simulate Package Dispatched`, `Simulate Out for Delivery`, and `Simulate Package Delivered`.
   - Each state change should trigger database updates and update the buyer's order history dashboard in real-time.
## E-commerce System Architecture & Production Guardrails

To build a production-grade e-commerce/marketplace application, implement the following architectural components and strict limits:

### 1. Performance Budget (High Priority)
Ensure that the storefront loads instantly and remains highly responsive under heavy loads:
- **Core Web Vitals:** Target LCP < 2.5s, CLS < 0.1, and INP < 200ms.
- **Payload Limits:** Critical, render-blocking JavaScript bundle size must not exceed **250kb** (gzipped).
- **Network Requests:** Limit critical path initial homepage requests to **≤ 3 requests**.
- **Media Budgets:** Above-the-fold images must be limited to **≤ 4 images**.
- **Hero Render Time:** Ensure the above-the-fold hero rendering completes in **< 1 second**.
- **Optimizations:**
  - Default: Server-Side Render (SSR) the storefront landing and catalog list pages for maximum performance and SEO.
  - Preferred: Lazy-load all below-the-fold sections, dynamically import heavy components, and virtualize lists for catalogs containing >100 products.
  - Preferred: Use skeleton loader layouts matching the UI structures instead of generic spinning loaders.
  - Forbidden: Rendering uncompressed, un-resized user media on product grids.

### 2. Search Architecture & Query Layers (High Priority)
Implement a tiered query pipeline to ensure buyers find products quickly:
- **Query Processing Layers:**
  1. *L1 → Exact Match:* Exact keyword and ID matches.
  2. *L2 → Prefix Match:* Suggest items as the user types (autocomplete).
  3. *L3 → Typo Tolerance:* Fuzzy matching to capture spelling mistakes.
  4. *L4 → Semantic Search:* Matching categories and intents (e.g., "running footwear" matches "sports shoes").
  5. *L5 → Personalized Ranking:* Sort by sales velocity, user preferences, and relevance.
- **Search Features:**
  - Default: Show recent searches, trending keywords, and autocomplete suggestions for products and categories.
  - Preferred: Search analytics dashboard tracking CTR, zero-result terms, and conversion rates.
  - Exception/Fallback: If search yields zero results, show **No Result Recovery** blocks (related recommendations or popular alternatives) instead of an empty white page.

### 3. Checkout Lifecycle & Concurrency (High Priority)
Protect transactions and prevent state conflicts during the purchasing lifecycle:
- **Lifecycle States:** `Cart` → `Review` → `Address Selection` → `Payment Method` → `Processing` → `Paid` → `Fulfillment/Shipped`.
- **Concurrency & Stock Locks:**
  - Default: Reserve stock temporarily when a customer enters the checkout processing state.
  - Forbidden: Allowing customers to pay before verifying inventory availability (prevents overselling).
  - Default: Expired stock reservations (e.g., checkout not completed in 15 minutes) must be auto-released back to available inventory.
- **Payment Safety:**
  - Default: Enforce strict payment idempotency using unique checkout tokens to prevent duplicate charging on double-clicks.
  - Preferred: Set up abandoned checkout recovery triggers (e.g., email notification after 1 hour of abandonment).

### 4. Marketplace Economics & Financial Systems (High Priority)
For multi-seller systems, isolate funds and secure balances:
- **Supported Flows:** Commissions, Platform Fees, Voucher/Promo Funding splits, Refund handling, Settlement Delays, Escrow, and Seller Balances.
- **Safety Invariants:**
  - Default: Isolate the platform's operational account from the escrow/trust accounts holding customer payments.
  - Forbidden: Releasing payouts to sellers before the settlement delay period ends (to protect against refund exploits and chargebacks).
  - Default: Keep comprehensive transaction ledger history and prevent negative payouts/balances.

### 5. Fraud & Abuse Protection (High Priority)
Secure the storefront against exploits and malicious behaviors:
- **Abuse Vectors:** Fake orders, coupon/voucher abuse, multi-account creations for sign-up bonuses, bot scraping, spam sellers, and refund exploits.
- **Protection Actions:**
  - Default: Implement rate limiting on cart additions, logins, and API routes.
  - Preferred: Apply shadow limits or temporary freezes on suspicious accounts for manual review.
  - Preferred: Use device fingerprinting and monitor suspicious behaviors (e.g., same card used across 10 accounts).

### 6. Inventory Consistency & Atomicity (High Priority)
Inventory updates must be strictly consistent and transaction-safe:
- **Stock States:** `Available` → `Reserved` → `Paid` → `Shipped` → `Returned`.
- **Rules:**
  - Default: Perform atomic stock updates in the database (e.g., using `UPDATE inventory SET stock = stock - quantity WHERE id = X AND stock >= quantity`).
  - Default: Restore stock count automatically when reservations expire or orders are cancelled.
  - Preferred: Maintain a transaction log of all inventory events for audit capability.

### 7. Observability & Operations (Medium Priority)
Monitor performance and user flows dynamically:
- **Analytical Metrics:** Log Conversion Rate, Search CTR, Add To Cart rate, Checkout drop-off steps, and Refund rates.
- **System Alerts:** Notify administrators immediately on high error rates, slow response timings, payment failures, or inventory mismatches.

### 8. Permission System & RBAC (Medium Priority)
Secure server endpoints and routes based on roles:
- **Roles:** `Guest` (public views, search), `Customer` (cart, orders, checkout), `Seller` (products, shop metrics), `Admin` (global management, finance).
- **Rules:**
  - Default: Deny access by default; all API routes and database access (RLS) must explicitly verify user role permissions on the server side.
  - Default: Keep audit logs of administrative actions.

### 9. Empty / Error States (Medium Priority)
Make sure errors are actionable:
- **States:** No Products, No Search Results, Empty Cart, Empty Notifications, Offline.
- **Rules:**
  - Default: Every empty or error state must display a clear message, a supportive graphic, and suggest the **next logical action** (e.g., a "Continue Shopping" button or popular product highlights).

### 10. Internationalization (Low Priority)
- **Localisation Rules:**
  - Default: Support currency, timezone, language, and metric/unit conversions. Use locale-aware formatting for numbers and dates.

### 11. SEO & Discovery (Low Priority)
- **Storefront SEO Requirements:**
  - Default: Server-Side Render (SSR) catalog landing pages. Add JSON-LD Structured Data (Product schemas, reviews) and Open Graph tags.
  - Default: Automatically update dynamic XML sitemaps and set up correct robots.txt directives.

### 12. Content Moderation (Low Priority)
- **Seller Upload Safety:**
  - Default: Run automated text filters and basic duplicate checks on product listings.
  - Preferred: Scan seller-uploaded images for safety before displaying them publicly.

### 13. Event-Driven Architecture (Advanced)
- **Core System Events:** `OrderCreated`, `PaymentSuccess`, `ShipmentDelivered`, `ReviewCreated`.
- **Rules:**
  - Default: All event handlers must be **idempotent** (processing the same event twice results in the same state change once).
  - Default: Support automated retries with exponential backoff for event deliveries.

---

## Rule Flexibility Paradigm

When writing or modifying e-commerce features, guidelines are structured to allow flexibility under specific circumstances. We avoid absolute command words ("MUST", "ALWAYS", "NEVER") and instead use:

- **Default:** Standard expected behavior.
- **Preferred:** High-quality/optimized approach to aim for.
- **Exception:** Permitted deviation under a specific business case.
- **Forbidden:** Strict boundary that violates architectural safety or design DNA.

### Practical Layout & Navigation Examples:
- **Default:** Order history lives inside the account page.
  - *Exception:* Expose recent orders on the homepage when repeat purchase behavior/velocity is high (e.g., groceries or repeating subscription orders).
- **Default:** Show featured products above the fold.
  - *Exception:* Show a large campaign banner above the fold during major site-wide seasonal sales events.
- **Default:** Cart/Shopping bag in the navbar is icon-only.
  - *Exception:* Display a label like "Bag (2)" in wide layouts with abundant spacing.

## UI_UX.md Mapping Checklist

When this playbook applies, `docs/product/UI_UX.md` should answer:

- Which ecommerce model is this: single store, catalog, marketplace, local commerce, seller
  platform, or deals site?
- What is the first viewport structure: search-led, promo-led, category-led, or product-led?
- What top-level routes exist for buyers, sellers, auth, cart, checkout, and account?
- Which button and control actions use icons?
- Which header controls reveal panels on hover/focus/click: cart, account, notifications,
  categories, search, location, language, or seller center?
- Which category shortcuts appear above the fold?
- What promo modules are allowed, and what makes them feel on-brand?
- How dense should the landing page be compared with Shopee/Tokopedia?
- What product card information is required?
- How do product cards visually distinguish name, price, discount, rating, sold count,
  stock, delivery, seller/location, category badge, and primary action?
- Which clickable text links or card areas need visible affordances such as underline,
  arrow, ghost button, or title-link styling?
- What mobile navigation and search behavior is expected?
- Which payment, order, refund, payout, and seller flows are in scope?
