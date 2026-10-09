# Election Night 2026 — source configuration

The publicly accessible page is `/election-night.html`. It has two independent reporting tabs:
**AP Race Calls** and **New York Times**.

## Current state (October 8, 2026)

The dashboard is installed and ready for live data but is **not yet connected** to either publisher's private election-results feed. The data files deliberately contain **no race calls**, and the map remains gray. The dashboard auto-checks the selected source's JSON file every 10 seconds, with a manual refresh button. Separate tabs never silently mix calls.

## Authorized data access

**AP**: The official [AP Elections API](https://developer.ap.org/ap-elections-api/) requires a customer API key, an appropriate data license and permitted redistribution. Use a private integration (server or a GitHub Actions workflow with encrypted secrets), *not* a browser-side API key. Read the permitted polling cadence and attribution conditions from AP's customer docs. Publish only data your license permits to `election-night-ap.json`.

**New York Times**: The NYT coverage tab links to its public politics/election reporting. It has no authenticated NYT results API connection. Do not scrape NYT pages or assume that a news-subscription API license grants election-data redistribution rights. If you obtain an authorized results feed, map it to `election-night-nyt.json` on the server.

**Do not publish test race calls as actual election results.** AP testing data are not election-night production calls.

## Normalized feed contract

The site reads the two **different** JSON files from the same GitHub Pages origin. Each file must be valid JSON using this structure:

```json
{
  "election": "2026-11-03",
  "source": "ap",
  "status": "live",
  "updated_at": "2026-11-03T23:00:00Z",
  "races": [
    {
      "state": "TX",
      "called": false,
      "party": null,
      "winner": "",
      "pct_reporting": null,
      "candidates": []
    }
  ]
}
```

The example shows an **uncalled race**, not an actual or predicted result. The `source` field must be `"ap"` or `"nyt"` and match the destination file. States not present in the feed remain gray. This dashboard covers the 35 states with regularly scheduled or special U.S. Senate contests in 2026 configured on Will's Senate map.

- `called`: only `true` when **the named data source** has officially called the race. Votes or a polling lead are not a call.
- `party`: `"D"`, `"R"`, or `"I"` for a **called** race, otherwise `null`.
- `winner`: plain-text winner name, only after that source's call.
- `pct_reporting`: optional 0–100 percent, for reference (must describe the source's actual reporting metric).
- `candidates`: optional array of `{ "name": "...", "party": "D", "votes": 0, "pct": 0 }`, populated only with real figures.
- `updated_at`: actual publication time in ISO 8601 UTC. A live feed older than 10 minutes shows **stale**.

Do not store AP/NYT API credentials, cookies, paid content or tokens in this public repository or the generated JSON files.

## Testing

Before attaching a licensed feed, verify in the browser:

1. Navigation from Will's home page to **Election Night** and back.
2. Each source tab reports *no connected results*, with zero race calls.
3. The map changes a state's color only when a **legitimately sourced** result has `called:true`.
4. A data file from the wrong source or election date is rejected.
5. The background map SVG loads from the original Senate map; if it does not, the selectable state-tile fallback remains usable.

## Notes

The AP and NYT tabs link to publishers' external reporting pages. Those pages aren't embedded, copied, or presented as a native API connection. This is an independent site, not an official AP or NYT product.
