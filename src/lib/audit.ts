import { v4 as uuidv4 } from 'uuid';
import dbConnect from './db';
import AuditLog from '@/models/AuditLog';

// Types for the Log Payload
interface LogPayload {
    actor: {
        id: string;
        email: string;
        role: string;
        ip?: string;
        user_agent?: string;
    };
    action: {
        type: string;
        description: string;
    };
    resource?: {
        type: string;
        id: string;
    };
    metadata?: {
        changes?: Record<string, any>;
        reason?: string;
        is_impersonation?: boolean;
    };
    status?: 'SUCCESS' | 'FAILURE' | 'DENIED';
    severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}

export class AuditService {
    /**
     * Write a structured log entry to the database.
     */
    static async log(payload: LogPayload) {
        try {
            await dbConnect();

            const event_id = uuidv4();

            // Auto-Detect Severity High-Level Logic
            let severity = payload.severity || 'INFO';

            // 1. Critical Actions
            if (payload.action.type.includes('DELETE') && payload.resource?.type === 'Business') {
                severity = 'CRITICAL';
            }
            if (payload.action.type === 'USER_ROLE_CHANGE' && payload.metadata?.changes?.role === 'admin') {
                severity = 'CRITICAL';
            }

            // 2. Warnings
            if (payload.status === 'FAILURE' || payload.status === 'DENIED') {
                severity = 'WARNING';
            }

            await AuditLog.create({
                event_id,
                ...payload,
                severity,
            });

            // TODO: In a real production environment, you might also push this 
            // to an external immutable ledger (e.g. AWS CloudWatch / Datadog) here.

        } catch (error) {
            // Fallback: We don't want audit logging failures to crash the main app flow,
            // but we MUST know about them. console.error is the bare minimum.
            console.error("AUDIT_LOG_FAILURE: Failed to write log", error);
        }
    }

    /**
     * Helper to Calculate Field-Level Diffs (Before -> After)
     */
    static diff(before: any, after: any): Record<string, string> {
        const changes: Record<string, string> = {};

        const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

        allKeys.forEach(key => {
            const valBefore = before?.[key];
            const valAfter = after?.[key];

            // Simple strict equality check
            if (JSON.stringify(valBefore) !== JSON.stringify(valAfter)) {
                changes[key] = `${valBefore} -> ${valAfter}`;
            }
        });

        return changes;
    }
}
