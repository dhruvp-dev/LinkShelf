# LinkShelf

> **Your internet, effortlessly organized.**  
> Save articles, videos, recipes, and inspiration from Instagram, YouTube, and the web. Stored 100% locally on your device — fast, private, and beautifully tactile.

---

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK_58-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native 0.88](https://img.shields.io/badge/React_Native-0.88-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![SQLite Local-First](https://img.shields.io/badge/Storage-SQLite_(Local_First)-003B57.svg?style=flat&logo=sqlite)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![Privacy Focused](https://img.shields.io/badge/Privacy-100%25_On--Device-success.svg?style=flat)](#privacy-guarantee)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Why LinkShelf?

Bookmarks get lost in browser tab overload. Instagram saved posts vanish into algorithmic feeds. YouTube's "Watch Later" turns into a digital junk drawer.

**LinkShelf** brings order to your digital archive. It provides a single, distraction-free shelf for everything you want to read, watch, or revisit later. Designed with Apple-grade fluid motion, tactile spring physics, and an uncompromising commitment to personal privacy.

---

## Key Features

### Instant Share Sheet Integration
Save links in seconds without opening the app first. Tap **Share** from Safari, Chrome, YouTube, or Instagram, select **LinkShelf**, and your link is automatically parsed and placed onto your shelf.

### 100% Local-First & Private
- **Zero mandatory accounts**: No passwords, no logins, no cloud tracking.
- **On-device SQLite database**: Your links, notes, and collections never leave your phone.
- **Offline ready**: Access, organize, search, and manage your entire shelf with airplane mode active.

### Fluid, Tactile Apple-Inspired Design
Built following **Kevin's 10 Rules for Polished UI** and Emil Kowalski’s fluid animation philosophy:
- **Direct physical feedback**: Every card and button firms down with a natural `scale(0.98)` spring press.
- **Magnetic sliding indicators**: Segmented controls (Grid / List) glide smoothly under your finger with selection haptics.
- **Sub-pixel hairline depth**: No harsh dark drop shadows. Real depth is rendered through layered light and hairline rings.
- **Symmetric entrances & exits**: Bottom sheets and toast capsules animate along their natural physical trajectory.

### Smart Folders & Starred Favorites
- Color-code folders for *Articles*, *Design Inspo*, *Cooking*, *Research*, or *Travel*.
- Star important links for one-tap access directly on your Home screen.
- Safe folder management: deleting a folder never deletes your links — they simply return to your main shelf.

### Instant Search & Sorting
- Instant, debounced search across titles, URLs, and domains.
- Filter by folder or sort by *Recently Saved*, *Oldest*, or *Alphabetical (A–Z / Z–A)*.

### Rich Automatic Previews
- Automatically fetches high-resolution Open Graph cover images, page titles, and favicons.
- Dedicated platform badges identify where each link originated (YouTube, Instagram, GitHub, X/Twitter, and more).

### Dark & Light Themes
- Warm paper-inspired light palette (`#f7f7f4` / `#f2f1ed`) that is gentle on the eyes.
- Sleek obsidian dark theme (`#1b1b1f` / `#24242a`) for comfortable night reading.
- Crisp typography set in **Inter**.

### Safe Trash & Zero Lock-In
- **Two-step deletion**: Accidental deletions move to **Trash**, where you can restore them at any time.
- **JSON Export & Import**: Backup your entire library in one tap or transfer it to another device. Your data belongs to you.

---

## App Tour

| Screen | What It Does |
| :--- | :--- |
| **Home Shelf** | Browse all your saved links in Grid or List view. Quick folder chips and starred toggles. |
| **Search** | Real-time search across your entire archive by title, description, or domain. |
| **Save Link** | Paste a URL or receive one via Share Sheet. Preview card renders instantly with folder picker. |
| **Folders** | View and organize collections with custom color palettes and link counts. |
| **Settings** | Theme switcher (System / Light / Dark), default view mode, JSON Backup/Restore, and Trash. |

---

## Quick Start (For Developers & Testers)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/)

### Installation

```bash
# 1. Clone the repository
git clone git@github.com:dhruvp-dev/LinkShelf.git
cd LinkShelf

# 2. Install dependencies
npm install

# 3. Start the Metro development server
npx expo start
```

### Running the Native Share Sheet (Development Build)

The share extension relies on native system hooks (`expo-share-intent`), which requires a custom development client rather than standard Expo Go:

```bash
# Android local build (requires Android Studio / SDK)
npx expo run:android

# iOS local build (requires macOS and Xcode)
npx expo run:ios
```

---

## Verification & Quality Checks

LinkShelf ships with strict quality baselines:

```bash
npx tsc --noEmit        # TypeScript typecheck (0 errors)
npm test                # Unit test suite (17/17 passing)
npx impeccable detect   # Impeccable design quality and anti-pattern scanner
```

---

## Privacy Guarantee

> **Privacy is our foundation.**  
> LinkShelf will never sell your browsing history, inject advertisements, or require an email address. Link metadata is fetched strictly between your device and the destination website.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Crafted with care for a calmer, more organized web.
</p>
