# AWS Account Manager Chrome Extension - System Documentation

## Project Overview

**Purpose:** Build a Chrome extension that stores AWS account IDs and auto-fills them on AWS signin pages. This solves the problem of managing multiple AWS accounts where browsers save username/password but not the account ID.

**User Flow:**
1. User adds AWS accounts via extension popup (account ID + friendly alias)
2. When visiting AWS signin page, extension detects the account ID field
3. Extension shows a dropdown or button near the field with saved accounts
4. User selects an account, and the ID auto-fills

**Tech Stack:**
- TypeScript (type safety and better DX)
- React (component-based UI)
- Vite (fast build tool with HMR)
- SWC (fast TypeScript/React compiler)
- shadcn/ui (clean, accessible components)
- Tailwind CSS (utility-first styling, required by shadcn)
- @crxjs/vite-plugin (Chrome extension bundling)

---

## Architecture Overview

### Chrome Extension Components

**1. Popup (React App)**
- The main UI users interact with
- Accessed by clicking extension icon
- Manages account CRUD operations
- Uses shadcn/ui components for clean UI

**2. Content Script**
- Runs on AWS signin pages
- Detects account ID input field
- Injects account selector UI
- Handles auto-fill logic

**3. Background Service Worker (optional for now)**
- Can be added later for advanced features
- Would handle cross-tab coordination
- Not required for MVP

**4. Storage**
- Uses Chrome's `chrome.storage.sync` API
- Syncs across user's Chrome instances
- Max 100KB but plenty for account IDs

---

## Project Setup - Step by Step

### Phase 1: Initial Scaffolding

**Step 1.1: Create Vite Project**
```bash
pnpm create vite aws-account-manager
# Select: React
# Select: TypeScript + SWC
cd aws-account-manager
pnpm install
```

**Why?** Vite + SWC gives us the fastest development experience. SWC (written in Rust) compiles TypeScript and JSX much faster than traditional Babel, making hot reload nearly instant.

**Step 1.2: Install Extension Dependencies**
```bash
pnpm add -D @crxjs/vite-plugin @types/chrome
```

**Explanation:**
- `@crxjs/vite-plugin`: Bridges Vite and Chrome Extension APIs. Handles manifest, multiple entry points (popup, content script), and proper bundling
- `@types/chrome`: TypeScript definitions for Chrome APIs like `chrome.storage`, `chrome.runtime`, etc.

**Step 1.3: Install shadcn/ui Prerequisites**
```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react
npx tailwindcss init -p
```

**Explanation:**
- Tailwind is required for shadcn/ui components
- `class-variance-authority`: Helps create component variants (primary button, secondary button, etc.)
- `clsx` + `tailwind-merge`: Utilities for conditional class names and avoiding Tailwind conflicts
- `lucide-react`: Icon library used by shadcn components

**Step 1.4: Initialize shadcn/ui**
```bash
pnpm dlx shadcn@latest init
```

**Configuration choices:**
- Style: Default
- Base color: Slate (clean, professional)
- CSS variables: Yes (easier theming)
- Import alias: @/components (cleaner imports)

**Why shadcn?** Unlike component libraries that you install entirely, shadcn copies individual components into your project. This means:
- Full control over component code
- No bloat from unused components
- Easy customization
- Components are accessible by default

---

### Phase 2: Chrome Extension Configuration

**Step 2.1: Create Manifest File**

Create `public/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "AWS Account Manager",
  "version": "1.0.0",
  "description": "Store and auto-fill AWS account IDs across multiple accounts",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://*.signin.aws.amazon.com/*"],
  "action": {
    "default_popup": "index.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["https://*.signin.aws.amazon.com/*"],
      "js": ["src/content/index.tsx"],
      "run_at": "document_idle"
    }
  ]
}
```

**Manifest Explained:**
- `manifest_version: 3`: Latest Chrome extension standard (Manifest V2 is deprecated)
- `permissions`:
  - `storage`: Access to chrome.storage API for saving accounts
  - `activeTab`: Access current tab when popup is open
- `host_permissions`: Allows content script to run on AWS signin pages
- `action.default_popup`: Points to your React app (Vite's index.html)
- `content_scripts`: Defines which script runs on which pages
  - `matches`: URL pattern for AWS signin
  - `run_at: document_idle`: Runs after DOM is loaded but before window.onload

**Step 2.2: Configure Vite for Extensions**

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**Explanation:**
- `crx({ manifest })`: Plugin reads manifest and builds extension properly
- `alias: '@'`: Allows clean imports like `@/components/ui/button` instead of `../../../components/ui/button`
- The CRX plugin handles:
  - Multiple entry points (popup, content script)
  - Proper code splitting
  - Hot reload for development
  - Production optimization

**Step 2.3: Update Tailwind Config**

Update `tailwind.config.js`:

```javascript
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Why this matters:** Tells Tailwind to scan these files for class names. Without this, your styles won't work.

**Step 2.4: Add Global Styles**

Update `src/index.css` to include Tailwind and CSS variables for shadcn:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
```

**Explanation:** These CSS variables control your entire color scheme. shadcn components use these, so changing colors is as simple as updating these values.

**Step 2.5: Add Extension Icons**

Create or download 3 PNG icons (16x16, 48x48, 128x128) and place in `public/`:
- `icon16.png` - Shown in toolbar
- `icon48.png` - Shown in extension management
- `icon128.png` - Shown in Chrome Web Store

**Tip:** Use a tool like Figma or find free AWS-themed icons. Keep them simple and recognizable.

---

### Phase 3: Project Structure

**Step 3.1: Create Folder Structure**

```
src/
├── components/
│   ├── ui/              # shadcn components (auto-generated)
│   ├── AccountList.tsx  # Custom: displays saved accounts
│   ├── AccountForm.tsx  # Custom: form to add/edit account
│   └── AccountItem.tsx  # Custom: single account card
├── content/
│   └── index.tsx        # Content script for AWS pages
├── lib/
│   └── utils.ts         # Utility functions (cn helper, etc.)
├── types/
│   └── account.ts       # TypeScript interfaces
├── utils/
│   └── storage.ts       # Chrome storage wrapper functions
├── App.tsx              # Main popup component
├── main.tsx             # Popup entry point
└── index.css            # Global styles
```

**Why this structure?**
- `components/`: React components (UI components separate from business logic)
- `content/`: Isolated folder for content script code
- `lib/`: Shared utilities (shadcn convention)
- `types/`: TypeScript interfaces for type safety
- `utils/`: Business logic utilities (storage operations)

**Step 3.2: Create Type Definitions**

Create `src/types/account.ts`:

```typescript
export interface AWSAccount {
  id: string;              // Unique identifier (UUID)
  accountId: string;       // AWS Account ID (12 digits)
  alias: string;           // Friendly name (e.g., "Production", "Dev")
  username?: string;       // Optional: IAM username
  createdAt: number;       // Timestamp
  updatedAt: number;       // Timestamp
}

export interface StorageData {
  accounts: AWSAccount[];
}
```

**Explanation:**
- `id`: We generate this (use `crypto.randomUUID()`)
- `accountId`: The 12-digit AWS account number
- `alias`: Human-readable name so users remember which is which
- Timestamps: Good practice for data tracking
- `StorageData`: Wrapper interface for what goes in chrome.storage

---

### Phase 4: Storage Layer

**Step 4.1: Create Storage Utilities**

Create `src/utils/storage.ts`:

```typescript
import { AWSAccount, StorageData } from '@/types/account';

const STORAGE_KEY = 'aws_accounts';

/**
 * Get all saved AWS accounts
 * Uses chrome.storage.sync to sync across devices
 */
export async function getAccounts(): Promise<AWSAccount[]> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    const data: StorageData = result[STORAGE_KEY] || { accounts: [] };
    return data.accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

/**
 * Save a new AWS account
 */
export async function saveAccount(account: Omit<AWSAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<AWSAccount> {
  const accounts = await getAccounts();
  
  const newAccount: AWSAccount = {
    ...account,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  accounts.push(newAccount);
  
  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts } });
  
  return newAccount;
}

/**
 * Update an existing account
 */
export async function updateAccount(id: string, updates: Partial<Omit<AWSAccount, 'id' | 'createdAt'>>): Promise<AWSAccount | null> {
  const accounts = await getAccounts();
  const index = accounts.findIndex(acc => acc.id === id);
  
  if (index === -1) return null;
  
  accounts[index] = {
    ...accounts[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts } });
  
  return accounts[index];
}

/**
 * Delete an account by ID
 */
export async function deleteAccount(id: string): Promise<boolean> {
  const accounts = await getAccounts();
  const filtered = accounts.filter(acc => acc.id !== id);
  
  if (filtered.length === accounts.length) return false;
  
  await chrome.storage.sync.set({ [STORAGE_KEY]: { accounts: filtered } });
  
  return true;
}
```

**Key Concepts:**
- **chrome.storage.sync**: Data syncs across user's Chrome browsers (vs. local which doesn't sync)
- **Promise-based**: All Chrome storage operations are async, we use async/await
- **Error handling**: Always wrap in try/catch as storage can fail
- **TypeScript Omit**: `Omit<AWSAccount, 'id'>` means "AWSAccount but without id field" - useful when creating new accounts where we generate the ID

---

### Phase 5: Popup UI Components

**Step 5.1: Install shadcn Components**

```bash
pnpm dlx shadcn@latest add button card input label dialog alert
```

**What this does:** Copies component files to `src/components/ui/`. These are fully editable React components.

**Step 5.2: Create Utils Helper**

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Explanation:** The `cn` helper merges class names intelligently, preventing Tailwind conflicts. Example: `cn('p-4', 'p-2')` results in just `p-2` (the latter wins).

**Step 5.3: Build AccountItem Component**

Create `src/components/AccountItem.tsx`:

```typescript
import { AWSAccount } from '@/types/account';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Edit } from 'lucide-react';

interface AccountItemProps {
  account: AWSAccount;
  onEdit: (account: AWSAccount) => void;
  onDelete: (id: string) => void;
}

export function AccountItem({ account, onEdit, onDelete }: AccountItemProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(account.accountId);
    // TODO: Add toast notification
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{account.alias}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(account)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(account.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">Account ID: {account.accountId}</p>
        {account.username && (
          <p className="text-xs text-muted-foreground">Username: {account.username}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Learning Points:**
- Uses shadcn `Card` for clean layout
- `lucide-react` icons for actions
- Props typed with TypeScript interface
- Async clipboard API for copying
- `variant="ghost"` creates subtle icon buttons

**Step 5.4: Build AccountForm Component**

Create `src/components/AccountForm.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { AWSAccount } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AccountFormProps {
  account?: AWSAccount; // undefined = new account, defined = editing
  open: boolean;
  onClose: () => void;
  onSave: (data: { accountId: string; alias: string; username?: string }) => void;
}

export function AccountForm({ account, open, onClose, onSave }: AccountFormProps) {
  const [accountId, setAccountId] = useState('');
  const [alias, setAlias] = useState('');
  const [username, setUsername] = useState('');

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
  }, [account, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId || !alias) return;
    
    onSave({
      accountId,
      alias,
      username: username || undefined,
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="alias">Account Alias *</Label>
              <Input
                id="alias"
                placeholder="Production, Development, etc."
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountId">AWS Account ID *</Label>
              <Input
                id="accountId"
                placeholder="123456789012"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                pattern="\d{12}"
                maxLength={12}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">12-digit account number</p>
            </div>
            <div>
              <Label htmlFor="username">IAM Username (optional)</Label>
              <Input
                id="username"
                placeholder="john.doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
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
```

**Learning Points:**
- `Dialog` from shadcn creates a modal
- Controlled inputs with React state
- `pattern="\d{12}"` validates 12 digits (HTML5 validation)
- Form submission with `e.preventDefault()`
- Conditional rendering for edit vs. create

**Step 5.5: Build AccountList Component**

Create `src/components/AccountList.tsx`:

```typescript
import { AWSAccount } from '@/types/account';
import { AccountItem } from './AccountItem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface AccountListProps {
  accounts: AWSAccount[];
  onEdit: (account: AWSAccount) => void;
  onDelete: (id: string) => void;
}

export function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
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
```

**Learning Points:**
- Empty state with helpful message
- Map over accounts to render list
- Key prop required for lists (using unique ID)

**Step 5.6: Build Main App Component**

Update `src/App.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { AWSAccount } from '@/types/account';
import { getAccounts, saveAccount, updateAccount, deleteAccount } from '@/utils/storage';
import { AccountList } from '@/components/AccountList';
import { AccountForm } from '@/components/AccountForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function App() {
  const [accounts, setAccounts] = useState<AWSAccount[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AWSAccount | undefined>();
  const [loading, setLoading] = useState(true);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    const data = await getAccounts();
    setAccounts(data);
    setLoading(false);
  };

  const handleSave = async (data: { accountId: string; alias: string; username?: string }) => {
    if (editingAccount) {
      await updateAccount(editingAccount.id, data);
    } else {
      await saveAccount(data);
    }
    await loadAccounts();
    setEditingAccount(undefined);
  };

  const handleEdit = (account: AWSAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      await deleteAccount(id);
      await loadAccounts();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(undefined);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-[400px] h-[600px] p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">AWS Account Manager</h1>
        <Button size="sm" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </Button>
      </div>

      <AccountList
        accounts={accounts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
```

**Learning Points:**
- State management with `useState`
- Side effects with `useEffect` (loads data on mount)
- Async operations in event handlers
- Loading state for better UX
- Fixed size popup (400x600px is standard)
- Composition pattern: App orchestrates child components

---

### Phase 6: Content Script for Auto-Fill

**Step 6.1: Understanding Content Scripts**

Content scripts run in the context of web pages. They can:
- Access and modify the DOM
- Listen to page events
- NOT directly access Chrome APIs (must message background)
- Run in an isolated JavaScript environment

**Step 6.2: Create Content Script**

Create `src/content/index.tsx`:

```typescript
import { createRoot } from 'react-dom/client';
import { getAccounts } from '@/utils/storage';
import { AWSAccount } from '@/types/account';
import '../index.css'; // Import Tailwind styles

// Selector for AWS account ID input field
const ACCOUNT_ID_SELECTOR = 'input[name="account"]';

/**
 * Main content script logic
 */
async function init() {
  // Wait for the account ID field to appear
  const accountField = await waitForElement<HTMLInputElement>(ACCOUNT_ID_SELECTOR);
  
  if (!accountField) {
    console.log('AWS account field not found');
    return;
  }

  console.log('AWS Account Manager: Field detected');

  // Load saved accounts
  const accounts = await getAccounts();

  if (accounts.length === 0) {
    console.log('No accounts saved');
    return;
  }

  // Inject our UI
  injectAccountSelector(accountField, accounts);
}

/**
 * Wait for an element to appear in the DOM
 */
function waitForElement<T extends HTMLElement>(selector: string, timeout = 5000): Promise<T | null> {
  return new Promise((resolve) => {
    const element = document.querySelector<T>(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Inject account selector UI near the input field
 */
function injectAccountSelector(inputField: HTMLInputElement, accounts: AWSAccount[]) {
  // Create container for our React component
  const container = document.createElement('div');
  container.id = 'aws-account-manager-selector';
  
  // Insert after the input field
  inputField.parentElement?.insertBefore(container, inputField.nextSibling);

  // Render React component
  const root = createRoot(container);
  root.render(<AccountSelector accounts={accounts} onSelect={(accountId) => {
    inputField.value = accountId;
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.dispatchEvent(new Event('change', { bubbles: true }));
  }} />);
}

/**
 * Account Selector Component
 */
interface AccountSelectorProps {
  accounts: AWSAccount[];
  onSelect: (accountId: string) => void;
}

function AccountSelector({ accounts, onSelect }: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {isOpen ? 'Hide' : 'Select'} saved account
      </button>

      {isOpen && (
        <div className="mt-2 p-2 bg-white border border-gray-200 rounded shadow-lg">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => {
                onSelect(account.accountId);
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <div className="font-medium">{account.alias}</div>
              <div className="text-gray-500 text-xs">{account.accountId}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

**Learning Points:**
- **MutationObserver**: Watches for DOM changes. AWS might load fields dynamically.
- **createRoot**: React 18 way to render into DOM
- **Event dispatching**: After setting `input.value`, we dispatch events so AWS's JavaScript knows the field changed
- **Content script isolation**: We can use React here, and it won't conflict with AWS's JavaScript
- **Tailwind in content scripts**: Our styles are scoped and won't affect AWS's page

---

### Phase 7: Testing & Development

**Step 7.1: Run Development Server**

```bash
pnpm dev
```

**What happens:**
- Vite starts dev server
- CRX plugin watches for changes
- Build output goes to `dist/` folder
- Hot reload works for popup
- Content script requires manual extension reload

**Step 7.2: Load Extension in Chrome**

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist/` folder from your project
5. Extension appears in toolbar

**Step 7.3: Test Popup**

1. Click extension icon
2. Should see clean shadcn UI
3. Try adding an account
4. Verify it saves (check by closing and reopening popup)
5. Test edit and delete

**Debugging Popup:**
- Right-click extension icon → Inspect popup
- Console errors appear in DevTools
- React DevTools extension works

**Step 7.4: Test Content Script**

1. Navigate to AWS signin page: `https://console.aws.amazon.com/`
2. Look for account ID field
3. Should see "Select saved account" button
4. Click it and verify accounts appear
5. Select an account and verify it fills the field

**Debugging Content Script:**
- Open regular DevTools on AWS page (F12)
- Console logs from content script appear here
- Check for errors

**Step 7.5: Test Storage**

In popup DevTools console:

```javascript
// Check what's stored
chrome.storage.sync.get('aws_accounts', console.log)

// Clear storage (for testing)
chrome.storage.sync.clear()
```

---

### Phase 8: Enhancements & Polish

**Step 8.1: Add Toast Notifications**

Install sonner (toast library that works well with shadcn):

```bash
pnpm add sonner
```

Add to `App.tsx`:

```typescript
import { Toaster } from 'sonner';
import { toast } from 'sonner';

// In component
<Toaster />

// When copying:
toast.success('Account ID copied to clipboard');
```

**Step 8.2: Add Validation**

- Validate AWS account ID is exactly 12 digits
- Prevent duplicate account IDs
- Add better error messages

**Step 8.3: Add Search/Filter**

If user has many accounts:

```typescript
const [searchTerm, setSearchTerm] = useState('');

const filteredAccounts = accounts.filter(acc =>
  acc.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
  acc.accountId.includes(searchTerm)
);
```

**Step 8.4: Add Export/Import**

Allow users to backup their accounts:

```typescript
// Export
const exportData = () => {
  const json = JSON.stringify({ accounts }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aws-accounts-backup.json';
  a.click();
};

// Import
const importData = (file: File) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = JSON.parse(e.target?.result as string);
    // Validate and save
  };
  reader.readAsText(file);
};
```

---

### Phase 9: Production Build

**Step 9.1: Build for Production**

```bash
pnpm build
```

**What happens:**
- Vite optimizes code
- Minifies JavaScript
- Removes dev dependencies
- Output in `dist/`

**Step 9.2: Test Production Build**

Load the production `dist/` folder in Chrome and test thoroughly.

**Step 9.3: Package for Distribution**

1. Zip the `dist/` folder
2. Upload to Chrome Web Store
3. Fill in store listing (description, screenshots, privacy policy)

---

## Security Considerations

**Storage Security:**
- Account IDs are not highly sensitive (not passwords)
- chrome.storage.sync is reasonably secure
- For production, consider encrypting data with Web Crypto API
- Never store passwords in plain text

**Content Script Security:**
- Run only on AWS domains (manifest permissions)
- Don't execute arbitrary code
- Sanitize any user input before DOM injection

**Privacy Policy:**
Required for Chrome Web Store:
- State that you store AWS account IDs locally
- Mention no data is sent to external servers
- Note that chrome.storage.sync syncs to user's Google account

---

## Common Issues & Solutions

**Issue: Content script not injecting**
- Check manifest `matches` pattern is correct
- Verify AWS page structure hasn't changed
- Check console for errors
- Ensure content script is included in build

**Issue: Storage not persisting**
- Check chrome.storage permissions in manifest
- Verify data structure is JSON-serializable
- Check storage quota (100KB limit for sync)

**Issue: Styles not working in content script**
- Import CSS in content script file
- Use !important if AWS styles override yours
- Consider using Shadow DOM for total isolation

**Issue: Hot reload not working**
- Refresh extension manually in chrome://extensions
- Reload AWS page after changes
- Check Vite dev server is running

---

## Next Steps & Advanced Features

**Phase 10: Advanced Features (Future)**

1. **Keyboard Shortcuts**
   - Quick-fill with Ctrl+Shift+A
   - Cycle through accounts

2. **Multi-field Auto-fill**
   - Fill username automatically too
   - Remember last used account per domain

3. **Account Groups**
   - Organize by environment (prod, staging, dev)
   - Color coding

4. **Cloud Sync Alternative**
   - Sync via user's cloud storage
   - More than 100KB limit

5. **Audit Log**
   - Track when accounts were used
   - Export usage reports

6. **Browser Extension (Firefox, Edge)**
   - Same codebase, different manifest tweaks
   - Use WebExtension Polyfill

---

## File Checklist

Before considering the project complete:

- [ ] All TypeScript files have proper types (no `any`)
- [ ] All shadcn components installed and working
- [ ] Manifest V3 properly configured
- [ ] Content script detects AWS field correctly
- [ ] Storage operations work (CRUD)
- [ ] Popup UI is responsive and clean
- [ ] Error handling in place
- [ ] Console errors are resolved
- [ ] Extension works in incognito mode
- [ ] README.md written with setup instructions
- [ ] Icons created and referenced
- [ ] Privacy policy drafted

---

## Resources

**Documentation:**
- Chrome Extensions: https://developer.chrome.com/docs/extensions/
- Vite: https://vitejs.dev/
- shadcn/ui: https://ui.shadcn.com/
- React: https://react.dev/

**Tools:**
- Chrome DevTools for Extensions
- React DevTools
- Vite DevTools

---

This system document should give you (and Claude Code) everything needed to build a production-ready AWS Account Manager extension. Follow the phases in order, test frequently, and don't hesitate to iterate on the UI/UX based on actual usage.

Good luck building! 🚀