# LinkShelf

Your internet, organized. A local-first app for saving links from Instagram, YouTube and the web,
then organizing, searching and reopening them. All data lives in SQLite on the device.

## Setup

```bash
npm install
npx expo start            # Metro dev server (dev-client build required for share sheet)
```

### Development builds (needed for the share sheet)

The share sheet uses `expo-share-intent`, which has native code, so **Expo Go cannot receive shared links**.
Build a development client instead:

```bash
npx expo run:android                              # local Android build (needs Android SDK)
npx eas-cli@latest build -p ios --profile development   # iOS build in the cloud (needs an Apple developer account)
```

Then open the dev client and run `npx expo start`. To test sharing, open a YouTube or Chrome link,
tap Share, and choose LinkShelf. The Save Link screen opens with the URL filled in.

The Expo config plugin (`app.json` → `plugins`) adds the Android `text/*` intent filter and the iOS
share extension. Re-run `npx expo prebuild --clean` if you change those options.

### Checks

```bash
npx tsc --noEmit          # type check
npm test                  # unit tests (URL handling, metadata parsing, query building, import validation)
npx expo-doctor          # dependency and config check
```

## Structure

- `src/app/` — Expo Router screens. `(tabs)/` holds Home, Search, Save (centre button), Folders, Settings.
- `src/components/` — reusable UI (cards, rows, form, sheets, toast).
- `src/database/` — schema, migrations (`PRAGMA user_version`), SQL query builder.
- `src/services/` — link, folder, settings, metadata, import/export logic. Services take a `db` handle
  and run multi-row changes inside transactions.
- `src/hooks/` — paginated SQL-backed lists, folder data, link/folder action menus, clipboard, share intent.
- `src/theme/` — light and dark tokens; `system` follows the device.

## Data model

- `links` — url, title, description, domain, site/thumbnail/favicon, folder, starred flag, timestamps, `deleted_at` (Trash).
- `folders` — name, icon, color, default flag. Deleting a folder moves its links (never deletes them).
- `tags` + `link_tags` — normalized, indexed tags.
- `metadata_cache` — fetched page metadata, refreshed weekly.
- `settings` — theme, default view, default sort, recent searches.

## Known limitations

- Instagram often blocks public metadata. Those links save with the domain and a placeholder preview.
- Metadata is fetched over the network. Saving and every other feature works offline.
- Typography uses the system font (SF / Roboto), not Inter.
- ESLint is not configured: `expo lint` fails on an `eslint-config-expo` peer conflict.
