# Database Seed Data

## Sample Case Laws

Here are some sample case laws you can add through the Admin Panel once logged in as a Partner:

### Case Law 1 - Beginner
- **Title**: Introduction to Audit Assertions
- **Category**: Audit Fundamentals
- **Difficulty**: Beginner
- **XP Reward**: 50
- **Facts**: An auditor is reviewing financial statements and needs to verify that all transactions are properly recorded.
- **Question**: Which assertion relates to ensuring that all transactions that should be recorded have been recorded?
- **Options**:
  - Existence
  - Completeness
  - Accuracy
  - Classification
- **Correct Answer**: Completeness
- **Explanation**: The completeness assertion ensures that all transactions and accounts that should be presented in the financial statements are included. It addresses the risk that some transactions may have been omitted.

### Case Law 2 - Intermediate
- **Title**: Revenue Recognition Principle
- **Category**: Accounting Standards
- **Difficulty**: Intermediate
- **XP Reward**: 100
- **Facts**: A company sells goods with a right of return policy. The customer has 30 days to return the goods for a full refund.
- **Question**: When should the company recognize revenue from this transaction?
- **Options**:
  - At the time of sale
  - After 30 days when return period expires
  - When cash is received
  - When goods are shipped
- **Correct Answer**: After 30 days when return period expires
- **Explanation**: Under IFRS 15 and ASC 606, revenue should be recognized when it is probable that it will not be reversed. With a return policy, revenue recognition should be deferred until the return period expires or adequate provisions for returns are made.

### Case Law 3 - Pro
- **Title**: Complex Lease Accounting
- **Category**: Financial Reporting
- **Difficulty**: Pro
- **XP Reward**: 150
- **Facts**: A company enters into a 10-year lease agreement with annual payments of ₹1,000,000. The implicit rate in the lease is 8% and the fair value of the asset is ₹7,500,000.
- **Question**: How should this lease be classified under Ind AS 116?
- **Options**:
  - Operating lease because implicit rate is known
  - Finance lease because lease term is for major part of asset's economic life
  - Short-term lease because payments are annual
  - Service contract not a lease
- **Correct Answer**: Finance lease because lease term is for major part of asset's economic life
- **Explanation**: Under Ind AS 116, a lease is classified as a finance lease if the lease term is for the major part of the economic life of the asset. A 10-year lease typically represents a substantial portion of most assets' useful lives, indicating transfer of substantially all risks and rewards.

## How to Add Data

1. **Sign up or log in** to the platform
2. **Complete onboarding** and select "Partner" as your role
3. **Navigate to Admin Dashboard** (should appear in sidebar for Partners)
4. **Click on Content Management tab**
5. **Click "Add New" button**
6. **Fill in the form** with the data above
7. **Save** and the content will be live immediately

## Testing the XP System

Once you have data in the system:

1. **Create a Student account** or switch to student role
2. **Navigate to Case Law Simulations**
3. **Complete a case law challenge**
4. **Watch your XP increase** in real-time
5. **Check the Leaderboard** to see your ranking
6. **View your Profile** to see updated statistics

## Important Notes

- XP is automatically awarded when activities are completed
- Correct answers give full XP, incorrect answers give 30% XP
- Leaderboard updates in real-time based on weekly activity
- Badges are automatically awarded when XP thresholds are reached
- All data persists in Supabase database
