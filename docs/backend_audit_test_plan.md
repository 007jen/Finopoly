
# Backend Manual Test Plan

**Role:** Principal Backend QA Architect
**Scope:** Pre-production Backend Audit
**System:** Finopoly Backend (Day 2 Audit)

---

## 1️⃣ Test Matrix Overview

| Module | Endpoint | Role | Risk Level | Must Pass? |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `Clerk Middleware` | All | **CRITICAL** | ✅ YES |
| **Role Enforcement** | `Admin Routes` | Admin | **CRITICAL** | ✅ YES |
| **Case Explorer** | `/api/cases` | Public/Student | LOW | ✅ YES |
| **Case Submission** | `/api/cases/:id/submissions` | Student | **HIGH** | ✅ YES |
| **Case Review** | `/api/admin/case-submissions/...` | Admin | **CRITICAL** | ✅ YES |
| **Activity/XP** | `Background Events` | System | MEDIUM | ✅ YES |
| **Leaderboard** | `/api/leaderboard` | Public | MEDIUM | ✅ YES |
| **Admin Analytics** | `/api/admin/metrics` | Admin | LOW | ✅ YES |

---

## 2️⃣ Manual Test Cases (Core Requirement)

### TC-001: Fetch All Cases (Public)
**Test Case ID:** `TC-001`
**Title:** Verify Public Access to Case List
**Endpoint:** `GET /api/cases`
**HTTP Method:** `GET`
**Auth Required:** No (or Yes, depending on config) -> *Code check: Auth NOT required*
**Role Required:** None

**Preconditions:**
- At least one active `CaseLaw` exists in DB.

**Steps:**
1. Send `GET http://localhost:5000/api/cases` without headers.

**Expected HTTP Status:** `200 OK`
**Expected Response Body:**
- JSON Array of cases.
- Each object contains `id`, `title`, `category`, `difficulty`, `xpReward`.
- **NO** sensitive fields (e.g. `correctAnswer`).

**Failure Mode if Broken:** API returns 401/403 or empty array when cases exist.

---

### TC-002: Fetch Single Case Details
**Test Case ID:** `TC-002`
**Title:** Verify Specific Case Retrieval
**Endpoint:** `GET /api/cases/:id`
**HTTP Method:** `GET`
**Auth Required:** No
**Role Required:** None

**Preconditions:**
- Valid `caseId` from TC-001.

**Steps:**
1. Send `GET http://localhost:5000/api/cases/<VALID_ID>`

**Expected HTTP Status:** `200 OK`
**Expected Response Body:**
- JSON Object with `id`, `facts`, `question`, `options`.
- **CRITICAL:** Ensure `correctAnswer` is **NOT** present in the response.

**Failure Mode if Broken:** API exposes `correctAnswer` (Cheating risk).

---

### TC-003: Submit Case Answer (Student)
**Test Case ID:** `TC-003`
**Title:** Student Submits Valid Answer
**Endpoint:** `POST /api/cases/:id/submissions`
**HTTP Method:** `POST`
**Auth Required:** Yes
**Role Required:** Student

**Preconditions:**
- Valid User Token (Student role).
- Valid `caseId`.
- No prior submission for this user-case pair.

**Steps:**
1. Set Header: `Authorization: Bearer <STUDENT_TOKEN>`
2. Body:
   ```json
   { "answer": "This is a detailed analysis of the case law..." }
   ```
3. Send Request.

**Expected HTTP Status:** `201 Created`
**Expected Response Body:** `{"status": "submitted"}`
**Database Side Effect:** New `CaseSubmission` record created. `status` = 'pending'.

**Failure Mode if Broken:** 500 error or failure to save submission.

---

### TC-004: Admin Reviews Submission
**Test Case ID:** `TC-004`
**Title:** Admin Grades a Submission
**Endpoint:** `PATCH /api/admin/case-submissions/:submissionId/review`
**HTTP Method:** `PATCH`
**Auth Required:** Yes
**Role Required:** Admin

**Preconditions:**
- Valid Admin Token.
- Valid `submissionId` (pending status).

**Steps:**
1. Set Header: `Authorization: Bearer <ADMIN_TOKEN>`
2. Body:
   ```json
   { "score": 85, "feedback": "Great analysis." }
   ```
3. Send Request.

**Expected HTTP Status:** `200 OK`
**Expected Response Body:** `{"status": "success", "data": {...}}`
**Database Side Effect:** `CaseSubmission` updated: `status`='reviewed', `score`=85.

**Failure Mode if Broken:** 403 Forbidden (Role check failed) or 500 Error.

---

## 3️⃣ Security & Abuse Test Cases (CRITICAL)

### SA-001: Missing Authorization Header
**Test:** Access `POST /api/cases/:id/submissions` without `Authorization` header.
**Expected:** `401 Unauthorized`
**Why:** Prevents anonymous spam submissions.

### SA-002: Student Accessing Admin Review
**Test:** Login as **Student**, try to `PATCH /api/admin/case-submissions/:id/review`.
**Expected:** `403 Forbidden`
**Why:** Critical privilege escalation prevention. Students must not grade themselves.

### SA-003: Duplicate Case Submission
**Test:** Student submits answer for `Case A`. Then tries to submit for `Case A` again.
**Expected:** `409 Conflict` (Body: `{"error": "Already submitted"}`)
**Why:** Prevents spam and XP farming exploits.

### SA-004: Invalid Score Injection
**Test:** Admin submits review with `"score": 150` or `"score": -10`.
**Expected:** `400 Bad Request`
**Why:** Database integrity. Scores must be 0-100.

### SA-005: PII Leakage in Leaderboard
**Test:** `GET /api/leaderboard`. Check response for `email`, `clerkId`, or `phoneNumber`.
**Expected:** Response should ONLY contain `name`, `avatar`, `xp`, `rank`.
**Why:** Privacy violation if emails are exposed.

---

## 4️⃣ Negative & Edge Case Tests

### NC-001: Short Answer Submission
**Test:** Submit answer `"Too short"`.
**Expected:** `400 Bad Request` (Validation error: min length 10).

### NC-002: Reviewing Non-Existent Submission
**Test:** Admin reviews random UUID `00000000-0000-0000-0000-000000000000`.
**Expected:** `404 Not Found`.

### NC-003: Reviewing Already Reviewed Submission
**Test:** Admin attempts to review the same submission from TC-004 again.
**Expected:** `409 Conflict` (Body: `{"error": "Submission already reviewed"}`).

---

## 5️⃣ Transaction & Consistency Validation

### C-001: Submission Uniqueness
1. **Action:** Check DB `CaseSubmission` table.
2. **Verify:** There are no two rows with same `userId` and `caseId`.
3. **Method:** Database query or check Prisma unique constraint (`@@unique([caseId, userId])`).

### C-002: Activity Log Generation
*(Note: Activity logging wasn't explicitly added to the specific `submitCaseAnswer` controller logic in the provided snippets, verify if it exists via middleware or triggers. If missing, this is a GAP).*
**Test:** Submit a case.
**Check:** Is an `Activity` record created?

---

## 6️⃣ Risk Scoring Summary

| Area | Risk % | Justification |
| :--- | :--- | :--- |
| **Auth & Security** | 10% | Clerk is robust, but manual headers must be checked. |
| **Data Integrity** | 20% | Need to verify duplicate submission prevention holds up under load. |
| **Privilege Escalation** | 5% | `requiresAdmin` middleware is critical. |
| **Business Logic** | 15% | XP and Activity logging need careful verification. |

**Overall Risk:** **LOW/MEDIUM** (Pending Activity Logging verification)

---

## 7️⃣ Final Verdict

*(Select one after execution)*

- [ ] **PASS**
- [ ] **PASS WITH WARNINGS**
- [ ] **FAIL**

---

## 8️⃣ How Developer Should Execute Tests

**Recommended Tool:** Postman or Thunder Client (VS Code Extension).

**Execution Order:**
1. **Reset State:** Truncate `CaseSubmission` table if testing locally (or use new users).
2. **Setup:** Ensure at least 1 Admin user and 1 Student user exist in Clerk & DB.
3. **Run Public Tests:** TC-001, TC-002.
4. **Run Auth Tests:** SA-001.
5. **Run Student Flow:** TC-003, SA-003, NC-001.
6. **Run Admin Flow:** SA-002 (Fail attempt), TC-004 (Success), SA-004, NC-003.

**Logs to Watch:**
- `npm run dev` terminal output.
- Prisma query logs (if enabled).
