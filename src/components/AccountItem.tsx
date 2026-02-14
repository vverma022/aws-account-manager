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

// Default AWS signin URL
const DEFAULT_SIGNIN_URL = 'https://signin.aws.amazon.com/console';

/**
 * Opens AWS signin page and attempts to pre-fill credentials
 */
function openAndFillCredentials(account: AWSAccount) {
  const signinUrl = account.signinUrl || DEFAULT_SIGNIN_URL;
  
  // Build URL with account ID parameter
  const url = new URL(signinUrl);
  
  // Store credentials temporarily for content script to use
  chrome.storage.local.set({
    pendingCredentials: {
      accountId: account.accountId,
      username: account.username || '',
      password: account.password || '',
      timestamp: Date.now(),
    }
  });
  
  // Open the signin page
  chrome.tabs.create({ url: url.toString() });
}

/**
 * Displays a single AWS account card with actions
 */
export function AccountItem({ account, onEdit, onDelete }: AccountItemProps) {
  // Copy account ID to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountId);
      toast.success('Account ID copied!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    }
  };

  // Open AWS signin with pre-filled credentials
  const handleLogin = () => {
    openAndFillCredentials(account);
    toast.success('Opening AWS signin...');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 rounded-xl border-2 hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Account info */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-bold text-lg truncate">
              {account.alias}
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono text-sm tracking-wider">{account.accountId}</span>
              </div>
              
              {account.username && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{account.username}</span>
                </div>
              )}
              
              {account.password && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Key className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">••••••••</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {/* Primary action - Login */}
            <Button
              size="sm"
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              onClick={handleLogin}
              title="Open & Login"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Login
            </Button>
            
            {/* Secondary actions */}
            <div className="flex items-center gap-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent hover:text-primary"
                onClick={handleCopy}
                title="Copy Account ID"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent hover:text-primary"
                onClick={() => onEdit(account)}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
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
