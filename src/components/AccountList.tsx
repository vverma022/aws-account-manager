import type { AWSAccount } from '@/types/account';
import { AccountItem } from './AccountItem';
import { AwsLogo } from './AwsLogo';

interface AccountListProps {
  accounts: AWSAccount[];
  onEdit: (account: AWSAccount) => void;
  onDelete: (id: string) => void;
}

/**
 * Displays a list of saved AWS accounts
 */
export function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  // Empty state
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-2xl bg-accent p-6 mb-5">
          <AwsLogo className="h-12 w-auto opacity-70" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No accounts yet</h3>
        <p className="text-sm text-muted-foreground max-w-[240px]">
          Add your first AWS account to enable one-click login
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
