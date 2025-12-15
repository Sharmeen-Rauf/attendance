# 👥 Employee-Specific Timings Configuration

## Employee List

1. **Muhammad Umar** (ID: MUH001)
   - Timing: Flexible start (must complete 8 hours)
   - Break: 30 min namaz + 60 min lunch (total 90 min)

2. **Muhammad Hassan** (ID: MUH002)
   - Timing: 1:00 PM - 9:00 PM (fixed)
   - Break: 30 min namaz + 60 min lunch (total 90 min)

3. **Muhammad Hamdan** (ID: MUH003)
   - Timing: 5:00 PM - 1:00 AM (next day, fixed)
   - Break: 30 min namaz + 60 min lunch (total 90 min)

4. **Sharmeen Rauf** (ID: SHA001)
   - Timing: Flexible start (must complete 8 hours)
   - Break: 30 min namaz + 60 min lunch (total 90 min)

5. **Rabia** (ID: RAB001)
   - Timing: 1:00 PM - 9:00 PM (fixed)
   - Break: 30 min namaz + 60 min lunch (total 90 min)

## Break System

### Break Rules:
- **Namaz Break**: 30 minutes (fixed)
- **Lunch Break**: 60 minutes (employee's choice when to take)
- **Total Break**: Maximum 90 minutes per day
- **Break Flexibility**: Employees can take lunch break anytime during their shift

### How It Works:
1. Employee clicks **Break-In** when starting break (for namaz or lunch)
2. Employee clicks **Break-Out** when returning
3. System calculates total break duration
4. If break exceeds 90 minutes, it's flagged in reports (but still allowed)

## Flexible Hours (Umar & Sharmeen)

- Can check in at any time
- Must complete 8 working hours (excluding break time)
- System calculates expected checkout time based on check-in + 8 hours + break time
- No late penalty for flexible start employees

## Fixed Hours (Hassan, Hamdan, Rabia)

- Must check in at specified start time
- 10-minute grace period after start time
- Late detection:
  - 🟢 **On Time**: Before or at start time
  - 🟡 **Grace**: Within 10 minutes of start time
  - 🔴 **Late**: More than 10 minutes after start time

## Configuration File

All employee timings are configured in `lib/employeeConfig.ts`. To modify:

1. Open `lib/employeeConfig.ts`
2. Update the `EMPLOYEE_CONFIGS` object
3. Adjust timings, break rules, or add new employees

## Database

After deploying, seed employees by visiting:
```
https://your-app.vercel.app/api/employees/seed
```

This will create all 5 employees with their IDs.

## Admin Dashboard

The admin dashboard shows:
- Employee-specific timings
- Late entries (for fixed-hour employees)
- Break duration tracking
- Flexible hour completion status

---

**All timings are now configured and ready to use! 🎉**

