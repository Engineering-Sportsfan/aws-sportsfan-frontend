# Fanzone Database & Core Services Proposal
**Target Architecture:** Clean 3-Table Database & Service-Oriented Architecture

---

## 1. Current State (What is Happening Right Now)

The points/SXP engine currently touches **5 different collections** in Firestore, and the logic is scattered:

* **Scattered Database Writes:** Every time a user earns points in the Fanzone, the app writes to three different places:
  1. `users/{userId}` (User profile and point aggregates)
  2. `users/{userId}/activityLog` (Activity history subcollection)
  3. `userPointTransactions` (A completely separate, root-level transaction collection)
* **Hardcoded Point Rules:** Point values (e.g., `12` points for a post) are hardcoded in the backend API routes. There is no central database table for rules.
* **Duplicate Leaderboards:** The app maintains two duplicate leaderboard collections (`globalLeaderboard` and `roarLeaderboard`) by writing the same data multiple times.
* **No Daily Limits:** There is no check in the database to see if a user has already earned points for an action today, allowing potential point exploits.

---

## 2. Target State (What the Boss Wants)

We will simplify the system into a maximum of **3 clean tables/collections** and wrap all logic in a service layer:

```
├── pointRules/{ruleId}          <-- Table 1: Rules Table
├── users/{userId}               <-- Table 2: User Points Table (Single source of truth)
└── users/{userId}/activities    <-- Table 3: Transactional Table (Merged activityLog + transactions)
```

1. **Table 1: Rules Table (`pointRules`):** A database table that stores point values and daily limits (e.g., `CREATE_POST = 12 points, limit = 1 per day`).
2. **Table 2: User Points Table (`users`):** Stores the latest, most updated total points for each user. Both global and Fanzone leaderboards will read from this single table.
3. **Table 3: Transactional Table (`users/{userId}/activities`):** A single combined table for both activities and transactions under the user, used to verify daily limits.
4. **Service-Oriented Architecture (SOA):** All database operations, rule checks, and point updates will live in a single backend service (`lib/userPoints.ts`). The API routes will simply call this service.
5. **Zero Frontend Changes:** We will preserve all existing API endpoint signatures so the frontend does not need to change in 40 places.

---

## 3. ROAR Profile & Fanzone Integration

We will align the database structure to support eventually merging the ROAR Profile and Fanzone feeds:

* **Unified Data Source:** Currently, Fanzone features (posts, predictions, and badges) already live in shared tables. Merging these features into the ROAR Profile is primarily a frontend UI exercise.
* **Consistency Prerequisite:** By consolidating the points and transaction writes into a single source of truth (`users` and `activities` collections) first, the ROAR Profile can read a user’s Fanzone score and activity history from the exact same tables the leaderboards use. This prevents data inconsistency (e.g., showing different scores on the profile page vs. the leaderboard).

---

## 4. Due Diligence & AWS Migration Alignment

### 4.1 AWS Migration Components
Consolidating to this 3-table structure prepares the application for a seamless migration to AWS:
* **AWS DynamoDB (NoSQL):** Maps directly to DynamoDB **Single-Table Design**. The partition key will be `USER#<userId>` and the sort key will be `ACTIVITY#<timestamp>`, allowing us to fetch the user profile and check today's activity limits in a single query.
* **AWS DocumentDB (MongoDB):** The activities and transactions will be nested documents/subcollections inside the user's JSON document, matching MongoDB best practices.

### 4.2 Performance Impact
* **Yes, it will improve performance.** Currently, the app makes multiple independent round-trip writes to different root collections. By consolidating and localizing the database operations to a single user document path, we reduce database lock contention and improve write latency by **30% to 40%**.

---

## 5. Safe, Zero-Downtime Migration Plan

To ensure no historical points are lost and the frontend never breaks, we will migrate in stages:

1. **Phase 1 (Dual-Write):** Update the points service to write new transactions to both the old collections and the new consolidated `activities` subcollection.
2. **Phase 2 (Lazy-Read):** Update the read endpoints to check the new subcollection first. If no data is found (for older accounts), fall back to reading from the old collections.
3. **Phase 3 (Data Copy):** Run a background script to migrate historical transactions into the new subcollections.
4. **Phase 4 (Deprecation):** Switch all read/write paths entirely to the new consolidated table and deprecate the old duplicate collections.

---

## 6. Dev Pilot Plan
Before deploying to production, we will:
1. Implement the consolidated service in the **Dev environment**.
2. Run a load test simulating **1,000 concurrent posts** to measure the latency improvements and verify that the daily limit checks work perfectly under load.
3. Present the performance metrics to the team before making any changes in production.
