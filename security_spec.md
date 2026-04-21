# Security Specification - SalesMaster PRO

## Data Invariants
1. All data (settings and sales) must belong to the authenticated user.
2. Users can only read and write their own documents.
3. Sales status must be either 'Pendente' or 'Pago'.
4. Sales type must be either 'Presencial' or 'EAD'.

## The Dirty Dozen Payloads
1. Create a sale for another user.
2. Read settings of another user.
3. Update settings to remove the 'userId' field.
4. Create a sale with a 1MB client name string.
5. Create a sale with an invalid 'type' value.
6. Delete another user's sale.
7. Update settings to change the 'name' to an excessively long string.
8. Create a sale without a 'status' field.
9. Inject malicious scripts into 'clientName' field.
10. Update a sale belonging to another user.
11. List all sales across all users.
12. Create a settings document with a fake admin role field.

## Test Runner (Logic Outline)
All above payloads will be tested against the firestore.rules and must return PERMISSION_DENIED.
