# Privacy Policy for AWS Account Manager

**Last Updated:** February 22, 2026

## Overview

AWS Account Manager is a Chrome browser extension that helps users manage multiple AWS account IDs. This privacy policy explains how we handle your data.

## Data Collection

**We do NOT collect, transmit, or store any of your data on external servers.**

The extension stores the following information **locally on your device only**:
- AWS account IDs you choose to save
- Custom names/labels you assign to accounts
- Extension preferences (theme settings, etc.)

## Data Storage

All data is stored locally using Chrome's built-in storage API (`chrome.storage.local`). This data:
- Never leaves your device
- Is encrypted by Chrome's security mechanisms
- Can only be accessed by the extension on your browser
- Is automatically deleted when you uninstall the extension

## Data Encryption

Sensitive account information is encrypted before being stored locally using industry-standard encryption algorithms. Your data is protected even if someone gains access to your browser's storage.

## Third-Party Services

This extension does **NOT**:
- Send data to any external servers
- Use analytics or tracking services
- Share data with third parties
- Include advertisements
- Require account registration or login

## Permissions Explained

The extension requires the following permissions:

### storage
Required to save your AWS account information locally in your browser. No data is transmitted externally.

### activeTab
Required to detect when you visit AWS sign-in pages so the extension can offer to auto-fill your account ID.

### host_permissions (https://*.signin.aws.amazon.com/*)
Required to interact with AWS sign-in pages for auto-filling account IDs. The extension only runs on AWS sign-in pages.

## Data Access

Your data is only accessible:
- By you, through the extension interface
- By the extension itself, to provide its functionality
- Locally on your device

**No one else, including the extension developer, has access to your data.**

## Data Deletion

You can delete your data at any time by:
1. Removing individual accounts through the extension interface
2. Uninstalling the extension (removes all stored data automatically)
3. Clearing browser data through Chrome settings

## Open Source

This extension's source code is available for public review on GitHub. You can audit the code to verify our privacy practices.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date above and posted on the extension's GitHub repository.

## Contact

For questions about this privacy policy or data handling practices, please:
- Open an issue on our GitHub repository
- Contact us through the Chrome Web Store support page

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

## Your Rights

You have the right to:
- Access all data stored by the extension
- Delete any or all stored data at any time
- Know exactly what data is being stored (all data is visible in the UI)
- Audit the extension's source code

## No Sale of Data

We do not sell, trade, or transfer your data to third parties. We do not collect your data in the first place.

## Children's Privacy

This extension does not knowingly collect information from anyone. It simply stores data locally that users choose to input.

## Data Breach Notification

Since all data is stored locally on your device and never transmitted to external servers, there is no risk of a data breach from our servers. Your data security depends on your device's security.

## Limitation of Liability

While we implement security best practices, you are responsible for:
- Keeping your device secure
- Using strong passwords for your AWS accounts
- Understanding that this extension stores account IDs (not passwords)
- Following AWS security best practices

---

**Amazon Web Services Disclaimer:** This extension is not affiliated with, endorsed by, or sponsored by Amazon Web Services, Inc. or its affiliates.
