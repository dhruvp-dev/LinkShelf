# LinkShelf

A local-first mobile app for saving, organizing, and reopening links from Instagram, YouTube, and the web. All data stays in an on-device SQLite database.

---

## What LinkShelf Does

### Save from any app
Open the native share sheet in Safari, Chrome, YouTube, or Instagram, and tap LinkShelf. The app extracts the URL, fetches the title and cover image, and saves it to your shelf.

### Offline and on-device
LinkShelf stores your bookmarks, tags, and folder collections in a local SQLite database. You can search, browse, and organize your saved links without an internet connection. There are no accounts, trackers, or remote sync servers.

### Folders and favorites
Sort links into color-coded folders like Articles, Recipes, Research, or Media. Star important links for quick access on the main screen. If you delete a folder, LinkShelf moves its links back to the main shelf instead of deleting them.

### Automatic link previews
The app pulls page titles, descriptions, favicons, and cover images from Open Graph metadata. Source badges label where each item came from, including YouTube, Instagram, GitHub, and X.

### Light and dark appearances
LinkShelf includes custom light and dark themes with Inter typography, tactile press feedback, and hairline borders designed for mobile screens.

### Data export
Export your entire library to a JSON file at any time, or restore an existing backup.

---

## Screens

| Screen | Purpose |
| :--- | :--- |
| Home | View saved links in grid or list layouts, filter by folder, and toggle favorites. |
| Search | Search your archive by title, description, or domain name. |
| Save Link | Preview a link, adjust its title or notes, and assign a folder before saving. |
| Folders | Create and manage collections with custom colors and folder counts. |
| Settings | Switch appearance themes, configure default views, manage Trash, or export data. |

---

## Setup for Development

### Prerequisites
- Node.js 18+
- Expo CLI

### Run locally

```bash
git clone git@github.com:dhruvp-dev/LinkShelf.git
cd LinkShelf
npm install
npx expo start
```

### Native Share Sheet Builds

The native share extension requires a custom development client rather than standard Expo Go:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## License

MIT
