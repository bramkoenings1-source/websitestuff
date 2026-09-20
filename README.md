# genericloops-catalog

Keeps a running catalog.json of every audio file uploaded to the
bramkoenings1@gmail.com archive.org account. A scheduled GitHub Action
re-checks archive.org every 30 minutes and commits any changes.

The genericloops.html site reads catalog.json directly from
raw.githubusercontent.com — no proxy needed, since GitHub serves raw
files with CORS already enabled.

To force an immediate refresh after uploading a new loop: go to the
Actions tab → "Sync archive.org catalog" → "Run workflow".
