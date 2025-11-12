# Oyster Party — Inventory Sheet

Simple internal web app for Oyster Party catering teams to track beginning and end‑of‑day inventory and export a PDF report.

## Features

- Start of Day and End of Day sections with clear inputs and optional notes
- Automatic product totals (sold counts, cash, etc.)
- Export to PDF in one click
- Auto‑save in the browser (IndexedDB with localStorage fallback)
  - Data survives reloads and full close/reopen
  - Data is cleared only after a successful PDF export
- Light/Dark theme toggle (default is Light)
