# AWS Account Manager

<div align="center">
  <img src="assets/icon-128.png" alt="AWS Account Manager" width="128" height="128">
  
  <h3>Securely manage and switch between multiple AWS accounts</h3>
  
  <p>A Chrome extension for developers, DevOps engineers, and cloud architects who work with multiple AWS accounts.</p>
  
  <p>
    <a href="https://chrome.google.com/webstore">
      <img src="https://img.shields.io/badge/Chrome%20Web%20Store-Coming%20Soon-orange?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Chrome Web Store">
    </a>
    <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
  </p>
</div>

---

## 🎯 Why AWS Account Manager?

Managing multiple AWS accounts is painful. Constantly copying and pasting 12-digit account IDs from spreadsheets, notes apps, or password managers disrupts your workflow. **AWS Account Manager** solves this with secure, one-click account switching.

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Secure by Design
- **Local encryption** - All data encrypted and stored locally
- **Zero tracking** - No analytics, no data collection
- **No external servers** - Data never leaves your browser
- **Open source** - Audit the code yourself

</td>
<td width="50%">

### ⚡ Lightning Fast
- **One-click access** - Connect to any account instantly
- **Auto-fill** - Automatically fills account IDs on AWS sign-in
- **Smart search** - Find accounts as you type
- **Unlimited accounts** - Store as many as you need

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Beautiful Interface
- **Modern design** - Clean, intuitive UI
- **Dark mode** - Easy on the eyes
- **Responsive** - Works perfectly at any size
- **Accessible** - Built with accessibility in mind

</td>
<td width="50%">

### 🚀 Developer Focused
- **Built for DevOps** - Manage dev/staging/prod effortlessly
- **Perfect for consultants** - Switch between client accounts
- **Team friendly** - Great for agencies and enterprises
- **Quick setup** - Start using in under 30 seconds

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">
  <img src="assets/screenshot-1.png" alt="AWS Account Manager Interface" width="800">
  <p><em>Clean, intuitive interface with all your AWS accounts at your fingertips</em></p>
</div>

<div align="center">
  <img src="assets/promo-tile-1400x560.png" alt="AWS Account Manager Banner" width="800">
</div>

---

## 🚀 Installation

### From Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store shortly. Stay tuned!

### For Development
Want to try it now or contribute? Here's how to run it locally:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/aws-account-manager.git
cd aws-account-manager

# Install dependencies
pnpm install

# Build the extension
pnpm run build

# Load in Chrome
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode" (top right)
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
```

---

## 💡 How to Use

### Adding Your First Account

1. **Click the extension icon** in your Chrome toolbar
2. **Click "+ Add Account"**
3. **Enter account details**:
   - Name: `Production` (or any name you prefer)
   - Account ID: Your 12-digit AWS account ID
4. **Click "Add Account"**

### Connecting to AWS

1. **Open the extension** by clicking the icon
2. **Click "Connect"** on any saved account
3. AWS sign-in page opens with the account ID **pre-filled**
4. Complete your authentication flow

### Managing Accounts

- **Edit** - Click the pencil icon to update account details
- **Delete** - Click the trash icon to remove an account
- **Search** - Use the search bar to filter accounts quickly
- **Theme** - Toggle between light and dark mode

---

## 🎯 Perfect For

<table>
<tr>
<td align="center" width="25%">
  <h3>👨‍💻 DevOps Engineers</h3>
  <p>Quickly switch between dev, staging, and production environments</p>
</td>
<td align="center" width="25%">
  <h3>☁️ Cloud Architects</h3>
  <p>Manage accounts across multiple organizations and projects</p>
</td>
<td align="center" width="25%">
  <h3>👥 Development Teams</h3>
  <p>Seamlessly access team-specific AWS accounts</p>
</td>
<td align="center" width="25%">
  <h3>🏢 Consultants</h3>
  <p>Effortlessly switch between different client accounts</p>
</td>
</tr>
</table>

---

## 🔒 Privacy & Security

We take your security seriously. Here's our commitment:

- ✅ **All data stored locally** - Uses Chrome's secure storage API
- ✅ **Encryption enabled** - Sensitive data is encrypted before storage
- ✅ **No external servers** - Zero data transmission to third parties
- ✅ **No tracking or analytics** - We don't know who you are or what you do
- ✅ **Open source** - Full transparency, audit the code anytime
- ✅ **No account required** - Start using immediately, no registration

[Read Full Privacy Policy](PRIVACY_POLICY.md)

---

## 🛠️ Tech Stack

Built with modern web technologies for performance and reliability:

- **React 19** - Latest React for optimal performance
- **TypeScript** - Type-safe code for fewer bugs
- **Vite** - Lightning-fast builds and HMR
- **Tailwind CSS** - Beautiful, responsive design
- **Radix UI** - Accessible, unstyled components
- **Chrome Manifest V3** - Latest extension standards

---

## 🤝 Contributing

We welcome contributions! Whether it's:

- 🐛 Bug reports
- ✨ Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

### Getting Started

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development mode with hot reload
pnpm run dev

# Build for production
pnpm run build

# Build and package for Chrome Web Store
pnpm run build:prod

# Run linter
pnpm run lint
```

---

## 📂 Project Structure

```
aws-account-manager/
├── public/
│   ├── manifest.json       # Extension manifest
│   └── icons/             # Extension icons (16, 48, 128)
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── AccountList.tsx
│   │   ├── AccountItem.tsx
│   │   ├── AccountForm.tsx
│   │   └── ThemeToggle.tsx
│   ├── content/          # Content scripts for AWS pages
│   ├── utils/
│   │   ├── storage.ts    # Chrome storage utilities
│   │   └── crypto.ts     # Encryption utilities
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── index.css         # Global styles
├── assets/               # Store assets and screenshots
└── scripts/             # Build and packaging scripts
```

---

## 🗺️ Roadmap

Future features we're considering:

- [ ] Export/import accounts (encrypted backup)
- [ ] Account grouping and tags
- [ ] Custom color coding for accounts
- [ ] Keyboard shortcuts
- [ ] Multi-profile support
- [ ] Browser sync (optional, encrypted)
- [ ] Account notes and metadata
- [ ] Recently used accounts section

Have ideas? [Open an issue](https://github.com/YOUR_USERNAME/aws-account-manager/issues)!

---

## 📊 Browser Compatibility

- ✅ **Google Chrome** - Fully supported (v88+)
- ✅ **Microsoft Edge** - Fully supported (Chromium-based)
- ✅ **Brave** - Fully supported
- ✅ **Opera** - Fully supported (Chromium-based)

---

## ❓ FAQ

<details>
<summary><strong>Is this extension safe to use?</strong></summary>
<p>Yes! All data is stored locally on your device using Chrome's encrypted storage. No data is ever transmitted to external servers. The extension is open source, so you can audit the code yourself.</p>
</details>

<details>
<summary><strong>Does this store my AWS passwords?</strong></summary>
<p>No. The extension only stores account IDs, which are not sensitive credentials. You still authenticate normally using your AWS password, SSO, or MFA.</p>
</details>

<details>
<summary><strong>Can I use this with AWS Organizations?</strong></summary>
<p>Yes! You can save any AWS account ID, including organization member accounts.</p>
</details>

<details>
<summary><strong>Is this affiliated with Amazon/AWS?</strong></summary>
<p>No. This is an independent, community-built tool. It's not affiliated with, endorsed by, or sponsored by Amazon Web Services.</p>
</details>

<details>
<summary><strong>How do I backup my accounts?</strong></summary>
<p>Currently, data is stored in Chrome's local storage. Backup/export functionality is planned for a future release. You can manually note down your accounts as a temporary backup solution.</p>
</details>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Icons from [Lucide](https://lucide.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Built with [Vite](https://vitejs.dev/)

---

## 📞 Support

- 🐛 [Report a Bug](https://github.com/YOUR_USERNAME/aws-account-manager/issues)
- 💡 [Request a Feature](https://github.com/YOUR_USERNAME/aws-account-manager/issues)
- 📖 [Documentation](https://github.com/YOUR_USERNAME/aws-account-manager/wiki)
- ⭐ [Star this repo](https://github.com/YOUR_USERNAME/aws-account-manager/stargazers)

---

## ⚠️ Disclaimer

This extension is not affiliated with, endorsed by, or sponsored by Amazon Web Services, Inc. or its affiliates. AWS and the AWS logo are trademarks of Amazon.com, Inc. or its affiliates.

---

<div align="center">
  <p><strong>Built with ❤️ for the AWS community</strong></p>
  <p>
    <a href="#aws-account-manager">Back to top ↑</a>
  </p>
</div>
