'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Info, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useArciumPrivacy } from '@/hooks/use-arcium-privacy';
import { type PrivacyLevel } from '@/lib/arcium/types';

interface PrivacySettingsProps {
  onPrivacyChange?: (level: PrivacyLevel) => void;
  onEncryptedTransaction?: (enabled: boolean) => void;
  className?: string;
}

/**
 * Privacy Settings Component
 * Allows users to configure privacy levels and encryption preferences
 */
export function PrivacySettings({
  onPrivacyChange,
  onEncryptedTransaction,
  className = ''
}: PrivacySettingsProps) {
  const {
    isInitialized,
    isInitializing,
    integrationStatus,
    error,
    initialize,
    getPrivacyLevelDescription,
    validatePrivacySettings,
    clearError
  } = useArciumPrivacy();

  const [selectedPrivacyLevel, setSelectedPrivacyLevel] = useState<PrivacyLevel>(1);
  const [encryptedTransactions, setEncryptedTransactions] = useState(true);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const privacyLevels = [
    { level: 0, name: 'Public', icon: Eye, color: 'text-blue-500', description: 'All data visible on-chain' },
    { level: 1, name: 'Shielded', icon: Shield, color: 'text-green-500', description: 'Balance amounts encrypted' },
    { level: 2, name: 'Confidential', icon: Lock, color: 'text-purple-500', description: 'Transactions and balances encrypted' },
    { level: 3, name: 'Private', icon: EyeOff, color: 'text-red-500', description: 'Complete privacy with encrypted computations' }
  ];

  const handlePrivacyLevelChange = async (level: PrivacyLevel) => {
    setIsValidating(true);

    try {
      // Validate privacy settings
      const { isValid, warnings } = validatePrivacySettings(
        BigInt(1000000000), // 1 SOL example
        BigInt(0), // No debt example
        level
      );

      if (isValid) {
        setSelectedPrivacyLevel(level);
        onPrivacyChange?.(level);
      } else {
        console.warn('Privacy validation failed:', warnings);
      }
    } catch (err) {
      console.error('Error validating privacy settings:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleEncryptedTransactionToggle = () => {
    const newValue = !encryptedTransactions;
    setEncryptedTransactions(newValue);
    onEncryptedTransaction?.(newValue);
  };

  const handleInitialize = async () => {
    await initialize();
  };

  if (error) {
    return (
      <Card className={`p-4 border-error/50 bg-error/5 ${className}`}>
        <div className="flex items-start gap-3">
          <X className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-error mb-1">Privacy Initialization Failed</h3>
            <p className="text-sm text-error/80 mb-3">{error}</p>
            <Button onClick={handleInitialize} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isInitializing) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Initializing privacy features...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Privacy Settings</h3>
            <p className="text-sm text-text-secondary">
              Configure your privacy preferences for V1TA protocol
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isInitialized ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-full">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs text-success font-medium">Active</span>
              </div>
            ) : (
              <Button onClick={handleInitialize} size="sm" variant="outline">
                Initialize
              </Button>
            )}
          </div>
        </div>

        {isInitialized && (
          <>
            {/* Privacy Level Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text-primary">Privacy Level</h4>
              <div className="grid gap-2">
                {privacyLevels.map(({ level, name, icon: Icon, color, description }) => (
                  <motion.div
                    key={level}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handlePrivacyLevelChange(level as PrivacyLevel)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPrivacyLevel === level
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/30 hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-surface ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-primary">{name}</span>
                            {selectedPrivacyLevel === level && (
                              <Check className="w-4 h-4 text-success" />
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetails(showDetails === name ? null : name);
                        }}
                      >
                        <Info className="w-4 h-4 text-text-tertiary" />
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showDetails === name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 mt-2 border-t border-border/50">
                            <p className="text-xs text-text-tertiary leading-relaxed">
                              {getPrivacyLevelDescription(level as PrivacyLevel)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Encrypted Transactions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text-primary">Transaction Privacy</h4>
              <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">Encrypted Transactions</div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Hide transaction amounts from public view
                    </p>
                  </div>
                </div>

                <Button
                  variant={encryptedTransactions ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleEncryptedTransactionToggle}
                  disabled={isValidating}
                >
                  {encryptedTransactions ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>

            {/* Status Information */}
            {integrationStatus && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Integration Status</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-surface/50 rounded-lg">
                    <div className="text-text-tertiary">Public Key</div>
                    <div className="font-mono text-text-secondary mt-1 truncate">
                      {integrationStatus.publicKey?.slice(0, 16)}...
                    </div>
                  </div>
                  <div className="p-2 bg-surface/50 rounded-lg">
                    <div className="text-text-tertiary">Active Computations</div>
                    <div className="font-mono text-text-secondary mt-1">
                      {integrationStatus.currentComputations}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open('https://docs.arcium.com', '_blank')}
              >
                Learn More
              </Button>
              <Button
                className="flex-1"
                disabled={isValidating}
                onClick={() => {
                  onPrivacyChange?.(selectedPrivacyLevel);
                }}
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Apply Settings
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}