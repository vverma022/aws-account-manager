import type { AWSAccount } from '@/types/account';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface AccountItemProps {
  account: AWSAccount;
  onEdit: (account: AWSAccount) => void;
  onDelete: (id: string) => void;
}

/**
 * Displays a single AWS account card with actions
 * Shows alias, account ID, and optional username
 * Provides copy, edit, and delete functionality
 */
export function AccountItem({ account, onEdit, onDelete }: AccountItemProps) {
  // Copy account ID to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountId);
      toast.success('Account ID copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy account ID');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{account.alias}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              title="Copy Account ID"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(account)}
              title="Edit Account"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(account.id)}
              title="Delete Account"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground font-mono">
          {account.accountId}
        </p>
        {account.username && (
          <p className="text-xs text-muted-foreground mt-1">
            User: {account.username}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
