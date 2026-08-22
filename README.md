Suraj’s Card Vault 2.5.2 HOTFIX

This fixes the blank-screen bug in 2.5.1.

Cause:
- A malformed JavaScript row-renderer slipped into 2.5.1.
- This stopped app.js from parsing, so the whole site rendered blank.

Also fixed:
- An undefined card-score reference inside Sniper.

Images remain embedded directly in cards.json, so there are no separate card image files to upload.

Upload ALL files in this ZIP to the GitHub repo root and replace the current ones.
After deployment, fully close/reopen the Home Screen app.
Look for build 2.5.2.
