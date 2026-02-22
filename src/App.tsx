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
  migrateAccounts,
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
 * Apply theme to document
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
 * Main popup component for AWS Account Manager
 */
function App() {
  const [accounts, setAccounts] = useState<AWSAccount[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AWSAccount | undefined>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');

  // Load accounts and theme on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      // Migrate any legacy plain-text passwords to encrypted format
      await migrateAccounts();
      
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

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle theme change
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await saveTheme(newTheme);
  };

  // Reload accounts from storage
  const reloadAccounts = async () => {
    const data = await getAccounts();
    setAccounts(data);
  };

  // Handle save (create or update)
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

  // Open edit dialog
  const handleEdit = (account: AWSAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  // Delete account
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

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(undefined);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountId.includes(searchTerm)
  );

  // Loading state
  if (loading) {
    return (
      <div className="w-[440px] h-[600px] flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-[440px] h-[600px] flex flex-col bg-background overflow-hidden">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <AwsLogo className="h-5 w-auto" />
          <span className="font-bold text-lg">Account Manager</span>
        </div>
        <Button
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add
        </Button>
      </header>

      {/* Search and Theme Toggle */}
      <div className="px-5 py-4 border-b bg-card space-y-3">
        {accounts.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
        </div>
      </div>

      {/* Account list */}
      <main className="flex-1 overflow-y-auto p-5 bg-background">
        <AccountList
          accounts={filteredAccounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Footer */}
      {accounts.length > 0 && (
        <footer className="px-5 py-3 border-t bg-card text-sm text-muted-foreground text-center">
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} saved
        </footer>
      )}

      {/* Account form dialog */}
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
