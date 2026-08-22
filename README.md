Suraj’s Card Vault 2.2

New GitHub-as-database workflow:
1. Add owned cards in Vault/Home, or watched cards in Sniper.
2. Open ⋯ > Sync & Backup > Export cards.json.
3. Upload that exported cards.json to the GitHub repo root and commit.
4. Tap "Mark GitHub as synced" in the app after the new site version is deployed.
5. If the master was changed elsewhere, download cards.json from GitHub and use Import Master.

Images added through the app are currently stored in IndexedDB on the iPhone. For permanent shared images, send card screenshots to ChatGPT; they can be curated into assets/ and linked from cards.json in the next published build.
