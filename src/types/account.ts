/**
 * Represents a saved AWS account
 */
export interface AWSAccount {
  id: string;              // Unique identifier (UUID)
  accountId: string;       // AWS Account ID (12 digits)
  alias: string;           // Friendly name (e.g., "Production", "Dev")
  username?: string;       // Optional: IAM username
  createdAt: number;       // Timestamp when created
  updatedAt: number;       // Timestamp when last updated
}

/**
 * Wrapper interface for Chrome storage data structure
 */
export interface StorageData {
  accounts: AWSAccount[];
}
