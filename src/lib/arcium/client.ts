'use client';

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import {
  getArciumProgram,
  getArciumProgramId,
  Aes256Cipher,
  Aes128Cipher,
  serializeLE,
  buildFinalizeCompDefTx,
  awaitComputationFinalization,
  getComputationsInMempool,
  type ArciumIdlType,
  type ComputationReference,
  type MempoolPriorityFeeStats
} from '@arcium-hq/client';
import {
  PrivacyLevel,
  type EncryptedData,
  type EncryptedPosition,
  type PrivateHealthResult,
  type PrivatePositionParams,
  type PrivatePositionReceipt,
  type ArciumComputationConfig,
  type ArciumIntegrationStatus
} from './types';

/**
 * V1TA Arcium Privacy Client
 * Handles encryption, computation, and privacy-preserving operations using Arcium MXE
 */
export class V1TArciumClient {
  private connection: Connection;
  private userKeyPair?: Keypair;
  private isInitialized = false;
  private computationCallbacks: Map<string, (result: any) => void> = new Map();
  private _arciumProgram?: any;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Initialize the Arcium client and set up encryption keys
   */
  async initialize(userKeyPair?: Keypair): Promise<void> {
    try {
      this.userKeyPair = userKeyPair || Keypair.generate();

      // Create AnchorProvider
      const wallet = new Wallet(this.userKeyPair);
      const provider = new AnchorProvider(this.connection, wallet, AnchorProvider.defaultOptions());

      // Get Arcium program instance
      this._arciumProgram = await getArciumProgram(provider);

      this.isInitialized = true;
      console.log('✅ Arcium client initialized successfully');
      console.log('Arcium Program ID:', getArciumProgramId().toBase58());
    } catch (error) {
      console.error('❌ Failed to initialize Arcium client:', error);
      throw new Error(`Arcium initialization failed: ${error}`);
    }
  }

  /**
   * Encrypt sensitive data using AES
   */
  async encryptData(
    data: string | bigint | number,
    options: {
      algorithm?: 'AES-128' | 'AES-256';
      key?: Uint8Array;
    } = {}
  ): Promise<EncryptedData> {
    const { algorithm = 'AES-256', key } = options;

    try {
      // Convert data to bytes
      const dataBytes = typeof data === 'string'
        ? new TextEncoder().encode(data)
        : typeof data === 'bigint'
        ? serializeLE(data, 64) // 64 bytes for big numbers
        : serializeLE(BigInt(data), 32); // 32 bytes for regular numbers

      // Generate random key if not provided
      const encryptionKey = key || this.generateRandomBytes(algorithm === 'AES-256' ? 32 : 16);

      // Generate nonce for AES
      const nonce = this.generateRandomBytes(12); // 12 bytes for GCM nonce

      // Encrypt using appropriate cipher
      let encryptedData: Uint8Array;
      if (algorithm === 'AES-256') {
        const cipher = new Aes256Cipher(encryptionKey);
        encryptedData = cipher.encrypt(dataBytes, nonce);
      } else {
        const cipher = new Aes128Cipher(encryptionKey);
        encryptedData = cipher.encrypt(dataBytes, nonce);
      }

      return {
        data: encryptedData,
        key: encryptionKey,
        nonce,
        algorithm
      };
    } catch (error) {
      console.error('❌ Failed to encrypt data:', error);
      throw new Error(`Data encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data using AES
   */
  async decryptData(encryptedData: EncryptedData): Promise<Uint8Array> {
    try {
      const { data, key, nonce, algorithm } = encryptedData;

      let decryptedData: Uint8Array;

      if (algorithm === 'AES-256') {
        const cipher = new Aes256Cipher(key);
        decryptedData = cipher.decrypt(data, nonce);
      } else {
        const cipher = new Aes128Cipher(key);
        decryptedData = cipher.decrypt(data, nonce);
      }

      return decryptedData;
    } catch (error) {
      console.error('❌ Failed to decrypt data:', error);
      throw new Error(`Data decryption failed: ${error}`);
    }
  }

  /**
   * Encrypt position data for privacy
   */
  async encryptPositionData(
    collateralAmount: bigint,
    debtAmount: bigint,
    owner: PublicKey
  ): Promise<EncryptedPosition> {
    if (!this.isInitialized) {
      throw new Error('Arcium client not initialized');
    }

    try {
      // Generate master position key
      const positionKey = this.generateRandomBytes(32);

      // Generate position ID
      const positionId = this.generatePositionId();

      // Encrypt sensitive position data
      const [encryptedCollateral, encryptedDebt, encryptedOwner] = await Promise.all([
        this.encryptData(collateralAmount, { key: positionKey }),
        this.encryptData(debtAmount, { key: positionKey }),
        this.encryptData(owner.toBase58(), { key: positionKey })
      ]);

      return {
        positionId,
        owner,
        encryptedCollateral,
        encryptedDebt,
        encryptedOwner,
        positionKey,
        privacyLevel: PrivacyLevel.CONFIDENTIAL,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to encrypt position data:', error);
      throw new Error(`Position encryption failed: ${error}`);
    }
  }

  /**
   * Create confidential computation for health factor calculation
   */
  async createHealthFactorComputation(
    encryptedCollateral: EncryptedData,
    encryptedDebt: EncryptedData,
    encryptedPrice: EncryptedData,
    positionId: string
  ): Promise<ComputationReference> {
    if (!this.isInitialized || !this._arciumProgram) {
      throw new Error('Arcium client not initialized');
    }

    try {
      // Generate computation inputs (encrypted position data)
      const inputs = [
        encryptedCollateral.data,
        encryptedDebt.data,
        encryptedPrice.data
      ];

      // Create computation definition for health factor calculation
      const computationTx = await buildFinalizeCompDefTx(
        this._arciumProgram,
        {
          inputs,
          callbackData: JSON.stringify({
            type: 'health_factor',
            positionId
          }),
          // Health factor calculation circuit ID (would be uploaded separately)
          circuitId: 'health_factor_v1'
        }
      );

      // Submit computation transaction
      const txSignature = await this.connection.sendRawTransaction(
        computationTx.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        }
      );

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(txSignature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Computation transaction failed: ${confirmation.value.err}`);
      }

      // Extract computation reference from transaction logs
      const computationRef = this.extractComputationReference(confirmation);

      // Register callback for computation result
      this.registerComputationCallback(positionId, 'health_factor');

      return computationRef;
    } catch (error) {
      console.error('❌ Failed to create health factor computation:', error);
      throw new Error(`Health factor computation failed: ${error}`);
    }
  }

  /**
   * Monitor and process computation results
   */
  async monitorComputation(computationRef: ComputationReference): Promise<PrivateHealthResult> {
    try {
      // Wait for computation finalization
      const result = await awaitComputationFinalization(
        this.connection,
        computationRef
      );

      // Parse callback data
      const callbackData = JSON.parse(result);

      // Process the result based on computation type
      if (callbackData.type === 'health_factor') {
        return this.processHealthFactorResult({
          computationId: computationRef.computationOffset.toString(),
          positionId: callbackData.positionId,
          result
        });
      } else if (callbackData.type === 'liquidation_check') {
        return this.processLiquidationResult({
          computationId: computationRef.computationOffset.toString(),
          positionId: callbackData.positionId,
          result
        });
      }

      throw new Error('Unknown computation type');
    } catch (error) {
      console.error('❌ Failed to monitor computation:', error);
      throw new Error(`Computation monitoring failed: ${error}`);
    }
  }

  /**
   * Get current mempool statistics
   */
  async getMempoolStats(): Promise<MempoolPriorityFeeStats> {
    if (!this.isInitialized || !this.userKeyPair) {
      throw new Error('Arcium client not initialized');
    }

    try {
      const mempoolStats = await getComputationsInMempool(this.connection, this.userKeyPair);
      return mempoolStats;
    } catch (error) {
      console.error('❌ Failed to get mempool stats:', error);
      throw new Error(`Mempool stats fetch failed: ${error}`);
    }
  }

  /**
   * Get Arcium integration status
   */
  getIntegrationStatus(): ArciumIntegrationStatus {
    return {
      isInitialized: this.isInitialized,
      publicKey: this.userKeyPair?.publicKey.toBase58() || null,
      supportedAlgorithms: ['AES-128', 'AES-256'],
      currentComputations: this.computationCallbacks.size,
      totalComputationsProcessed: 0,
      lastComputationTime: undefined
    };
  }

  /**
   * Generate cryptographically secure random bytes
   */
  private generateRandomBytes(length: number): Uint8Array {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  /**
   * Generate unique position ID
   */
  private generatePositionId(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = this.generateRandomBytes(8);
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `pos_${timestamp}_${randomString}`;
  }

  /**
   * Extract computation reference from transaction confirmation
   */
  private extractComputationReference(confirmation: any): ComputationReference {
    // Parse transaction logs to extract computation reference
    const logs = confirmation.value.meta?.logMessages || [];

    for (const log of logs) {
      if (log.includes('Computation created:')) {
        const ref = log.split('Computation created:')[1].trim();
        return { computationOffset: BigInt(ref) };
      }
    }

    throw new Error('Could not extract computation reference from transaction');
  }

  /**
   * Register callback for computation results
   */
  private registerComputationCallback(positionId: string, computationType: string): void {
    const callbackKey = `${positionId}-${computationType}`;

    // Set up a polling mechanism to check for computation results
    const checkResult = async () => {
      try {
        // Implementation would check for computation results
        console.log(`Checking for ${computationType} result for position ${positionId}`);
      } catch (error) {
        console.error('Error checking computation result:', error);
      }
    };

    this.computationCallbacks.set(callbackKey, checkResult);
  }

  /**
   * Process health factor computation result
   */
  private processHealthFactorResult(result: any): PrivateHealthResult {
    console.log('Processing health factor result:', result.computationId);

    // Implementation would process the encrypted health factor
    // and potentially trigger liquidation if needed
    return {
      positionId: result.positionId,
      healthFactor: this.generateRandomBytes(32), // Placeholder - would be actual result
      isLiquidatable: false, // Placeholder - would be computed
      liquidationThreshold: this.generateRandomBytes(32), // Placeholder
      computedAt: Date.now(),
      computationId: result.computationId
    };
  }

  /**
   * Process liquidation check result
   */
  private processLiquidationResult(result: any): PrivateHealthResult {
    console.log('Processing liquidation result:', result.computationId);

    return {
      positionId: result.positionId,
      healthFactor: this.generateRandomBytes(32), // Placeholder
      isLiquidatable: true, // Placeholder - would be computed
      liquidationThreshold: this.generateRandomBytes(32), // Placeholder
      computedAt: Date.now(),
      computationId: result.computationId
    };
  }

  /**
   * Get client initialization status
   */
  get isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get user's encryption public key
   */
  get publicKey(): string | null {
    return this.userKeyPair?.publicKey.toBase58() || null;
  }

  /**
   * Get Arcium program instance
   */
  get program(): any {
    return this._arciumProgram;
  }
}