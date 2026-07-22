/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  StorageHealthReport,
  DataIntegrityReport,
  DataIntegrityIssue,
  DataRepairResult,
  BackupSnapshot
} from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { browserStorage } from '@/lib/storage/browser-storage';

export class DataIntegrityService {
  checkDataIntegrity(): DataIntegrityReport {
    const issues: DataIntegrityIssue[] = [];
    let recordsChecked = 0;

    if (typeof window === 'undefined') {
      return {
        checkedAt: new Date().toISOString(),
        totalRecordsChecked: 0,
        issues: [],
        healthScore: 100
      };
    }

    const vonkKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('vonk:v1:')) {
        vonkKeys.push(k);
      }
    }

    vonkKeys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      recordsChecked++;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const ids = new Set<string>();
          parsed.forEach((item, index) => {
            recordsChecked++;
            if (item && typeof item === 'object' && item.id) {
              if (ids.has(item.id)) {
                issues.push({
                  id: `issue-dup-${key}-${index}`,
                  key,
                  type: 'DUPLICATE_ID',
                  severity: 'MEDIUM',
                  description: `Duplicate record ID "${item.id}" detected in key "${key}".`,
                  recordId: item.id,
                  autoFixable: true
                });
              } else {
                ids.add(item.id);
              }
            }
          });
        }
      } catch {
        issues.push({
          id: `issue-corrupt-${key}`,
          key,
          type: 'CORRUPTED_JSON',
          severity: 'HIGH',
          description: `Key "${key}" contains corrupted non-JSON data.`,
          autoFixable: true
        });
      }
    });

    const healthScore = Math.max(0, 100 - issues.length * 10);

    return {
      checkedAt: new Date().toISOString(),
      totalRecordsChecked: recordsChecked,
      issues,
      healthScore
    };
  }

  repairSafeIssues(): DataRepairResult {
    const report = this.checkDataIntegrity();
    const logs: string[] = [];
    let fixedCount = 0;

    report.issues.forEach((issue) => {
      if (issue.type === 'CORRUPTED_JSON') {
        localStorage.removeItem(issue.key);
        logs.push(`Cleared corrupted key "${issue.key}".`);
        fixedCount++;
      } else if (issue.type === 'DUPLICATE_ID') {
        const raw = localStorage.getItem(issue.key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const seen = new Set<string>();
              const deduplicated = parsed.filter((item) => {
                if (!item || !item.id) return true;
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
              });
              browserStorage.setItem(issue.key, deduplicated);
              logs.push(`Deduplicated records in key "${issue.key}".`);
              fixedCount++;
            }
          } catch {
            // Ignore if parse fails
          }
        }
      }
    });

    const remaining = this.checkDataIntegrity().issues.length;

    return {
      repairedAt: new Date().toISOString(),
      fixedIssuesCount: fixedCount,
      remainingIssuesCount: remaining,
      logs
    };
  }

  getStorageHealth(): StorageHealthReport {
    let totalBytes = 0;
    let totalKeys = 0;

    if (typeof window === 'undefined') {
      return {
        schemaVersion: 'v1.0.0-demo',
        totalKeys: 0,
        totalEstimatedBytes: 0,
        corruptedKeysCount: 0,
        missingReferencesCount: 0,
        duplicateIdsCount: 0,
        lastCheckedAt: new Date().toISOString(),
        status: 'HEALTHY'
      };
    }

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('vonk:v1:')) {
        totalKeys++;
        const val = localStorage.getItem(k);
        if (val) totalBytes += val.length * 2;
      }
    }

    const report = this.checkDataIntegrity();
    const corrupted = report.issues.filter((i) => i.type === 'CORRUPTED_JSON').length;

    return {
      schemaVersion: 'v1.0.0-demo',
      totalKeys,
      totalEstimatedBytes: totalBytes,
      corruptedKeysCount: corrupted,
      missingReferencesCount: 0,
      duplicateIdsCount: report.issues.filter((i) => i.type === 'DUPLICATE_ID').length,
      lastCheckedAt: new Date().toISOString(),
      status: corrupted > 0 ? 'CORRUPTED' : report.issues.length > 0 ? 'WARNING' : 'HEALTHY'
    };
  }
}

export const dataIntegrityService = new DataIntegrityService();
