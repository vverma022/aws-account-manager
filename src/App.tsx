import { useState, useEffect } from 'react';
import type { AWSAccount } from '@/types/account';
import {
  getAccounts,
  saveAccount,
  updateAccount,
  deleteAccount,
  accountIdExists,
  getTheme,
  setTheme as saveTheme,
} from '@/utils/storage';
import { AccountList } from '@/components/AccountList';
import { AccountForm } from '@/components/AccountForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AwsLogo } from '@/components/AwsLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { Toaster, toast } from 'sonner';

/**
 * Apply theme class to the document root
 */
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

/**
 * Main popup component — DepthUI layered layout.
 * 
 * Depth hierarchy:
 *   bg-dark  → page background (deepest)
 *   bg       → header/footer panels (middle)
 *   bg-light → interactive buttons and inputs (top)
 */
function App() {
  const [accounts, setAccounts] = useState<AWSAccount[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AWSAccount | undefined>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [accountsData, savedTheme] = await Promise.all([
        getAccounts(),
        getTheme(),
      ]);
      setAccounts(accountsData);
      setThemeState(savedTheme);
      applyTheme(savedTheme);
      setLoading(false);
    };
    init();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await saveTheme(newTheme);
  };

  const reloadAccounts = async () => {
    const data = await getAccounts();
    setAccounts(data);
  };

  const handleSave = async (data: {
    accountId: string;
    alias: string;
    username?: string;
    password?: string;
    signinUrl?: string;
  }) => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, data);
        toast.success('Account updated');
      } else {
        const exists = await accountIdExists(data.accountId);
        if (exists) {
          toast.error('This account ID already exists');
          return;
        }
        await saveAccount(data);
        toast.success('Account added');
      }
      await reloadAccounts();
      setEditingAccount(undefined);
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  };

  const handleEdit = (account: AWSAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this account?')) {
      try {
        await deleteAccount(id);
        await reloadAccounts();
        toast.success('Account deleted');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(undefined);
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountId.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="w-[440px] h-[600px] flex items-center justify-center bg-bg-dark">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-[440px] h-[600px] flex flex-col bg-bg-dark overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />

      {/* Header — middle depth layer (bg-surface) with bottom shadow */}
      <header className="flex items-center justify-between px-5 py-4 bg-bg-surface shadow-small">
        <div className="flex items-center gap-3">
          <AwsLogo className="h-5 w-auto" />
          <span className="font-bold text-lg text-text-primary">Account Manager</span>
        </div>
        <Button
          size="sm"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add
        </Button>
      </header>

      {/* Search + theme controls — middle depth layer */}
      <div className="px-5 py-4 bg-bg-surface space-y-3 shadow-small">
        {accounts.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Theme</span>
          <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
        </div>
      </div>

      {/* Account list — deepest layer (bg-dark) so cards float above */}
      <main className="flex-1 overflow-y-auto p-5 bg-bg-dark">
        <AccountList
          accounts={filteredAccounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Footer — middle depth layer */}
      {accounts.length > 0 && (
        <footer className="px-5 py-3 bg-bg-surface text-sm text-text-muted text-center shadow-small">
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} saved
        </footer>
      )}

      <AccountForm
        account={editingAccount}
        open={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
      />
    </div>
  );
}

export default App;
