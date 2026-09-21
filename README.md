# genericloops-catalog

Publishes genericloops as a GitHub Pages site, kept in sync with
archive.org automatically.

A scheduled GitHub Action (every 30 minutes, or run manually from the
Actions tab) does the following:

1. Checks the bramkoenings1@gmail.com archive.org account for every
   uploaded audio file.
2. Bakes that list directly into a copy of genericloops.template.html.
3. Commits the result as index.html. GitHub Pages serves it
   automatically — no upload step, no API key needed.

## One-time setup

1. In this repo: Settings -> Pages -> under "Build and deployment",
   set Source to "Deploy from a branch", Branch to `main` and folder
   to `/ (root)`, then Save.
2. Run the workflow once manually (Actions tab -> "Sync archive.org
   and publish to GitHub Pages" -> Run workflow).
3. After it finishes (green check), your site is live at
   https://<your-username>.github.io/<this-repo-name>/

After that: upload a new loop to archive.org, and within 30 minutes
(or immediately via "Run workflow") the site updates itself. Nothing
else to touch.
