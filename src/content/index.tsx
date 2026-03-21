/**
 * Content script for AWS signin pages
 * Detects pending credentials and auto-fills the login form
 */

interface PendingCredentials {
  accountId: string;
  username: string;
  password: string;
  timestamp: number;
}

/** IAM sign-in is split across pages; keep pending creds until the last stored field is filled. */
const CREDENTIAL_TTL_MS = 120000;
function isLikelyVisibleInput(el: HTMLInputElement): boolean {
  if (el.disabled || el.readOnly) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function findAccountIdField(): HTMLInputElement | null {
  const selectors = [
    'input[name="account"]',
    'input[id="account"]',
    'input[placeholder*="Account ID" i]',
    'input[placeholder*="account ID" i]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLInputElement>(sel);
    if (el && isLikelyVisibleInput(el)) return el;
  }
  return null;
}

/**
 * Resolves the IAM username field (labels vary by AWS UI revision).
 */
function findUsernameField(): HTMLInputElement | null {
  const selectors = [
    'input[name="username"]',
    'input[id="username"]',
    'input[autocomplete="username"]',
    'input[name="userName"]',
    'input[id="userName"]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLInputElement>(sel);
    if (el && isLikelyVisibleInput(el)) return el;
  }
  return null;
}

/**
 * Picks the first visible password input (avoids hidden duplicate fields).
 */
function findPasswordField(): HTMLInputElement | null {
  const inputs = document.querySelectorAll<HTMLInputElement>('input[type="password"]');
  for (const el of inputs) {
    if (isLikelyVisibleInput(el)) return el;
  }
  const byName = document.querySelector<HTMLInputElement>(
    'input[type="password"][name="password"], input[type="password"][id="password"]'
  );
  if (byName && isLikelyVisibleInput(byName)) return byName;
  return null;
}

/** Extends TTL while the user moves through multi-step sign-in. */
async function touchPendingCredentialsTimestamp() {
  const result = await chrome.storage.local.get('pendingCredentials');
  const cred = result.pendingCredentials as PendingCredentials | undefined;
  if (!cred) return;
  await chrome.storage.local.set({
    pendingCredentials: { ...cred, timestamp: Date.now() },
  });
}

// Check for pending credentials when page loads
async function checkAndFillCredentials() {
  try {
    const result = await chrome.storage.local.get('pendingCredentials');
    const credentials = result.pendingCredentials as PendingCredentials | undefined;

    if (!credentials) return;

    const age = Date.now() - credentials.timestamp;
    if (age > CREDENTIAL_TTL_MS) {
      await chrome.storage.local.remove('pendingCredentials');
      return;
    }

    console.log('AWS Account Manager: Found pending credentials, attempting to fill...');

    await waitForElement('input');

    const accountIdField = findAccountIdField();
    const usernameField = findUsernameField();
    const passwordField = findPasswordField();

    let filledAccount = false;
    let filledUsername = false;
    let filledPassword = false;

    if (accountIdField && credentials.accountId?.trim()) {
      fillInput(accountIdField, credentials.accountId.trim());
      filledAccount = true;
      console.log('AWS Account Manager: Filled account ID');
    }

    if (usernameField && credentials.username?.trim()) {
      fillInput(usernameField, credentials.username.trim());
      filledUsername = true;
      console.log('AWS Account Manager: Filled username');
    }

    if (passwordField && credentials.password?.trim()) {
      fillInput(passwordField, credentials.password.trim());
      filledPassword = true;
      console.log('AWS Account Manager: Filled password');
    }

    const needsPassword = Boolean(credentials.password?.trim());
    const needsUsername = Boolean(credentials.username?.trim());
    const needsAccount = Boolean(credentials.accountId?.trim());

    // One field per step is typical; clear only after the final stored value is applied.
    const shouldClear = needsPassword
      ? filledPassword
      : needsUsername
        ? filledUsername
        : needsAccount
          ? filledAccount
          : true;

    if (shouldClear) {
      await chrome.storage.local.remove('pendingCredentials');
      console.log('AWS Account Manager: Credentials filled and cleared');
    } else {
      await touchPendingCredentialsTimestamp();
      console.log(
        'AWS Account Manager: Partial fill — keeping pending credentials for next sign-in step'
      );
    }
  } catch (error) {
    console.error('AWS Account Manager: Error filling credentials', error);
  }
}

/**
 * Fill an input field and trigger necessary events
 */
function fillInput(input: HTMLInputElement, value: string) {
  // Focus the input
  input.focus();

  // Set the value
  input.value = value;

  // Trigger events to notify the page of the change
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

  // Some AWS pages use React, so we need to trigger the native setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * Wait for an element to appear in the DOM
 */
function waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndFillCredentials);
} else {
  checkAndFillCredentials();
}

// Retry for multi-step / SPA sign-in after inputs mount
[1000, 2000, 4000, 6000].forEach((ms) => setTimeout(checkAndFillCredentials, ms));
