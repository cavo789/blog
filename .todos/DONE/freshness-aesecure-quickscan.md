# Freshness: aesecure-quickscan

**Detected:** 2026-07-30
**Closed:** 2026-07-31
**Article:** blog/2024/08/01/aesecure-quickscan/index.md
**Verdict:** DONE

## Finding

aeSecure QuickScan is the author's own free Joomla virus scanner. As of March 2025, the project is actively looking for a new maintainer because the author has stopped his business activities (announced on forum.joomla.fr). The demo site at `https://quickscan.avonture.be/` currently returns HTTP 500. The scanner supports Joomla up to J5.2.2 but not Joomla 6.x (current LTS is J6.1). The article says "Still up to date" and lists support "up to version J5.1.0", neither of which is accurate anymore.

## Sources

- https://forum.joomla.fr/forum/d%C3%A9veloppeurs/projets-open-sources/2068020-aesecure-quickscan-projet-opensource-en-recherche-d-un-repreneur — Forum post (Mar 2025): aeSecure QuickScan looking for a new maintainer
- https://github.com/cavo789/aesecure_quickscan — GitHub repo still exists (last commit Mar 2025)

## Suggested action

Update the article prose: replace "Still up to date" with a note that the project is seeking a new maintainer and that support tops out at Joomla 5.2.x (not 6.x). Fix the claimed max version from "J5.1.0" to "J5.2.2". Investigate the demo site (500 error) — either fix it or remove the demo link. Add an `updates:` entry and possibly an `<AlertBox variant="note">` informing readers the tool has limited future support.

## Done (2026-07-31)

- Added `updates:` entry in frontmatter (date 2026-07-31, describes AFUJ transfer + offline demo)
- Updated `description` to mention AFUJ takeover
- Updated TLDR to name AFUJ and link to new repo
- Replaced "Still up to date" opening with an `<AlertBox variant="note">` announcing the AFUJ transfer, linking to the forum post and new repo
- Updated version range from "J5.1.0" to "Joomla 5.x"
- Removed broken demo link; replaced with note that demo is offline and pointer to AFUJ repo
- Updated Download section to point to AFUJ/quickscan (no raw file URL since exact filename unverified)
- Updated hashes folder URL (cavo789 → AFUJ/quickscan)
- Updated "Read more" README link to AFUJ/quickscan
