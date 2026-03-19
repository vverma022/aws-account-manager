import type { AWSAccount } from '@/types/account';

const DEFAULT_SIGNIN_URL = 'https://signin.aws.amazon.com/console';
const CONSOLE_URL = 'https://console.aws.amazon.com/';

const AWS_COOKIE_DOMAINS = [
  'signin.aws.amazon.com',
  'aws.amazon.com',
  'console.aws.amazon.com',
];

export const LOGIN_RESULT_SWITCHED = 'switched' as const;
export const LOGIN_RESULT_SIGNIN = 'signin' as const;

export type AwsLoginResult = typeof LOGIN_RESULT_SWITCHED | typeof LOGIN_RESULT_SIGNIN;

function extractAccountIdFromPage() {
  const meta = document.querySelector('meta[name="awsc-session-data"]');
  const content = meta?.getAttribute('content');
  if (!content) return null;
  const match = content.match(/"accountId":"(\d+)"/);
  return match ? match[1] : null;
}

async function getCurrentAwsAccountAndTab(): Promise<{
  accountId: string;
  tabId: number;
  windowId: number;
} | null> {
  const tabs = await chrome.tabs.query({ url: 'https://*.console.aws.amazon.com/*' });
  for (const tab of tabs) {
    if (tab.id == null) continue;
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractAccountIdFromPage,
      });
      const accountId = result?.result;
      if (accountId) {
        return { accountId, tabId: tab.id, windowId: tab.windowId ?? 0 };
      }
    } catch {
      // Tab may be loading or restricted; skip
    }
  }
  return null;
}

async function openConsoleAndGetAccount(): Promise<
  | { accountId: string; tabId: number; windowId: number }
  | { tabId: number; accountId: null }
> {
  const tab = await chrome.tabs.create({ url: CONSOLE_URL });
  const tabId = tab.id;
  if (tabId == null) throw new Error('Failed to create tab');

  // Wait for the tab to finish loading (handles redirects to sign-in)
  await new Promise((resolve) => {
    const listener = (id: number, info: { status?: string }) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(undefined);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve(undefined);
    }, 8000);
  });

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractAccountIdFromPage,
    });
    const accountId = result?.result;
    if (accountId) {
      return { accountId, tabId, windowId: tab.windowId ?? 0 };
    }
  } catch {
    // Page may have redirected to sign-in; script injection can fail
  }
  return { tabId, accountId: null };
}

async function clearAwsSessionCookies() {
  for (const domain of AWS_COOKIE_DOMAINS) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      const baseUrl = `https://${domain}`;
      await Promise.all(
        cookies.map((cookie) =>
          chrome.cookies.remove({ url: baseUrl + (cookie.path || '/'), name: cookie.name })
        )
      );
    } catch (err) {
      console.warn(`AWS Account Manager: Could not clear cookies for ${domain}`, err);
    }
  }
}

async function openAndFillCredentials(account: AWSAccount) {
  await clearAwsSessionCookies();

  const signinUrl = account.signinUrl || DEFAULT_SIGNIN_URL;

  await chrome.storage.local.set({
    pendingCredentials: {
      accountId: account.accountId,
      username: account.username || '',
      password: account.password || '',
      timestamp: Date.now(),
    },
  });

  chrome.tabs.create({ url: signinUrl });
}

export async function loginToAwsAccount(account: AWSAccount): Promise<AwsLoginResult> {
  let current = await getCurrentAwsAccountAndTab();
  let probeTabId = null;

  if (!current) {
    const probe = await openConsoleAndGetAccount();
    probeTabId = probe.tabId;
    if (probe.accountId) {
      current = { accountId: probe.accountId, tabId: probe.tabId, windowId: probe.windowId ?? 0 };
    }
  }

  if (current && current.accountId === account.accountId) {
    await chrome.tabs.update(current.tabId, { active: true });
    if (current.windowId) {
      await chrome.windows.update(current.windowId, { focused: true });
    }
    return LOGIN_RESULT_SWITCHED;
  }

  if (probeTabId) {
    await chrome.tabs.remove(probeTabId);
  }
  await openAndFillCredentials(account);
  return LOGIN_RESULT_SIGNIN;
}
