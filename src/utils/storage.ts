import type { AWSAccount, StorageData } from '@/types/account';

const STORAGE_KEY = 'aws_accounts';
const THEME_KEY = 'aws_theme';

/**
 * Get all saved AWS accounts from Chrome storage
 */
export async function getAccounts(): Promise<AWSAccount[]> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as StorageData | undefined;
    return stored?.accounts ?? [];
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

/**
 * Save a new AWS account to storage
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

  accounts.push(newAccount);

  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts } });

  return newAccount;
}

/**
 * Update an existing account by ID
 */
export async function updateAccount(
  id: string,
  updates: Partial<Omit<AWSAccount, 'id' | 'createdAt'>>
): Promise<AWSAccount | null> {
  const accounts = await getAccounts();
  const index = accounts.findIndex((acc) => acc.id === id);

  if (index === -1) return null;

  accounts[index] = {
    ...accounts[index],
    ...updates,
    updatedAt: Date.now(),
  };

  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts } });

  return accounts[index];
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
