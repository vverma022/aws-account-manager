/**
 * Encrypted field with ciphertext and initialization vector
 */
export interface EncryptedField {
  ciphertext: string;  // base64-encoded AES-GCM ciphertext
  iv: string;          // base64-encoded initialization vector
}

/**
 * Represents a saved AWS account
 */
export interface AWSAccount {
  id: string;                           // Unique identifier (UUID)
  accountId: string;                    // AWS Account ID (12 digits)
  alias: string;                        // Friendly name (e.g., "Production", "Dev")
  username?: string;                    // Optional: IAM username
  password?: string | EncryptedField;   // Optional: Password (encrypted at rest)
  signinUrl?: string;                   // Optional: Custom signin URL
  createdAt: number;                    // Timestamp when created
  updatedAt: number;                    // Timestamp when last updated
}

/**
 * Wrapper interface for Chrome storage data structure
 */
export interface StorageData {
  accounts: AWSAccount[];
  theme?: 'light' | 'dark' | 'system';
}
