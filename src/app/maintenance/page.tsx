'use client';

import { redirect } from 'next/navigation';

// Maintenance mode is currently disabled
// Set to true to enable maintenance mode
const MAINTENANCE_ENABLED = false;

export default function MaintenancePage() {
  // If maintenance is disabled, redirect to home
  if (!MAINTENANCE_ENABLED) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">
            Under Maintenance
          </h1>
          <p className="text-text-secondary">
            We're currently performing scheduled maintenance. We'll be back shortly.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-text-tertiary">
              Estimated downtime: 30 minutes
            </span>
          </div>

          <div className="p-4 bg-surface/50 rounded-lg">
            <p className="text-xs text-text-tertiary">
              During this time, you won't be able to create new positions or perform transactions.
              Existing positions remain secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}