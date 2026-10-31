# Test Plan: Account Management System

This test plan covers the business logic of the COBOL accounting system so the Node.js version can be validated against it. The balance starts at 1000.00 in every session.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | View the initial balance | Application just started | 1. Choose option 1 (View Balance) | Displays "Current balance: 001000.00" | | | |
| TC-002 | Credit the account | Balance is 1000.00 | 1. Choose option 2 (Credit Account)<br>2. Enter 250.50 | Displays "Amount credited. New balance: 001250.50" | | | |
| TC-003 | Debit the account | Balance is 1000.00 | 1. Choose option 3 (Debit Account)<br>2. Enter 400.00 | Displays "Amount debited. New balance: 000600.00" | | | |
| TC-004 | Debit with insufficient funds | Balance is 1000.00 | 1. Choose option 3 (Debit Account)<br>2. Enter 1500.00 | Displays "Insufficient funds for this debit." and the balance stays 1000.00 | | | |
| TC-005 | Debit the exact balance | Balance is 1000.00 | 1. Choose option 3 (Debit Account)<br>2. Enter 1000.00 | Debit succeeds and the new balance is 000000.00 | | | |
| TC-006 | Balance persists across operations | Balance is 1000.00 | 1. Credit 100.00<br>2. Debit 50.00<br>3. Choose option 1 (View Balance) | Displays a balance of 001050.00 | | | |
| TC-007 | Invalid menu choice | Application just started | 1. Enter 7 at the menu prompt | Displays "Invalid choice, please select 1-4." and the menu is shown again | | | |
| TC-008 | Exit the application | Application just started | 1. Choose option 4 (Exit) | Displays "Exiting the program. Goodbye!" and the program ends | | | |
| TC-009 | Balance resets after restart | A credit of 500.00 was made and the app was closed | 1. Start the application again<br>2. Choose option 1 (View Balance) | Displays "Current balance: 001000.00" because the balance is not saved to disk | | | |
| TC-010 | Credit of zero | Balance is 1000.00 | 1. Choose option 2 (Credit Account)<br>2. Enter 0 | The balance is unchanged at 001000.00 | | | |
