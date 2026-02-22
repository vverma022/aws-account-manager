import type { AWSAccount, StorageData, EncryptedField } from '@/types/account';
import { encryptPassword, decryptPassword, migrateAccount } from './crypto';

const STORAGE_KEY = 'aws_accounts';
const THEME_KEY = 'aws_theme';

/**
 * Get all saved AWS accounts from Chrome storage.
 * Automatically decrypts passwords before returning.
 */
export async function getAccounts(): Promise<AWSAccount[]> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as StorageData | undefined;
    const accounts = stored?.accounts ?? [];
    
    // Decrypt passwords for each account
    for (const account of accounts) {
      if (account.password && typeof account.password === 'object' && 'ciphertext' in account.password) {
        try {
          account.password = await decryptPassword(account.password as EncryptedField);
        } catch (error) {
          console.error('Failed to decrypt password for account:', account.alias, error);
          // Leave encrypted if decryption fails
        }
      }
    }
    
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

/**
 * Save a new AWS account to storage.
 * Automatically encrypts the password before storing.
 */
export async function saveAccount(
  account: Omit<AWSAccount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AWSAccount> {
  const accounts = await getAccounts();

  const newAccount: AWSAccount = {
    ...account,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  // Encrypt password if provided
  if (newAccount.password && typeof newAccount.password === 'string') {
    newAccount.password = await encryptPassword(newAccount.password);
  }

  accounts.push(newAccount);

  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts } });

  // Return with decrypted password for immediate use
  const returned = { ...newAccount };
  if (returned.password && typeof returned.password === 'object' && 'ciphertext' in returned.password) {
    returned.password = await decryptPassword(returned.password as EncryptedField);
  }

  return returned;
}

/**
 * Update an existing account by ID.
 * Automatically encrypts the password if it's being updated.
 */
export async function updateAccount(
  id: string,
  updates: Partial<Omit<AWSAccount, 'id' | 'createdAt'>>
): Promise<AWSAccount | null> {
  const accounts = await getAccounts();
  const index = accounts.findIndex((acc) => acc.id === id);

  if (index === -1) return null;
  
  // Encrypt password if it's being updated and is plaintext
  if (updates.password && typeof updates.password === 'string') {
    updates.password = await encryptPassword(updates.password);
  }

  accounts[index] = {
    ...accounts[index],
    ...updates,
    updatedAt: Date.now(),
  };

  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts } });

  // Return with decrypted password
  const returned = { ...accounts[index] };
  if (returned.password && typeof returned.password === 'object' && 'ciphertext' in returned.password) {
    returned.password = await decryptPassword(returned.password as EncryptedField);
  }

  return returned;
}

/**
 * Delete an account by ID
 */
export async function deleteAccount(id: string): Promise<boolean> {
  const accounts = await getAccounts();
  const filtered = accounts.filter((acc) => acc.id !== id);

  if (filtered.length === accounts.length) return false;

  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts: filtered } });

  return true;
}

/**
 * Check if an account ID already exists
 */
export async function accountIdExists(accountId: string): Promise<boolean> {
  const accounts = await getAccounts();
  return accounts.some((acc) => acc.accountId === accountId);
}

/**
 * Get saved theme preference
 */
export async function getTheme(): Promise<'light' | 'dark' | 'system'> {
  try {
    const result = await chrome.storage.sync.get(THEME_KEY);
    const theme = result[THEME_KEY] as 'light' | 'dark' | 'system' | undefined;
    return theme || 'system';
  } catch {
    return 'system';
  }
}

/**
 * Save theme preference
 */
export async function setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
  await chrome.storage.sync.set({ [THEME_KEY]: theme });
}

/**
 * Migrate all accounts with plain-text passwords to encrypted format.
 * This is called once on app startup to handle legacy data.
 */
export async function migrateAccounts(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as StorageData | undefined;
    
    if (!stored?.accounts || stored.accounts.length === 0) {
      return;
    }
    
    let needsMigration = false;
    
    for (const account of stored.accounts) {
      if (account.password && typeof account.password === 'string') {
        needsMigration = true;
        await migrateAccount(account);
      }
    }
    
    if (needsMigration) {
      await chrome.storage.sync.set({ [STORAGE_KEY]: stored });
      console.log('Successfully migrated accounts to encrypted storage');
    }
  } catch (error) {
    console.error('Error migrating accounts:', error);
  }
}
