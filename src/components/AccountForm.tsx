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
  DialogDescription,
} from '@/components/ui/dialog';
import { Eye, EyeOff } from 'lucide-react';

interface AccountFormProps {
  account?: AWSAccount;
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    accountId: string;
    alias: string;
    username?: string;
    password?: string;
    signinUrl?: string;
  }) => void;
}

const DEFAULT_SIGNIN_URL = 'https://signin.aws.amazon.com/console';

/**
 * Dialog form for adding or editing AWS accounts.
 * The dialog itself is a top-layer DepthUI surface (shadow-large).
 * Input fields are recessed (shadow-recessed) to sit below the dialog surface.
 */
export function AccountForm({ account, open, onClose, onSave }: AccountFormProps) {
  const [accountId, setAccountId] = useState('');
  const [alias, setAlias] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signinUrl, setSigninUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (account) {
        setAccountId(account.accountId);
        setAlias(account.alias);
        setUsername(account.username || '');
        // Password is always a string here (decrypted by getAccounts)
        setPassword(typeof account.password === 'string' ? account.password : '');
        setSigninUrl(account.signinUrl || '');
      } else {
        setAccountId('');
        setAlias('');
        setUsername('');
        setPassword('');
        setSigninUrl('');
      }
      setError('');
      setShowPassword(false);
    }
  }, [account, open]);

  const validateAccountId = (value: string): boolean => {
    return /^\d{12}$/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!alias.trim()) {
      setError('Please enter an account name');
      return;
    }

    if (!validateAccountId(accountId)) {
      setError('Account ID must be exactly 12 digits');
      return;
    }

    onSave({
      accountId,
      alias: alias.trim(),
      username: username.trim() || undefined,
      password: password || undefined,
      signinUrl: signinUrl.trim() || undefined,
    });

    onClose();
  };

  const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAccountId(value);
    setError('');
  };

  const isEditing = !!account;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[420px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-text-primary">
            {isEditing ? 'Edit Account' : 'Add Account'}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            {isEditing
              ? 'Update your AWS account details'
              : 'Enter your AWS account credentials for one-click login'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="alias" className="text-sm font-semibold text-text-primary">
                Account Name
              </Label>
              <Input
                id="alias"
                placeholder="e.g., Production, Development"
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                  setError('');
                }}
                className="h-11"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-sm font-semibold text-text-primary">
                Account ID
              </Label>
              <Input
                id="accountId"
                placeholder="123456789012"
                value={accountId}
                onChange={handleAccountIdChange}
                className="h-11 font-mono tracking-wider"
              />
              <p className="text-xs text-text-muted">
                {accountId.length}/12 digits
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-text-primary">
                IAM Username{' '}
                <span className="text-text-muted font-normal">(optional)</span>
              </Label>
              <Input
                id="username"
                placeholder="john.doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-text-primary">
                Password{' '}
                <span className="text-text-muted font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-text-muted" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-text-muted">
                Stored locally in Chrome. Never sent to any server.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signinUrl" className="text-sm font-semibold text-text-primary">
                Signin URL{' '}
                <span className="text-text-muted font-normal">(optional)</span>
              </Label>
              <Input
                id="signinUrl"
                type="url"
                placeholder={DEFAULT_SIGNIN_URL}
                value={signinUrl}
                onChange={(e) => setSigninUrl(e.target.value)}
                className="h-11 text-sm"
              />
              <p className="text-xs text-text-muted">
                Custom signin URL or leave empty for default
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-[8px]">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 p-6 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
            >
              {isEditing ? 'Save Changes' : 'Add Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
