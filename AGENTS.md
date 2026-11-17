# AGENTS.md

## Overview

Dependency-free static weapon randomizer for the Roblox game Grave/Digger.
No package manager, build step, tests, or linter. Three source files:
`index.html`, `styles.css`, `script.js`.

## Run & verify

```sh
python3 -m http.server 8000   # then open http://localhost:8000
node --check script.js        # only automated check available
```

Opening `index.html` directly must keep working: use relative asset paths, no server-only features.

## Randomizer logic

- `WEAPONS` and `PERKS` arrays live at the top of `script.js`; they are the single source of truth
  for pools. Costs are per-weapon (`Primary` 2, `Sidearm` 1).
- Pool selection lives in the DOM: `weaponInputs` / `perkInputs` map each name to its checkbox, and
  `activeWeapons()` / `activePerks()` filter `WEAPONS` / `PERKS` by those checkboxes. Do not read
  `WEAPONS` or `PERKS` directly when picking — that would ignore the pool panels.
- `DEFAULT_EXCLUDED_WEAPONS` holds the names that start unchecked (currently just Hope Automatic
  Pistol). Every other weapon, and every perk, starts selected.
- `weaponGroups` is the single description of the weapon pool: each entry names its list container, its
  "All" box, its source array and whether it starts checked. `WEAPONS` is split into Primary / Sidearm;
  `MODIFIED_WEAPONS` is the `Modified` group with `defaultChecked: false`. Add a list here, not in HTML.
- `MODIFIED_WEAPONS` entries do go through `weaponInputs`, so their names must stay unique across both
  arrays — a duplicate name would make two checkboxes share one map entry.
- Capacity is `BASE_SPACE` (2) + Soldat toggle (`SOLDAT_BONUS`) + perk Survivalist
  (`SURVIVALIST_BONUS`). The perk is chosen **before** weapons each roll because it can change capacity.
- `pickPerk()` returns the dropdown selection when **Fix perk** is on, otherwise a random perk from
  the selected perks, or `null` when no perks are selected. The dropdown is rebuilt from the selected
  perks at startup and on every pool edit, so adding a perk does not require HTML changes.
- `rollWeapons()` fills slots sequentially: only weapons whose `cost <= remaining` and not already
  used are candidates. A slot with no candidate is intentionally left empty — do not force two weapons.
  At base space a Primary first therefore leaves Weapon 2 empty.
- Final results are written only in `finishRoll()`. The `statusEl` `aria-live` text is set at the end,
  not on every animation tick, to avoid noisy screen-reader output.
- Toggling Soldat, toggling **Fix perk**, changing the fixed perk, or editing any pool checkbox triggers
  a fresh roll so the displayed loadout always matches the current capacity and pool. Pool checkboxes
  stay enabled during the animation, so `performRoll()` sets `pendingRoll` instead and `finishRoll()`
  replays it once — rapid edits can never leave a stale loadout.
- An empty pool is valid: the roll is not blocked, slots just render `No weapon` / `No perk`.
- While a perk is fixed, the perk card does not flicker during the animation; its final tag reads
  `Perk · fixed` (plus `· +1 space` for Survivalist).

## Gotchas

- The README's weapon table shows examples, not the full pool; `WEAPONS` in `script.js` is authoritative.
- During the `is-rolling` flicker, names/costs shown are cosmetic and can violate space rules; only
  `finishRoll()` results are authoritative. Do not "fix" the flicker.
- The Survivalist bonus checks `perk.name === "Survivalist"` by string. Renaming that perk requires
  updating `capacityFor()` as well as the `PERKS` array.
- The fixed-perk dropdown is rebuilt from `activePerks()` by `syncPerkControls()`, which also disables it
  when Fix perk is off, during every animation, or when no perks are selected. Keep that in sync if
  controls change.
- Theme is applied by an inline script in `index.html` `<head>` **before** the stylesheet loads to avoid
  a flash of the wrong theme. `script.js` re-applies/updates it. Keep both in sync.
- The mobile-nav breakpoint (`640px`) exists in `styles.css` **and** in the `resize` handler in
  `script.js`. Changing one requires changing the other.
- Nav toggle markup order matters: `.nav-toggle-bar` elements are children 2–4 of the button because a
  `.sr-only` label is child 1; the CSS `:nth-child` rules depend on that.
- Reduced-motion users skip the animation via `matchMedia("(prefers-reduced-motion: reduce)")` but must
  still reach `finishRoll()`.
- No backend and no persistable roll state: refreshing the page resets the cards. Only the `theme`
  key is stored in `localStorage`.
