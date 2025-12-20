'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, Info } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useArciumPrivacy } from '@/hooks/use-arcium-privacy';
import { type PrivacyLevel } from '@/lib/arcium/types';

interface PrivacyToggleProps {
  onPrivacyChange?: (enabled: boolean, level: PrivacyLevel) => void;
  collateralAmount?: bigint;
  debtAmount?: bigint;
  className?: string;
}

/**
 * Privacy Toggle Component
 * Simple toggle for enabling/disabling privacy features with level selection
 */
export function PrivacyToggle({
  onPrivacyChange,
  collateralAmount = BigInt(0),
  debtAmount = BigInt(0),
  className = ''
}: PrivacyToggleProps) {
  const {
    isInitialized,
    encryptPosition,
    getPrivacyLevelDescription,
    validatePrivacySettings
  } = useArciumPrivacy();

  const [privacyEnabled, setPrivacyEnabled] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<PrivacyLevel>(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    warnings: string[];
  } | null>(null);

  const privacyOptions = [
    { level: 1, name: 'Shielded', icon: Shield, color: 'text-green-500' },
    { level: 2, name: 'Confidential', icon: Lock, color: 'text-purple-500' },
    { level: 3, name: 'Private', icon: Eye, color: 'text-red-500' }
  ];

  const handleToggle = async () => {
    if (!isInitialized) return;

    const newEnabled = !privacyEnabled;
    setPrivacyEnabled(newEnabled);

    if (newEnabled) {
      // Validate privacy settings
      const validation = validatePrivacySettings(collateralAmount, debtAmount, selectedLevel);
      setValidationResult(validation);

      if (validation.isValid) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

        // Test encryption
        if (collateralAmount > 0) {
          try {
            const testEncrypted = await encryptPosition(collateralAmount, debtAmount, new PublicKey('11111111111111111111111111111111'));
            console.log('Test encryption successful:', testEncrypted?.positionId);
          } catch (error) {
            console.error('Test encryption failed:', error);
          }
        }
      }
    }

    onPrivacyChange?.(newEnabled, selectedLevel);
  };

  const handleLevelChange = (level: PrivacyLevel) => {
    setSelectedLevel(level);
    if (privacyEnabled) {
      const validation = validatePrivacySettings(collateralAmount, debtAmount, level);
      setValidationResult(validation);
      onPrivacyChange?.(true, level);
    }
  };

  if (!isInitialized) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <Info className="w-4 h-4" />
          <span>Privacy features initializing...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg transition-colors ${
              privacyEnabled ? 'bg-primary/20' : 'bg-surface'
            }`}>
              <Shield className={`w-4 h-4 transition-colors ${
                privacyEnabled ? 'text-primary' : 'text-text-tertiary'
              }`} />
            </div>
            <div>
              <div className="font-medium text-text-primary">Enable Privacy</div>
              <div className="text-xs text-text-secondary">
                Encrypt transaction data and position amounts
              </div>
            </div>
          </div>

          <Button
            onClick={handleToggle}
            variant={privacyEnabled ? 'primary' : 'outline'}
            size="sm"
            className="relative"
          >
            {isAnimating && (
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-md"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <span className="relative z-10">
              {privacyEnabled ? 'Enabled' : 'Enable'}
            </span>
          </Button>
        </div>

        {/* Privacy Level Selection */}
        <AnimatePresence>
          {privacyEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="text-sm font-medium text-text-primary">Privacy Level</div>

                <div className="grid grid-cols-3 gap-2">
                  {privacyOptions.map(({ level, name, icon: Icon, color }) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLevelChange(level as PrivacyLevel)}
                      className={`p-2 rounded-lg border transition-all ${
                        selectedLevel === level
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-xs font-medium text-text-primary">{name}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Privacy Level Description */}
                <div className="p-2 bg-surface/50 rounded-lg">
                  <p className="text-xs text-text-secondary">
                    {getPrivacyLevelDescription(selectedLevel)}
                  </p>
                </div>

                {/* Validation Warnings */}
                {validationResult && !validationResult.isValid && (
                  <div className="p-2 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="text-xs text-warning font-medium mb-1">Validation Warnings:</div>
                    <ul className="text-xs text-warning/80 space-y-0.5">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Success Message */}
                {validationResult && validationResult.isValid && (
                  <div className="p-2 bg-success/10 border border-success/30 rounded-lg">
                    <div className="text-xs text-success font-medium">
                      ✓ Privacy settings validated successfully
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}