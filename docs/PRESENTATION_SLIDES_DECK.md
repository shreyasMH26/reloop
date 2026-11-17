# ReLoop — Project Defense Presentation Deck
### VTU Computer Science & Engineering • Societal Project (1BCP308)
**Slide-by-Slide Presentation Outline with Speaker Notes & Visual Layouts**

---

## SLIDE 1: Title & Introduction
- **Title**: ReLoop — Hyperlocal Circular Community Marketplace
- **Tagline**: *"Give Things a Second Life: Circular Resource Circulation & Waste Diversion"*
- **Course**: Societal Project (1BCP308)
- **Institution**: Department of Computer Science & Engineering, VTU Pilot (Davanagere)
- **Team**: Final Year CSE Project Team
- **Speaker Note**: 
  > *"Good morning respected evaluators. Today, we present ReLoop, a societal technology platform designed to transform linear student consumption into a circular, sustainable community economy in Davanagere."*

---

## SLIDE 2: Problem Statement & Campus Realities
- **Linear Consumption**: Take → Make → Dispose.
- **Economic Inefficiency**: Engineering textbooks, Casio calculators, bicycles, and drawing kits purchased brand new every semester, then discarded or sold for scrap at <10% value.
- **Flaws in Existing Classifieds (OLX/Quickr)**:
  - Commercial drop-shippers and spam dealers dominate listings.
  - Distant city radiuses (25+ km) make low-cost student trades unviable.
  - Zero trust verification: advance-fee UPI fraud and safety concerns during meetups.
- **Speaker Note**:
  > *"Over 35,000 students in Davanagere spend lakhs every semester on assets with a useful life of 5+ years, only to discard them after 4 months. OLX doesn't work for a ₹400 book meetup across campus."*

---

## SLIDE 3: Proposed Solution — ReLoop
- **Brand Positioning**: Hyperlocal, student-first, and circular-by-design.
- **Triple Transaction Architecture**:
  1. **Direct Buy/Sell**: Transparent, community-depreciated pricing.
  2. **Short-Term Rental**: Daily rates with minimum rental periods and deposit estimates.
  3. **Direct Barter / Exchange**: Item-for-item trade with optional UPI cash balancing.
- **Local Davanagere Geofencing**: BIET Campus, MCC A/B Block, Vidyanagar, Hadadi Road.
- **Speaker Note**:
  > *"ReLoop is not just a marketplace; it provides three distinct ways to access goods: buying second-hand, renting for project cycles, or exchanging item-for-item."*

---

## SLIDE 4: System Architecture & Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Leaflet Interactive Maps.
- **Progressive Web App (PWA)**: Installable directly on Android/iOS home screen with offline caching.
- **Backend**: Node.js, Express, native WebSocket gateway (`/ws`), Helmet security headers, multi-tier rate limiting.
- **Data Tier**: Dual-driver architecture supporting transactional PostgreSQL connection pooling with resilient fallback.
- **Security**: Binary magic-number file validation (JPEG, PNG, WebP) enforcing 5MB strict limit.
- **Speaker Note**:
  > *"We architected ReLoop for high reliability. The frontend is an ultra-fast PWA, while the backend utilizes WebSocket connections for real-time notifications and rate limiters to stop credential stuffing."*

---

## SLIDE 5: Verified Handover Reviews (Trust Integrity)
- **Problem**: Review systems on public marketplaces are vulnerable to fake bot ratings.
- **ReLoop Innovation**:
  - Reviews can **only** be submitted after an order status is marked as `completed`.
  - Relationally enforced one-review-per-transaction constraint.
  - Seller dynamic rating automatically recalculates upon verified handover.
- **Speaker Note**:
  > *"You cannot review someone unless a physical handover order is verified on the platform. This guarantees 100% authentic community trust scores."*

---

## SLIDE 6: Dynamic Bharat UPI QR Settlement Flow
- **Seamless Local Meetup**: No cash change disputes or advance payment fraud.
- **On-Spot Bharat QR**:
  - Automatically compiles standard NPCI `upi://pay` deep links.
  - Dynamic QR code displayed on screen with exact rupee amount and order reference.
  - Mobile users tap "Open in UPI App" to trigger GPay, PhonePe, or Paytm directly.
- **Campus Safety Feature**: Reminds buyer to physically inspect item condition before scanning.
- **Speaker Note**:
  > *"When two students meet at the BIET library gate, the buyer scans the seller's on-screen UPI QR code. Payment is instantaneous, verified, and free of middleman commissions."*

---

## SLIDE 7: ReLoop Sustainability Intelligence (EPA WARM)
- **Scientific Foundation**: Modeled on U.S. EPA Waste Reduction Model (WARM v15).
- **Live Metrics Generated**:
  - **CO₂e Avoided**: $\approx 14.8\text{ kg CO}_2\text{e}$ per diverted consumer asset.
  - **Virtual Water Saved**: $\approx 2,450\text{ Litres}$ per textbook/gadget loop avoided.
  - **E-Waste Prevented**: $\approx 2.6\text{ kg}$ per electronics item kept out of landfill.
  - **Urban Tree Equivalent**: Ratio of $\text{CO}_2\text{e} / 22$.
- **Community Leaderboard**: Gamified recognition for campus members keeping goods circulating.
- **Speaker Note**:
  > *"Every listing displays its tangible ecological savings. In our pilot trial alone, circulating 12 items diverted 178 kg of CO₂ and conserved nearly 30,000 litres of virtual water."*

---

## SLIDE 8: Admin & Community Moderation Console
- **Dedicated Route**: `/admin` (Protected by `requireAuth` + `requireAdmin` middleware).
- **Core Capabilities**:
  - **Executive KPI Dashboard**: Real-time counters of active users, items, and pending flags.
  - **Reports Queue**: One-click **Resolve** or **Dismiss** on member safety reports.
  - **User Governance**: One-click **Suspend / Reactivate** toggles.
  - **Listing Moderation**: Quarantine/Flag spam or restore genuine goods.
  - **Immutable Audit Trail**: Chronological ledger of all moderator interventions.
- **Speaker Note**:
  > *"Administrators have full visibility into platform health, with immediate levers to freeze spam accounts or resolve reported disputes."*

---

## SLIDE 9: Testing & Quality Assurance
- **Automated Verification**: Contract-driven End-to-End suite (`server/test_e2e.ts`).
- **24 Test Cases Executed**:
  - Health check & security headers
  - Registration, login, and cookie verification
  - Multi-facet catalog search & filtering
  - Purchase offer lifecycle & self-buy prevention
  - Duplicate review prevention & rating calculation
  - WebSocket notification delivery
  - Admin permission walls (403 verification)
- **Result**: **24 Passed, 0 Failed (100% Pass Rate, 0 TypeScript Errors)**.
- **Speaker Note**:
  > *"We built an automated test runner that validates all 24 critical user journeys. All tests pass with zero compiler warnings."*

---

## SLIDE 10: Live Demonstration Walkthrough
- **Demonstration Flow**:
  1. *Landing Page*: Hyperlocal Davanagere hero, category cards, verified impact banner.
  2. *Marketplace*: Filter Casio fx-991ES by BIET Campus, view condition, and check rental terms.
  3. *Handover Request*: Send purchase offer $\rightarrow$ Seller accepts $\rightarrow$ Status update in real time.
  4. *UPI Handover Payment*: Generate live Bharat QR code for on-spot settlement.
  5. *Trust Review*: Rate seller 5 stars; watch dynamic rating update.
  6. *Sustainability Dashboard*: View updated campus CO₂ diversion scorecard.
  7. *Admin Console*: Inspect moderation logs and user management.

---

## SLIDE 11: Societal Relevance & Alignment
- **UN Sustainable Development Goals (SDGs)**:
  - **SDG 12**: Responsible Consumption & Production.
  - **SDG 11**: Sustainable Cities & Communities.
  - **SDG 13**: Climate Action.
- **Local Economic Impact**:
  - Average student savings of ₹3,000 – ₹5,000 per academic year.
  - Promotes neighbor-to-neighbor solidarity and community safety in Davanagere.

---

## SLIDE 12: Future Roadmap
1. **IoT Smart Campus Lockers**: QR-activated lockers for 24/7 key drop-offs and textbook handovers without scheduling conflicts.
2. **AI Visual Condition Assessment**: Deep learning model to grade pre-owned items (Mint, Good, Fair) directly from uploaded smartphone photos.
3. **VTU Inter-College Network**: Scale to Kuvempu University, Shivamogga, and BDT College hubs.

---

## SLIDE 13: Live Deployment & Repository
- **GitHub Repository**: [https://github.com/shreyasMH26/reloop](https://github.com/shreyasMH26/reloop)
- **Live Deployed Application**: [https://shreyasmh26.github.io/reloop/](https://shreyasmh26.github.io/reloop/)
- **Production Artifacts**: `Dockerfile` and `render.yaml` ready for instant cloud deployment.

---

## SLIDE 14: Conclusion & Key Takeaways
- ReLoop proves that software engineering can directly impact community resilience and waste reduction.
- Built as a production-grade application, not a toy CRUD project.
- Ready for immediate campus adoption at BIET and Davanagere institutions.

---

## SLIDE 15: Q&A / Evaluation
- *"Thank you, respected evaluators. We are now open for questions, demonstration walkthrough, and feedback."*
