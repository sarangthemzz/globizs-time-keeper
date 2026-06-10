# Testing Guide - Globizs Application

## 🧪 Complete Testing Checklist

Use this guide to verify all features work correctly.

---

## ✅ Pre-Test Setup

```bash
# Ensure you're in the project directory
cd d:\Globizs\GlobizsSushil01\Globizs01

# Verify database exists
ls dev.db  # Should show the database file

# Start dev server
npm run dev

# Open http://localhost:3000
```

**Expected Result:** Landing page with login form

---

## 🔐 Authentication Testing

### Test 1: Valid Login
**Steps:**
1. Enter email: `demo@example.com`
2. Enter password: `password123`
3. Click "Sign In"

**Expected Result:**
- ✅ Redirected to `/dashboard`
- ✅ Success toast notification
- ✅ Dashboard loads with schedules

**If Fails:**
- Check browser console for errors
- Verify `.env` file has DATABASE_URL
- Run: `npm run db:seed`

---

### Test 2: Invalid Email/Phone
**Steps:**
1. Enter email: `invalid@test.com`
2. Enter any password
3. Click "Sign In"

**Expected Result:**
- ✅ Error toast: "User not found"
- ✅ Stay on login page
- ✅ Form not cleared (for UX)

---

### Test 3: Invalid Password
**Steps:**
1. Enter email: `demo@example.com`
2. Enter password: `wrongpassword`
3. Click "Sign In"

**Expected Result:**
- ✅ Error toast: "Invalid password"
- ✅ Stay on login page

---

### Test 4: Empty Fields
**Steps:**
1. Leave email empty
2. Leave password empty
3. Click "Sign In"

**Expected Result:**
- ✅ Error toast: "Please fill in all fields"
- ✅ Form not submitted

---

### Test 5: Session Persistence
**Steps:**
1. Login successfully
2. Close browser completely
3. Reopen and navigate to http://localhost:3000

**Expected Result:**
- ✅ Dashboard still loaded (30-day session)
- ✅ No need to login again

---

## 📅 Date Selector Testing

### Test 6: Open Date Picker
**Steps:**
1. Ensure logged in on dashboard
2. Click on date selector button showing current date
3. Verify calendar opens

**Expected Result:**
- ✅ Calendar popup appears
- ✅ Current date is highlighted
- ✅ Can see month navigation arrows

---

### Test 7: Select Future Date
**Steps:**
1. In calendar, click any future date (e.g., June 15)
2. Verify date selector updates

**Expected Result:**
- ✅ Calendar closes
- ✅ Date button shows selected date: "June 15, 2026"
- ✅ Time slots are for that date

---

### Test 8: Date Picker Prev/Next
**Steps:**
1. Open date picker
2. Click next month arrow
3. Verify month changes
4. Click previous month arrow
5. Verify month changes back

**Expected Result:**
- ✅ Navigation works
- ✅ Dates update correctly

---

## ⏰ Time Slot Builder Testing

### Test 9: Initial Time Slot
**Steps:**
1. Check first row of time slots
2. Verify start time is 09:00 AM

**Expected Result:**
- ✅ Start time field shows: "09:00 AM"
- ✅ Start time field is disabled/read-only
- ✅ End time field is empty

---

### Test 10: Enter Valid End Time
**Steps:**
1. Click end time field for first row
2. Type: `10:00 AM`
3. Press Tab or click elsewhere

**Expected Result:**
- ✅ End time displays: "10:00 AM"
- ✅ New row automatically appears
- ✅ New row start time: "10:00 AM" (auto-filled)
- ✅ New row end time: empty

---

### Test 11: Build Multiple Slots
**Steps:**
1. First row - enter: 10:00 AM
2. Second row - enter: 11:30 AM
3. Third row - enter: 1:00 PM (or 13:00)

**Expected Result:**
- ✅ Each new row auto-creates
- ✅ Start times chain correctly:
  - Row 1: 09:00 → 10:00
  - Row 2: 10:00 → 11:30
  - Row 3: 11:30 → 13:00
- ✅ Ready for 4th row

---

### Test 12: Invalid Time Format
**Steps:**
1. Enter end time: `invalid text`
2. Press Tab

**Expected Result:**
- ✅ Error toast: "Invalid time format. Use HH:MM AM/PM"
- ✅ Field clears
- ✅ No new row created

---

### Test 13: End Time Before Start Time
**Steps:**
1. Row has start: 09:00 AM
2. Enter end time: 08:00 AM
3. Press Tab

**Expected Result:**
- ✅ Error toast: "End time must be after start time"
- ✅ Field clears
- ✅ No new row created

---

### Test 14: Delete Time Slot
**Steps:**
1. Click X button on any row (except first with only start time)
2. Verify row is removed

**Expected Result:**
- ✅ Row removed from list
- ✅ Remaining rows intact
- ✅ If last row with values, new empty row appears

---

### Test 15: Various Time Formats
**Steps:**
1. Try entering:
   - `10:30 AM` ✓
   - `2:45 PM` ✓
   - `12:00 PM` ✓
   - `12:00 AM` ✓
   - `9:15 am` (lowercase) ✓

**Expected Result:**
- ✅ All formats accepted and normalized

---

## 💾 Schedule Submission Testing

### Test 16: Submit Valid Schedule
**Steps:**
1. Create time slots (e.g., 09:00→10:00, 10:00→11:00)
2. Click "Submit Schedule" button
3. Wait for response

**Expected Result:**
- ✅ Success toast: "Schedule submitted successfully!"
- ✅ Form resets to initial state
- ✅ Time slots cleared (ready for new schedule)

---

### Test 17: Submit Without Complete Slots
**Steps:**
1. Enter start time 09:00 AM (auto-filled)
2. DON'T enter end time
3. Click "Submit Schedule"

**Expected Result:**
- ✅ Error toast: "Please fill all time slots before submitting"
- ✅ Schedule not submitted
- ✅ Form remains as-is

---

### Test 18: Submit Button Disabled State
**Steps:**
1. Have incomplete time slots
2. Observe submit button

**Expected Result:**
- ✅ Button appears disabled/grayed out
- ✅ Button can't be clicked

---

## 📋 History Modal Testing

### Test 19: Open History
**Steps:**
1. In sidebar, click "View History" button
2. Wait for modal to load

**Expected Result:**
- ✅ Modal opens with overlay
- ✅ Modal title: "Schedule History"
- ✅ Shows list of submitted schedules
- ✅ Each entry shows:
  - Selected date (e.g., "June 4, 2026")
  - Submission time
  - Time slots with ranges

---

### Test 20: Search by Date
**Steps:**
1. Open History modal
2. In search box, type: `June`
3. Observe filtered results

**Expected Result:**
- ✅ List filters to show only June schedules
- ✅ Search is case-insensitive
- ✅ Instant filtering (no submit needed)

---

### Test 21: Clear Search
**Steps:**
1. Have search text in history modal
2. Clear the search box
3. Verify all schedules show

**Expected Result:**
- ✅ All schedules visible again
- ✅ List not limited

---

### Test 22: History Modal Sorting
**Steps:**
1. Open history modal
2. Observe order of schedules

**Expected Result:**
- ✅ Sorted newest first (most recent submission first)
- ✅ Timestamps shown correctly

---

### Test 23: Close History Modal
**Steps:**
1. Open history modal
2. Click X button in top right
3. Or click outside modal
4. Or press Escape key

**Expected Result:**
- ✅ Modal closes
- ✅ Overlay disappears
- ✅ Back on dashboard

---

### Test 24: Empty History
**Steps:**
1. If no schedules submitted:
2. Open History modal

**Expected Result:**
- ✅ Shows "No schedules found"
- ✅ Calendar icon displayed
- ✅ No error message

---

## 🔓 Sign Out Testing

### Test 25: Sign Out Button
**Steps:**
1. In dashboard header, click "Sign Out" button
2. Wait for redirect

**Expected Result:**
- ✅ Redirected to login page
- ✅ Session cleared
- ✅ Must login again to access dashboard

---

### Test 26: Protected Route
**Steps:**
1. Sign out
2. Try to access: http://localhost:3000/dashboard
3. Observe redirect

**Expected Result:**
- ✅ Automatically redirected to login
- ✅ Can't access dashboard without auth

---

## 📱 Responsive Design Testing

### Test 27: Mobile View
**Steps:**
1. Press F12 to open DevTools
2. Click device toolbar icon
3. Select iPhone 12 (390px)
4. Test all features

**Expected Result:**
- ✅ Layout adapts to narrow screen
- ✅ Single column layout
- ✅ Buttons still clickable
- ✅ Text readable
- ✅ No horizontal scroll

---

### Test 28: Tablet View
**Steps:**
1. In DevTools, select iPad (820px)
2. Test functionality

**Expected Result:**
- ✅ Intermediate layout
- ✅ All features accessible
- ✅ Responsive design works

---

### Test 29: Desktop View
**Steps:**
1. In DevTools, select "Responsive" preset
2. Set width: 1920px
3. Verify 30/70 split visible

**Expected Result:**
- ✅ Sidebar 30% width on left
- ✅ Main content 70% width on right
- ✅ Professional layout

---

## 🎨 UI/UX Testing

### Test 30: Notifications
**Steps:**
1. Trigger various actions
2. Observe toast notifications:
   - Successful login
   - Successful submission
   - Error messages
   - Validation errors

**Expected Result:**
- ✅ Toasts appear in top center
- ✅ Auto-dismiss after 3-5 seconds
- ✅ Clear readable messages

---

### Test 31: Loading States
**Steps:**
1. Submit a schedule
2. Observe button during submission

**Expected Result:**
- ✅ Button shows loading text
- ✅ Button disabled during request
- ✅ Prevents double-submission

---

### Test 32: Form Validation
**Steps:**
1. Test various invalid inputs
2. Observe error handling

**Expected Result:**
- ✅ Errors displayed immediately
- ✅ Form doesn't submit
- ✅ User can correct and retry

---

## 🗄️ Database Testing

### Test 33: Verify Data Persistence
**Steps:**
1. Submit a schedule
2. Refresh page (F5)
3. Open History modal

**Expected Result:**
- ✅ Schedule still visible in history
- ✅ Data persisted to database

---

### Test 34: Check Database
**Steps:**
1. Run: `npm run db:studio`
2. Explore tables in browser
3. Check schedules and time slots

**Expected Result:**
- ✅ Prisma Studio opens at http://localhost:5555
- ✅ Can see all tables
- ✅ Data visible in database

---

## ⚡ Performance Testing

### Test 35: Quick Actions
**Steps:**
1. Login - should be instant
2. Navigate - should be fast
3. Submit schedule - should respond < 1 second

**Expected Result:**
- ✅ No noticeable delays
- ✅ Smooth interactions
- ✅ Good performance

---

## 🔍 Browser Console Testing

### Test 36: Console Errors
**Steps:**
1. Press F12 to open DevTools
2. Click "Console" tab
3. Perform all actions
4. Look for red errors

**Expected Result:**
- ✅ No console errors
- ✅ Might see warnings (acceptable)
- ✅ No undefined references

---

## 📊 Test Summary Template

```
Testing Date: June 4, 2026
Tester Name: [Your Name]

Authentication Tests:
  ✅ Test 1: Valid Login
  ✅ Test 2: Invalid Email
  ✅ Test 3: Invalid Password
  ✅ Test 4: Empty Fields
  ✅ Test 5: Session Persistence

Date Selector Tests:
  ✅ Test 6: Open Date Picker
  ✅ Test 7: Select Future Date
  ✅ Test 8: Date Navigation

Time Slot Tests:
  ✅ Test 9-15: Time slot creation
  ✅ Test 16-18: Schedule submission

History Tests:
  ✅ Test 19-24: History modal

Sign Out Tests:
  ✅ Test 25-26: Sign out & protection

Responsive Tests:
  ✅ Test 27-29: All breakpoints

Overall: ✅ ALL TESTS PASSED
```

---

## 🐛 If Tests Fail

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't login | Run `npm run db:seed` to recreate demo account |
| 404 errors | Clear .next folder: `rm -rf .next` |
| Styles broken | Run `npm run dev` again, clear cache |
| Database errors | Reset: `rm dev.db*` then `npm run db:push` |
| Timeouts | Check server logs, may need restart |

---

## ✅ Testing Complete!

If all 36 tests pass:

🎉 **Your Globizs application is production-ready!**

---

**Happy testing! 🚀**
