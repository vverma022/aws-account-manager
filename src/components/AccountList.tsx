import type { AWSAccount } from '@/types/account';
import { AccountItem } from './AccountItem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AccountListProps {
  accounts: AWSAccount[];
  onEdit: (account: AWSAccount) => void;
  onDelete: (id: string) => void;
}

/**
 * Displays a list of saved AWS accounts
 * Shows empty state when no accounts exist
 */
export function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  // Empty state when no accounts saved
  if (accounts.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No AWS accounts saved yet. Click "Add Account" to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((account) => (
        <AccountItem
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
