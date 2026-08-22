Suraj’s Card Vault 2.5.1 — EMBEDDED IMAGE FIX

This release fixes the iPhone/GitHub image-upload problem completely.

What changed:
- 29 card images are embedded directly inside cards.json.
- There are NO separate card-*.jpg files to upload.
- This means GitHub Pages cannot lose the image files or break their paths.
- Vault Gallery, Crown Jewels and card-detail screens all read the embedded images from the master.
- Build number shown in the app is 2.5.1.

UPLOAD:
Upload/replace ONLY the files in this ZIP at the GitHub repo root.
There is no assets folder and no card image upload step.

Note:
cards.json is intentionally much larger because it now contains the card photos themselves.
