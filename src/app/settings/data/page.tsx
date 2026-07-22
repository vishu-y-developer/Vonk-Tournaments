'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import SettingsShell from '@/components/settings/SettingsShell';
import { useDataManagement } from '@/hooks/useDataManagement';
import { Database, Download, Upload, Trash2, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DataStorageSettingsPage() {
  const { storageSummaries, exportDemoData, validateImportData, importDemoData, resetSelectedCategory, resetAllDemoData } = useDataManagement();

  const [importJson, setImportJson] = useState('');
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleExport = () => {
    const pkg = exportDemoData();
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vonk-tournaments-demo-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJson.trim()) {
      alert('Please paste valid JSON data to import.');
      return;
    }

    const val = validateImportData(importJson);
    if (!val.valid) {
      alert(`Import Validation Failed:\n${val.errors.join('\n')}`);
      return;
    }

    if (confirm(`Import valid VONK demo data containing ${val.categoriesCount} categories? Current browser data will be updated.`)) {
      const success = importDemoData(importJson);
      if (success) {
        alert('Demo data imported successfully!');
        setImportJson('');
        window.location.reload();
      } else {
        alert('Failed to import demo data.');
      }
    }
  };

  const handleFullReset = () => {
    if (resetConfirmInput !== 'RESET VONK') {
      alert('Confirmation text mismatch. Type "RESET VONK" exactly.');
      return;
    }

    resetAllDemoData();
    alert('All VONK demo data cleared from localStorage.');
    setShowResetModal(false);
    window.location.reload();
  };

  return (
    <SettingsShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-secondary" />
            Data & Local Storage Management
          </h1>
          <p className="text-xs text-muted">
            Inspect local storage allocation, export JSON data backups, restore datasets, or reset local demo state.
          </p>
        </div>

        {/* Action Tile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-5 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-foreground font-extrabold text-xs">
              <Download className="h-4 w-4 text-secondary" />
              <span>Export Local Demo Data</span>
            </div>
            <p className="text-xs text-muted">
              Download your complete local storage state (players, teams, tournaments, wallet ledger, tickets) as a JSON file.
            </p>
            <button
              onClick={handleExport}
              className="mt-2 py-2.5 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md glow-secondary"
            >
              <Download className="h-4 w-4" /> Download JSON Backup
            </button>
          </div>

          {/* Full Reset Trigger */}
          <div className="p-5 rounded-2xl border border-danger/30 bg-danger/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-danger font-extrabold text-xs">
              <AlertTriangle className="h-4 w-4 text-danger" />
              <span>Reset All Demo Data</span>
            </div>
            <p className="text-xs text-muted">
              Clear all VONK local storage keys and restore clean default seed state.
            </p>
            <button
              onClick={() => setShowResetModal(true)}
              className="mt-2 py-2.5 bg-danger/20 hover:bg-danger/30 border border-danger/40 text-danger font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Reset VONK Demo Storage
            </button>
          </div>
        </div>

        {/* Storage Summaries Table */}
        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
          <h3 className="text-xs font-extrabold uppercase text-foreground">Local Storage Allocation Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border/50 text-[10px] uppercase font-bold text-muted">
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Storage Key</th>
                  <th className="p-2.5">Item Count</th>
                  <th className="p-2.5">Est. Size</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {storageSummaries.map((s) => (
                  <tr key={s.key} className="hover:bg-card-bg/40">
                    <td className="p-2.5 font-extrabold text-foreground">{s.category}</td>
                    <td className="p-2.5 font-mono text-[10px] text-muted">{s.key}</td>
                    <td className="p-2.5 font-mono">{s.itemCount} items</td>
                    <td className="p-2.5 font-mono">{(s.estimatedBytes / 1024).toFixed(1)} KB</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Reset storage for category "${s.category}"?`)) {
                            resetSelectedCategory(s.key);
                          }
                        }}
                        className="text-[10px] text-muted hover:text-danger font-bold uppercase"
                      >
                        Reset Category
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Import JSON Area */}
        <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-foreground font-extrabold text-xs">
            <Upload className="h-4 w-4 text-primary" />
            <span>Import Demo Data Package</span>
          </div>
          <p className="text-xs text-muted">
            Paste a valid JSON backup exported from VONK Tournaments to overwrite or merge local storage categories.
          </p>
          <textarea
            rows={4}
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste exported JSON data here..."
            className="p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground font-mono resize-none focus:outline-none"
          />
          <button
            onClick={handleImport}
            className="py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Upload className="h-4 w-4" /> Validate & Import JSON
          </button>
        </div>

        {/* Full Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="p-6 rounded-2xl border border-danger/40 bg-card-bg max-w-md w-full flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center gap-2 text-danger font-black text-sm uppercase">
                <ShieldAlert className="h-5 w-5" />
                Confirm Full Storage Reset
              </div>
              <p className="text-xs text-muted leading-relaxed">
                This action will delete all local storage keys for VONK Tournaments and restore fresh default seed data.
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted">Type <span className="text-danger font-mono font-bold">&quot;RESET VONK&quot;</span> to confirm:</label>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="RESET VONK"
                  className="p-3 bg-card-bg border border-danger/40 rounded-xl text-xs font-mono text-foreground focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-card-bg border border-card-border text-muted hover:text-foreground text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFullReset}
                  disabled={resetConfirmInput !== 'RESET VONK'}
                  className="px-4 py-2 bg-danger text-white text-xs font-black rounded-xl disabled:opacity-50"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsShell>
  );
}
