import type { AWSAccount, StorageData } from '@/types/account';

const STORAGE_KEY = 'aws_accounts';

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
 * Returns null if account not found
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
 * Returns true if deleted, false if not found
 */
export async function deleteAccount(id: string): Promise<boolean> {
  const accounts = await getAccounts();
  const filtered = accounts.filter((acc) => acc.id !== id);

  // Account not found if lengths are equal
  if (filtered.length === accounts.length) return false;

  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts: filtered } });

  return true;
}

/**
 * Check if an account ID already exists (for duplicate prevention)
 */
export async function accountIdExists(accountId: string): Promise<boolean> {
  const accounts = await getAccounts();
  return accounts.some((acc) => acc.accountId === accountId);
}
