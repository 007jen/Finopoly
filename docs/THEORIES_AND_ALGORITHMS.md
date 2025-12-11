# Terms, Theories, and Algorithms Documentation

This document outlines the theoretical frameworks, domain-specific terminology, and computer science algorithms applied in the Finopoly codebase.

## 1. Data Structures & Algorithms (DSA)

The application utilizes several fundamental algorithms to manage data presentation and user interaction effectively.

### **A. Sorting Algorithms**
*   **Application**: Leaderboard Ranking
*   **File**: `src/components/leaderboard/Leaderboard.tsx` & `src/data/mockData.ts`
*   **Mechanism**: The leaderboard relies on sorting users based on their Experience Points (XP) in descending order to determine rank.
    *   *Implementation*: `Array.prototype.sort((a, b) => b.xp - a.xp)` (Conceptually applied before slicing).
    *   *Usage*: The top 3 users are extracted using `.slice(0, 3)` for the podium display, while the rest are rendered in a table.

### **B. Filtering Algorithms**
*   **Application**: User Management & Search
*   **File**: `src/components/admin/UserManagement.tsx`
*   **Mechanism**: Multi-criteria filtering to refine user lists based on search input and dropdown selections.
    *   *Implementation*:
        ```typescript
        const filteredUsers = users.filter(user => {
            const matchesSearch = user.name.includes(query) || user.email.includes(query);
            const matchesRole = role === 'All' || user.role === role;
            const matchesStatus = status === 'All' || user.status === status;
            return matchesSearch && matchesRole && matchesStatus;
        });
        ```
    *   *Complexity*: O(N) where N is the number of users.

### **C. Linear Search**
*   **Application**: Global Search Bar & User Lookup
*   **File**: `src/components/layout/TopBar.tsx`
*   **Mechanism**: A linear scan of text fields to match substrings for real-time search feedback.
    *   *Implementation*: String `includes()` or `indexOf()` methods within filter loops.

## 2. Gamification Theories

The project implements core gamification mechanics to drive user engagement and learning retention.

### **A. Progression & Mastery**
*   **Concept**: Users progress through defined stages of competency.
*   **Implementation**:
    *   **XP System**: `src/_xp/xp-service.ts` implements a linear progression accumulator.
    *   **Levels**: Users evolve from "Beginner" → "Intermediate" → "Pro" based on XP thresholds (e.g., Lvl 1 = 1000 XP).
    *   **Badges**: Fixed-ratio reinforcement rewards (e.g., "Audit Rookie") stored in `User.badges` (`src/types/index.ts`).

### **B. Social Comparison Theory**
*   **Concept**: Individuals evaluate their own opinions and abilities by comparing themselves to others.
*   **Implementation**:
    *   **Leaderboards**: Visual ranking of peers (Weekly XP, Rank Change labels like "+15").
    *   **Podium**: Distinct visual separation of the Top 3 performers to create aspirational goals.

### **C. Behavioral Reinforcement**
*   **Concept**: Encouraging repetition through positive feedback loops.
*   **Implementation**:
    *   **Daily Streaks**: Tracking consecutive logins (`User.dailyStreak`) to build daily learning habits.
    *   **Immediate Feedback**: Real-time XP updates in `TopBar.tsx` triggered via `window.dispatchEvent` events immediately after task completion.

## 3. Financial & Legal Methodologies

The content structure strictly adheres to professional accounting and legal standards.

### **A. Auditing Frameworks (ISA/Ind AS)**
*   **Assertions**: Content methodology tests specific assertions found in `mockData.ts`:
    *   *Existence*: "Does the asset physically exist?"
    *   *Completeness*: "Are all transactions recorded?"
    *   *Valuation*: "Is the asset recorded at correct fair value?"
*   **Procedures**: Simulation tasks require selecting correct procedures like "Physical Verification" or "Vouching".

### **B. Accounting Standards (Ind AS)**
*   **Revenue Recognition (Ind AS 115)**: Logic flows based on "Transfer of Control" vs "Transfer of Risk".
*   **Leases (Ind AS 116)**: Classification logic for Finance vs Operating leases based on asset useful life and present value calculations.

### **C. Case Law Analysis**
*   **Stare Decisis**: The app mimics the legal principle of precedent, where users must apply past court rulings (e.g., *CIT vs. Hindustan Coca Cola*) to new fact patterns to determine the correct outcome.

## 4. Future & Implicit Theories (Architecture Ready)

Based on the current type definitions (`src/types/index.ts`) and data structures, the system is architected to support these adavanced concepts:

### **A. Adaptive Learning**
*   **Concept**: Personalized content delivery based on learner performance.
*   **Implementation**: The `User.preferredAreas` field (`['Audit', 'Tax']`) provides the necessary data structure to filter and recommend specific case laws or simulations in future updates.

### **B. Professional Apprenticeship Model**
*   **Concept**: Learning through observation and guided practice.
*   **Implementation**: The distinct `role` separation between 'Partner' (Content Creator/Mentor) and 'Student' (Learner) mimics the real-world firm hierarchy, setting the stage for features where Partners review Student work.

### **C. Mock Verification**
*   **Concept**: Simulating the manual verification steps of an audit.
*   **Implementation**: The `Task` interface supports a `type: 'upload'` field, indicating readiness for features where users must upload 'verified' documents or evidence, moving beyond simple MCQ interactions.
