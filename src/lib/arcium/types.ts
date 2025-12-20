/**
 * Arcium Privacy Types for V1TA
 * Defines interfaces for private position management and computation
 */

import { PublicKey } from '@solana/web3.js';
import { ComputationReference, MempoolPriorityFeeStats } from '@arcium-hq/client';

/**
 * Privacy levels for position management
 */
export enum PrivacyLevel {
  PUBLIC = 0,        // Fully transparent (current behavior)
  SHIELDED = 1,      // Balance privacy only
  CONFIDENTIAL = 2,  // Transaction privacy + balance privacy
  PRIVATE = 3        // Complete position privacy
}

/**
 * Encrypted data container
 */
export interface EncryptedData {
  data: Uint8Array;
  key: Uint8Array;
  nonce: Uint8Array;
  algorithm: 'AES-128' | 'AES-256';
}

/**
 * Encrypted position data structure
 */
export interface EncryptedPosition {
  positionId: string;
  owner: PublicKey;
  encryptedCollateral: EncryptedData;
  encryptedDebt: EncryptedData;
  encryptedOwner?: EncryptedData;
  positionKey: Uint8Array;
  privacyLevel: PrivacyLevel;
  createdAt: number;
  lastUpdated: number;
}

/**
 * Private health factor computation result
 */
export interface PrivateHealthResult {
  positionId: string;
  healthFactor: Uint8Array; // Encrypted health factor
  isLiquidatable: boolean;
  liquidationThreshold: Uint8Array;
  computedAt: number;
  computationId: string;
}

/**
 * Confidential liquidation trigger
 */
export interface ConfidentialLiquidationTrigger {
  positionId: string;
  encryptedTrigger: EncryptedData;
  healthThreshold: number;
  isActive: boolean;
  createdAt: number;
}

/**
 * Private transaction parameters
 */
export interface PrivateTransactionParams {
  fromPosition: string;
  toPosition?: string;
  encryptedAmount: EncryptedData;
  transactionType: 'BORROW' | 'REPAY' | 'COLLATERAL_DEPOSIT' | 'COLLATERAL_WITHDRAW';
  privacyLevel: PrivacyLevel;
}

/**
 * Arcium computation configuration
 */
export interface ArciumComputationConfig {
  computationType: 'HEALTH_FACTOR' | 'LIQUIDATION_CHECK' | 'INTEREST_CALCULATION' | 'BALANCE_TRANSFER';
  inputs: Uint8Array[];
  encryptionAlgorithm: 'AES-128' | 'AES-256';
  priorityFee?: number;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  circuitId?: string;
}

/**
 * Private position creation parameters
 */
export interface PrivatePositionParams {
  owner: PublicKey;
  collateralAmount: bigint;
  debtAmount: bigint;
  collateralType: string;
  privacyLevel: PrivacyLevel;
}

/**
 * Private position receipt
 */
export interface PrivatePositionReceipt {
  positionId: string;
  transactionSignature: string;
  encryptedPosition: EncryptedPosition;
  computationReferences: ComputationReference[];
  privacyProof: string;
}

/**
 * Privacy configuration options
 */
export interface PrivacyConfig {
  defaultPrivacyLevel: PrivacyLevel;
  enableLiquidationProtection: boolean;
  enableHealthMonitoring: boolean;
  computationTimeoutMs: number;
  batchComputationSize: number;
  encryptionAlgorithm: 'AES-128' | 'AES-256';
}

/**
 * Arcium integration status
 */
export interface ArciumIntegrationStatus {
  isInitialized: boolean;
  publicKey: string | null;
  supportedAlgorithms: string[];
  currentComputations: number;
  totalComputationsProcessed: number;
  lastComputationTime?: number;
  mempoolStats?: MempoolPriorityFeeStats;
}

/**
 * Privacy event types
 */
export interface PrivacyEvent {
  type: 'POSITION_CREATED' | 'HEALTH_COMPUTED' | 'LIQUIDATION_TRIGGERED' | 'TRANSACTION_PROCESSED';
  positionId: string;
  timestamp: number;
  encryptedData?: Uint8Array;
  computationRef?: ComputationReference;
  metadata?: Record<string, any>;
}

/**
 * Private transaction history entry
 */
export interface PrivateTransactionEntry {
  transactionId: string;
  positionId: string;
  transactionType: string;
  encryptedAmount: EncryptedData;
  timestamp: number;
  privacyLevel: PrivacyLevel;
  computationId: string;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Batch health computation results
 */
export interface BatchHealthResult {
  results: PrivateHealthResult[];
  computationRefs: ComputationReference[];
  totalProcessed: number;
  processingTime: number;
  errors?: Array<{ positionId: string; error: string }>;
}

/**
 * Liquidation callback handler
 */
export type LiquidationCallback = (
  positionId: string,
  healthResult: PrivateHealthResult,
  computationId: string
) => Promise<void>;

/**
 * Computation progress callback
 */
export type ComputationProgressCallback = (
  computationId: string,
  progress: number,
  status: string
) => void;

/**
 * Privacy validation result
 */
export interface PrivacyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  privacyScore: number; // 0-100 score
  recommendations: string[];
}

/**
 * Arcium cost estimation
 */
export interface ArciumCostEstimate {
  computationCost: number; // in lamports
  priorityFee: number;
  totalCost: number;
  estimatedTime: number; // in seconds
  confidence: number; // 0-1
}

/**
 * Private position metrics
 */
export interface PrivatePositionMetrics {
  totalPositions: number;
  privatePositions: number;
  confidentialPositions: number;
  shieldedPositions: number;
  totalCollateral: Uint8Array; // Encrypted total
  totalDebt: Uint8Array; // Encrypted total
  averageHealthFactor: Uint8Array; // Encrypted average
  lastUpdateTime: number;
}

/**
 * User privacy settings
 */
export interface UserPrivacySettings {
  defaultPrivacyLevel: PrivacyLevel;
  enablePrivateTransactions: boolean;
  enableHealthMonitoring: boolean;
  enableLiquidationAlerts: boolean;
  computationBatchSize: number;
  preferredEncryptionAlgorithm: 'AES-128' | 'AES-256';
  autoLiquidationProtection: boolean;
}

/**
 * Computation status tracking
 */
export interface ComputationStatus {
  computationId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime: number;
  endTime?: number;
  error?: string;
  result?: Uint8Array;
}

/**
 * Private oracle data
 */
export interface PrivateOracleData {
  assetMint: PublicKey;
  encryptedPrice: EncryptedData;
  timestamp: number;
  confidence: number;
  source: 'pyth' | 'chainlink' | 'custom';
}

/**
 * MXE (Multi-party Execution Environment) configuration
 */
export interface MXEConfiguration {
  numberOfParties: number;
  threshold: number; // Minimum parties required
  computationTimeout: number;
  retryAttempts: number;
  priorityFeeStrategy: 'fixed' | 'dynamic';
}

/**
 * Confidential computation result
 */
export interface ConfidentialComputationResult {
  computationId: string;
  positionId: string;
  resultType: 'health_factor' | 'liquidation_check' | 'interest_calculation';
  encryptedOutput: Uint8Array;
  proof: Uint8Array;
  timestamp: number;
  computationTime: number;
}

/**
 * Privacy level migration data
 */
export interface PrivacyLevelMigration {
  positionId: string;
  fromLevel: PrivacyLevel;
  toLevel: PrivacyLevel;
  migrationProof: Uint8Array;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Arcium network information
 */
export interface ArciumNetworkInfo {
  network: 'mainnet' | 'devnet' | 'testnet';
  programId: PublicKey;
  cluster: PublicKey;
  executingPool: PublicKey;
  feePool: PublicKey;
  mempool: PublicKey;
  supportedCircuits: string[];
}