import { useState, useEffect } from 'react';
import type { AWSAccount } from '@/types/account';
import {
  getAccounts,
  saveAccount,
  updateAccount,
  deleteAccount,
  accountIdExists,
} from '@/utils/storage';
import { AccountList } from '@/components/AccountList';
import { AccountForm } from '@/components/AccountForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { Toaster, toast } from 'sonner';

/**
 * Main popup component for AWS Account Manager
 * Manages account CRUD operations and displays the account list
 */
function App() {
  const [accounts, setAccounts] = useState<AWSAccount[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AWSAccount | undefined>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  const reloadAccounts = async () => {
    const data = await getAccounts();
    setAccounts(data);
  };

  // Handle save (create or update)
  const handleSave = async (data: {
    accountId: string;
    alias: string;
    username?: string;
  }) => {
    try {
      if (editingAccount) {
        // Update existing account
        await updateAccount(editingAccount.id, data);
        toast.success('Account updated successfully');
      } else {
        // Check for duplicate account ID
        const exists = await accountIdExists(data.accountId);
        if (exists) {
          toast.error('An account with this ID already exists');
          return;
        }
        // Create new account
        await saveAccount(data);
        toast.success('Account added successfully');
      }
      await reloadAccounts();
      setEditingAccount(undefined);
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  };

  // Open edit dialog with account data
  const handleEdit = (account: AWSAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  // Delete account with confirmation
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id);
        await reloadAccounts();
        toast.success('Account deleted');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  // Close form and reset editing state
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(undefined);
  };

  // Filter accounts by search term (alias or account ID)
  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountId.includes(searchTerm)
  );

  // Loading state
  if (loading) {
    return (
      <div className="w-[400px] h-[600px] p-4 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] p-4 bg-background flex flex-col">
      {/* Toast notifications */}
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">AWS Account Manager</h1>
        <Button size="sm" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Search bar (only show if accounts exist) */}
      {accounts.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Account list */}
      <div className="flex-1 overflow-y-auto">
        <AccountList
          accounts={filteredAccounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

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
