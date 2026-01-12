# Audit Log Engine Implementation Plan (Bized)

**Target**: Bized SaaS Platform (Next.js / MongoDB / NextAuth)
**Goal**: SOC 2 Type II Compliance Readiness
**Strategy**: Application-level logging via Mongoose with structured JSON schema and Anomaly Detection.

---

## 1. Data Mode (Schema Design)

We will create a dedicated MongoDB collection `audit_logs` to store immutable event records.

**File**: `src/models/AuditLog.ts`

```typescript
// Mongoose Schema Definition
{
  event_id: { type: String, required: true, unique: true }, // UUID
  actor: {
    id: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true }, // 'admin', 'user'
    ip: { type: String },
    user_agent: { type: String }
  },
  action: {
    type: { type: String, required: true }, // e.g., 'AUTH_LOGIN'
    description: { type: String }
  },
  resource: {
    type: { type: String }, // 'User', 'Business', 'System'
    id: { type: String }
  },
  metadata: {
    changes: { type: Map, of: String }, // For before/after diffs
    reason: { type: String }, // For admin override/impersonation
    is_impersonation: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['SUCCESS', 'FAILURE', 'DENIED'], default: 'SUCCESS' },
  severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
  timestamp: { type: Date, default: Date.now, expires: '90d' } // TTL Index for 90 days retention
}
```

---

## 2. Core Service Logic (`AuditService`)

We will implement a centralized service to handle log ingestion, anomaly detection, and database writing.

**File**: `src/lib/audit.ts`

**Key Features:**
*   **Async Logging**: `await AuditService.log(...)`
*   **Anomaly Detection Rules**:
    *   **Privilege Escalation**: If `action` is `USER_UPDATE` and `changes.role` becomes `admin` -> Set `severity: CRITICAL`.
    *   **Mass Deleletion**: High volume checks (future scope, simpler now).
    *   **Env Changes**: If settings are modified -> Set `severity: WARNING`.
*   **Impersonation Handling**: Explicitly flag sessions where `session.isImpersonated` is true.

---

## 3. Integration Points

We will instrument the following areas of the codebase to generate logs:

### A. Authentication (NextAuth)
*   **Login**: Log `AUTH_LOGIN` events in `signIn` callback.
*   **Failures**: Log failed attempts (if reachable) or critical errors.
*   **File**: `src/lib/auth.ts`

### B. Admin Actions
*   **User Management**: Log `USER_UPDATE`, `USER_DELETE` in `src/app/api/users/route.ts`.
*   **Business Management**: Log `BUSINESS_UPDATE` in business API routes.
*   **Settings**: Log `SYSTEM_SETTINGS_UPDATE` in `src/app/admin/settings/page.tsx` (via Server Action/API).

---

## 4. Execution Plan (Step-by-Step)

This is the immediate roadmap to execute this plan within the current codebase.

### Phase 1: Foundation (Infrastructure)
1.  **Create Model**: Implement `src/models/AuditLog.ts`.
2.  **Create Service**: Implement `src/lib/audit.ts` with helper functions (`log`, `diff`).
3.  **Secure Database**: Ensure MongoDB user has restricted permissions (handled via env/connection usually, but we will enforcement logic in app).

### Phase 2: Instrumentation (Data Collection)
1.  **Auth Integration**: Update `src/lib/auth.ts` to log logins.
2.  **API Integration**: Wrap the `users` API route to log admin accesses.
3.  **Settings Integration**: Update Admin Settings to log configuration changes.

### Phase 3: Visualization (Admin UI)
1.  **Logs Page**: Create `src/app/admin/audit/page.tsx`.
2.  **Table Component**: Display logs with filtering (Actor, Action, Severity).
3.  **Detail View**: Show JSON dump of "Before/After" changes.

---

## 5. Security & Compliance Notes
*   **Immutability**: Mongoose does not enforce WORM natively. Use MongoDB Atlas "Data Lake" or "Online Archive" features for true compliance in production.
*   **Retention**: The TTL index `expires: '90d'` automatically handles the "Active" retention policy.
*   **Access**: Only users with `role: 'admin'` can view the audit logs API.
