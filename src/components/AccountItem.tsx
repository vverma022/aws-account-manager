import type { AWSAccount } from '@/types/account';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Pencil, User, Hash, ExternalLink, Key } from 'lucide-react';
import { toast } from 'sonner';

interface AccountItemProps {
  account: AWSAccount;
  onEdit: (account: AWSAccount) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_SIGNIN_URL = 'https://signin.aws.amazon.com/console';

/**
 * Opens AWS signin page and stores credentials for the content script
 */
function openAndFillCredentials(account: AWSAccount) {
  const signinUrl = account.signinUrl || DEFAULT_SIGNIN_URL;
  const url = new URL(signinUrl);
  
  chrome.storage.local.set({
    pendingCredentials: {
      accountId: account.accountId,
      username: account.username || '',
      password: account.password || '',
      timestamp: Date.now(),
    }
  });
  
  chrome.tabs.create({ url: url.toString() });
}

/**
 * Account card — DepthUI middle-layer surface that floats above the page.
 * Uses Card's built-in shadow-small + hover lift.
 * Action buttons use ghost/primary variants for clear interactive hierarchy.
 */
export function AccountItem({ account, onEdit, onDelete }: AccountItemProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountId);
      toast.success('Account ID copied!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    }
  };

  const handleLogin = () => {
    openAndFillCredentials(account);
    toast.success('Opening AWS signin...');
  };

  return (
    <Card className="group">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-bold text-lg truncate text-text-primary">
              {account.alias}
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-text-muted">
                <Hash className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono text-sm tracking-wider">{account.accountId}</span>
              </div>
              
              {account.username && (
                <div className="flex items-center gap-2 text-text-muted">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{account.username}</span>
                </div>
              )}
              
              {account.password && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Key className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">••••••••</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handleLogin}
              title="Open & Login"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Login
            </Button>
            
            <div className="flex items-center gap-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
                title="Copy Account ID"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(account)}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(account.id)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
