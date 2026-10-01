# Polls Application Implementation Plan

A feature-rich polling and voting platform supporting Standard Polls and Instant-Runoff Voting (IRV), anonymous voting, custom option creation, round-by-round elimination visualizer, permission-based moderation, and a multi-role switcher.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your preferences, the application will be pre-loaded with **Software engineering team polls** and will feature a **Multi-role switcher (Admin, Member, Anonymous)** to test permissions, anonymity sanitization, and moderation tools.

- **Confirmed Decision 1**: Pre-load rich engineering team polls (e.g., Q3 Architecture Migration Preference, Next Sprint Tech Stack Selection, Remote vs Hybrid Policy).
- **Confirmed Decision 2**: Interactive multi-role switcher in the top navigation bar to instantly toggle between `Instance Admin` (full audit & unmasked voter lists), `Team Member` (voting & custom option creation), and `Anonymous Visitor` (restricted/anonymous voting).

---

## 1. Overview & Core Concept

- **What It Does**: Enables teams and communities to create standard polls or ranked-choice voting polls (IRV), vote with ordinal rank badges (1st, 2nd, 3rd), submit custom options (if permitted), and explore round-by-round elimination snapshots with animated playback.
- **Target Audience / Persona**: Engineering leads, community managers, product squads, and team members requiring democratic consensus tools.
- **Key Value**: Transparent multi-round voting math, instant aggregation, context-aware anonymity protection, and audit capabilities.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Browse & Filter Polls**: View active, closed, and draft polls with search, status filters (`All`, `Active`, `Closed`, `Ranked`), and create new poll modal.
  2. **Voting Flow**:
     - *Standard Polls*: Click option to vote instantly with live percentage bars and voter avatars (respecting anonymity).
     - *Ranked Choice (IRV)*: Click options sequentially to assign ordinal rank badges (1st, 2nd, 3rd). Double-click or click badge to remove/reorder ranks, then submit ballot.
  3. **Results & Round-by-Round Playback**:
     - Standard: Vote counts, percentages, and voters by option (masked as Anonymous when `is_anonymous` is true and role is not Admin).
     - IRV: Interactive round-by-round elimination step player (Round 1 vote distribution $\rightarrow$ elimination of lowest candidate $\rightarrow$ transfer of preferences $\rightarrow$ final winner).
  4. **Admin & Moderation**: Admin view showing unmasked voter breakdowns, audit logs, option deletion, and poll expiration overrides.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Professional, high-density SaaS dashboard with neutral slate palette (`#0F172A`), cool gray structural surfaces, and cobalt accent (`#3B82F6`).
  - *Typography*: Clean sans-serif (`Plus Jakarta Sans`), tabular numerals (`font-mono tabular-nums`) for vote percentages and counts.
  - *Design System*: Flat cards with hairline borders (`border border-neutral-800`), crisp micro-interactions, no generic AI badge clutter, and zero-pill metadata representation.

---

## 3. Key Product Decisions & Architecture

- **Decision 1: Client-Side Simulation with Persistent Storage**:
  - *Chosen Approach*: Implement a robust React state model backed by `localStorage` persistence and a mock backend API service (`src/services/pollService.ts`) providing full support for poll creation, voting, IRV calculation, and anonymity sanitization.
  - *Why*: Delivers instant responsiveness, offline resilience, and full interactivity in the preview environment without requiring external database provisioning.
- **Decision 2: Instant-Runoff Voting (IRV) Algorithm Module**:
  - *Chosen Approach*: Port the exact IRV algorithm requested in Phase 2 into `src/utils/irvService.ts` with round-by-round snapshot capture, majority threshold calculation ($>50\%$), tie handling, and elimination logic.
  - *Why*: Ensures mathematically accurate ranked-choice results with step-by-step playback.

---

## 4. Technical Architecture & Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                       App.tsx (Root)                        │
│   - Multi-Role Switcher (Admin / Member / Anonymous)        │
│   - Navigation Header & Toast Notifier                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐                ┌──────────────────────────────┐
│        PollsDashboard        │                │       CreatePollModal        │
│   - Filter & Search          │                │   - Standard vs IRV toggle   │
│   - Active / Closed Tabs     │                │   - Anonymity & Custom opts  │
└──────┬───────────────────────┘                └──────────────────────────────┘
       │
       ├─────────────────────────┐
       ▼                         ▼
┌───────────────────┐     ┌───────────────────┐
│     PollCard      │     │  PollResultsView  │
│  - Click options  │     │  - Standard bars  │
│  - Ordinal badges │     │  - IRV Playback   │
│  - Submit votes   │     │  - Admin audit    │
└───────────────────┘     └───────────────────┘
```

- **Data Models**:
  - `Poll`: `id`, `messageId`, `creatorId`, `title`, `isRanked`, `isAnonymous`, `allowCustomOptions`, `maxOptionsLimit`, `expiresAt`, `createdAt`, `status` (`active` | `closed`).
  - `PollOption`: `id`, `pollId`, `creatorId`, `textContent`, `attachmentUrl`.
  - `PollVote`: `id`, `pollId`, `userId`, `optionId`, `rank`.
  - `User`: `id`, `name`, `role` (`INSTANCE_ADMIN` | `MEMBER` | `ANONYMOUS`), `avatar`.
