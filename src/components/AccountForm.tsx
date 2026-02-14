import { useState, useEffect } from 'react';
import type { AWSAccount } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AccountFormProps {
  account?: AWSAccount; // undefined = new account, defined = editing
  open: boolean;
  onClose: () => void;
  onSave: (data: { accountId: string; alias: string; username?: string }) => void;
}

/**
 * Dialog form for adding or editing AWS accounts
 * Validates account ID is exactly 12 digits
 */
export function AccountForm({ account, open, onClose, onSave }: AccountFormProps) {
  const [accountId, setAccountId] = useState('');
  const [alias, setAlias] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Reset form when dialog opens/closes or account changes
  useEffect(() => {
    if (account) {
      setAccountId(account.accountId);
      setAlias(account.alias);
      setUsername(account.username || '');
    } else {
      setAccountId('');
      setAlias('');
      setUsername('');
    }
    setError('');
  }, [account, open]);

  // Validate AWS account ID format (12 digits)
  const validateAccountId = (value: string): boolean => {
    return /^\d{12}$/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!alias.trim()) {
      setError('Account alias is required');
      return;
    }

    if (!validateAccountId(accountId)) {
      setError('AWS Account ID must be exactly 12 digits');
      return;
    }

    onSave({
      accountId,
      alias: alias.trim(),
      username: username.trim() || undefined,
    });

    onClose();
  };

  // Only allow digits in account ID field
  const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAccountId(value);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Alias field */}
            <div className="space-y-2">
              <Label htmlFor="alias">Account Alias *</Label>
              <Input
                id="alias"
                placeholder="Production, Development, etc."
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                  setError('');
                }}
              />
            </div>

            {/* Account ID field */}
            <div className="space-y-2">
              <Label htmlFor="accountId">AWS Account ID *</Label>
              <Input
                id="accountId"
                placeholder="123456789012"
                value={accountId}
                onChange={handleAccountIdChange}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                12-digit account number ({accountId.length}/12)
              </p>
            </div>

            {/* Username field (optional) */}
            <div className="space-y-2">
              <Label htmlFor="username">IAM Username (optional)</Label>
              <Input
                id="username"
                placeholder="john.doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {account ? 'Update' : 'Add'} Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
