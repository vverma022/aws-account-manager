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

// Check for pending credentials when page loads
async function checkAndFillCredentials() {
  try {
    const result = await chrome.storage.local.get('pendingCredentials');
    const credentials = result.pendingCredentials as PendingCredentials | undefined;

    if (!credentials) return;

    // Check if credentials are recent (within 30 seconds)
    const age = Date.now() - credentials.timestamp;
    if (age > 30000) {
      // Clear old credentials
      await chrome.storage.local.remove('pendingCredentials');
      return;
    }

    console.log('AWS Account Manager: Found pending credentials, attempting to fill...');

    // Wait for the page to fully load
    await waitForElement('input');

    // Try to fill the account ID field
    const accountIdField = document.querySelector<HTMLInputElement>(
      'input[name="account"], input[id="account"], input[placeholder*="Account ID"]'
    );
    if (accountIdField && credentials.accountId) {
      fillInput(accountIdField, credentials.accountId);
      console.log('AWS Account Manager: Filled account ID');
    }

    // Try to fill the username field
    const usernameField = document.querySelector<HTMLInputElement>(
      'input[name="username"], input[id="username"], input[type="text"][name="username"]'
    );
    if (usernameField && credentials.username) {
      fillInput(usernameField, credentials.username);
      console.log('AWS Account Manager: Filled username');
    }

    // Try to fill the password field
    const passwordField = document.querySelector<HTMLInputElement>(
      'input[type="password"], input[name="password"], input[id="password"]'
    );
    if (passwordField && credentials.password) {
      fillInput(passwordField, credentials.password);
      console.log('AWS Account Manager: Filled password');
    }

    // Clear the pending credentials after use
    await chrome.storage.local.remove('pendingCredentials');
    console.log('AWS Account Manager: Credentials filled and cleared');

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

// Also try again after a short delay (for SPAs)
setTimeout(checkAndFillCredentials, 1000);
setTimeout(checkAndFillCredentials, 2000);
