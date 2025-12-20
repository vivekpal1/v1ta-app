'use client';

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { V1TArciumClient } from '@/lib/arcium/client';
import {
  type PrivacyLevel,
  type EncryptedPosition,
  type PrivateHealthResult,
  type EncryptedData,
  type ArciumIntegrationStatus
} from '@/lib/arcium/types';

/**
 * Hook for managing Arcium privacy features in V1TA
 */
export function useArciumPrivacy() {
  const { connection } = useConnection();
  const [arciumClient, setArciumClient] = useState<V1TArciumClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<ArciumIntegrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Arcium client
  const initialize = useCallback(async () => {
    if (!connection) {
      setError('No connection available');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const client = new V1TArciumClient(connection);
      await client.initialize();

      setArciumClient(client);
      setIsInitialized(true);
      setIntegrationStatus(client.getIntegrationStatus());

      console.log('✅ Arcium privacy initialized');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Arcium';
      setError(errorMessage);
      console.error('❌ Arcium initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [connection]);

  // Auto-initialize on mount
  useEffect(() => {
    if (connection && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [connection, isInitialized, isInitializing, initialize]);

  // Encrypt position data
  const encryptPosition = useCallback(async (
    collateralAmount: bigint,
    debtAmount: bigint,
    owner: PublicKey
  ): Promise<EncryptedPosition | null> => {
    if (!arciumClient) {
      setError('Arcium client not initialized');
      return null;
    }

    try {
      const encryptedPosition = await arciumClient.encryptPositionData(
        collateralAmount,
        debtAmount,
        owner
      );

      return encryptedPosition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to encrypt position';
      setError(errorMessage);
      console.error('❌ Position encryption error:', err);
      return null;
    }
  }, [arciumClient]);

  // Encrypt generic data
  const encryptData = useCallback(async (
    data: string | bigint | number,
    options?: { algorithm?: 'AES-128' | 'AES-256'; key?: Uint8Array }
  ): Promise<EncryptedData | null> => {
    if (!arciumClient) {
      setError('Arcium client not initialized');
      return null;
    }

    try {
      const encryptedData = await arciumClient.encryptData(data, options);
      return encryptedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to encrypt data';
      setError(errorMessage);
      console.error('❌ Data encryption error:', err);
      return null;
    }
  }, [arciumClient]);

  // Decrypt data
  const decryptData = useCallback(async (
    encryptedData: EncryptedData
  ): Promise<Uint8Array | null> => {
    if (!arciumClient) {
      setError('Arcium client not initialized');
      return null;
    }

    try {
      const decryptedData = await arciumClient.decryptData(encryptedData);
      return decryptedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decrypt data';
      setError(errorMessage);
      console.error('❌ Data decryption error:', err);
      return null;
    }
  }, [arciumClient]);

  // Create health factor computation
  const createHealthFactorComputation = useCallback(async (
    encryptedCollateral: EncryptedData,
    encryptedDebt: EncryptedData,
    encryptedPrice: EncryptedData,
    positionId: string
  ): Promise<string | null> => {
    if (!arciumClient) {
      setError('Arcium client not initialized');
      return null;
    }

    try {
      const computationRef = await arciumClient.createHealthFactorComputation(
        encryptedCollateral,
        encryptedDebt,
        encryptedPrice,
        positionId
      );

      return computationRef.computationOffset.toString();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create health factor computation';
      setError(errorMessage);
      console.error('❌ Health factor computation error:', err);
      return null;
    }
  }, [arciumClient]);

  // Monitor computation
  const monitorComputation = useCallback(async (
    computationId: string
  ): Promise<PrivateHealthResult | null> => {
    if (!arciumClient) {
      setError('Arcium client not initialized');
      return null;
    }

    try {
      const computationRef = {
        computationOffset: new BN(computationId),
        priorityFee: new BN(0),
        accs: []
      };
      const result = await arciumClient.monitorComputation(computationRef);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to monitor computation';
      setError(errorMessage);
      console.error('❌ Computation monitoring error:', err);
      return null;
    }
  }, [arciumClient]);

  // Get privacy level description
  const getPrivacyLevelDescription = useCallback((level: PrivacyLevel): string => {
    switch (level) {
      case 0:
        return 'Public - All transaction data is visible on-chain';
      case 1:
        return 'Shielded - Balance amounts are encrypted';
      case 2:
        return 'Confidential - Balance and transaction amounts are encrypted';
      case 3:
        return 'Private - Complete position privacy with encrypted computations';
      default:
        return 'Unknown privacy level';
    }
  }, []);

  // Validate privacy settings
  const validatePrivacySettings = useCallback((
    collateralAmount: bigint,
    debtAmount: bigint,
    privacyLevel: PrivacyLevel
  ): { isValid: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    let isValid = true;

    // Check if amounts are reasonable
    if (collateralAmount <= 0) {
      warnings.push('Collateral amount must be greater than 0');
      isValid = false;
    }

    if (debtAmount < 0) {
      warnings.push('Debt amount cannot be negative');
      isValid = false;
    }

    // Privacy level-specific validations
    if (privacyLevel >= 2 && debtAmount === BigInt(0)) {
      warnings.push('Confidential privacy level requires debt amount');
    }

    if (privacyLevel >= 3 && (collateralAmount < BigInt(1000000000))) { // < 1 SOL in lamports
      warnings.push('Private privacy level requires minimum 1 SOL collateral');
    }

    return { isValid, warnings };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    arciumClient,
    isInitialized,
    isInitializing,
    integrationStatus,
    error,

    // Methods
    initialize,
    encryptPosition,
    encryptData,
    decryptData,
    createHealthFactorComputation,
    monitorComputation,
    getPrivacyLevelDescription,
    validatePrivacySettings,
    clearError,
  };
}

/**
 * Hook for managing private position operations
 */
export function usePrivatePosition() {
  const { arciumClient, encryptPosition, createHealthFactorComputation, monitorComputation } = useArciumPrivacy();
  const [activeComputations, setActiveComputations] = useState<Map<string, 'pending' | 'completed' | 'failed'>>(new Map());

  // Create private position
  const createPrivatePosition = useCallback(async (
    collateralAmount: bigint,
    debtAmount: bigint,
    owner: PublicKey,
    price: bigint
  ) => {
    // Encrypt position data
    const encryptedPosition = await encryptPosition(collateralAmount, debtAmount, owner);
    if (!encryptedPosition) {
      throw new Error('Failed to encrypt position data');
    }

    // Encrypt price data
    const priceBuffer = new ArrayBuffer(8);
    const priceView = new DataView(priceBuffer);
    priceView.setBigUint64(0, price, true);

    if (!arciumClient) {
      throw new Error('Arcium client not initialized');
    }

    const encryptedPrice = await arciumClient.encryptData(price);
    if (!encryptedPrice) {
      throw new Error('Failed to encrypt price data');
    }

    // Create health factor computation
    const computationId = await createHealthFactorComputation(
      encryptedPosition.encryptedCollateral,
      encryptedPosition.encryptedDebt,
      encryptedPrice,
      encryptedPosition.positionId
    );

    if (computationId) {
      setActiveComputations(prev => new Map(prev).set(encryptedPosition.positionId, 'pending'));

      // Start monitoring computation
      monitorComputation(computationId)
        .then(result => {
          setActiveComputations(prev => new Map(prev).set(encryptedPosition.positionId, 'completed'));
          console.log('Health factor computed:', result);
        })
        .catch(err => {
          setActiveComputations(prev => new Map(prev).set(encryptedPosition.positionId, 'failed'));
          console.error('Health factor computation failed:', err);
        });
    }

    return encryptedPosition;
  }, [encryptPosition, arciumClient, createHealthFactorComputation, monitorComputation]);

  // Get computation status
  const getComputationStatus = useCallback((positionId: string) => {
    return activeComputations.get(positionId) || 'not_started';
  }, [activeComputations]);

  return {
    createPrivatePosition,
    getComputationStatus,
    activeComputations: Array.from(activeComputations.entries()),
  };
}