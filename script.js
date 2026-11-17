(function () {
  "use strict";

  const PRIMARY_COST = 2;
  const SIDEARM_COST = 1;

  /* ---- Data pools: edit these to change the available results ---- */
  const WEAPONS = [
    { name: "Prince Long Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Adjudicator Repeating Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Kingslayer Percussion Revolver", category: "Primary", cost: PRIMARY_COST },
    { name: "Okhotnik Hunting Crossbow", category: "Primary", cost: PRIMARY_COST },
    { name: "Whisper Silenced Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Crestfall Lever Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Jesse Combat Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Equine Riding Shotgun", category: "Primary", cost: PRIMARY_COST },
    { name: "Volk Scoped Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Judgement Breech Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Hellion Automatic Shotgun", category: "Primary", cost: PRIMARY_COST },


    { name: "Grace Service Revolver", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Union Military Pistol", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Honour Duty Pistol", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Talon Army Revolver", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Negotiator Pocket Shotgun", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Knell Silenced Revolver", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Auclair Lever Pistol", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Hope Automatic Pistol", category: "Sidearm", cost: SIDEARM_COST }
  ];

  /* Modified variants: a separate pool, added to the roll only while the toggle is on. */
  const MODIFIED_WEAPONS = [
    { name: "Whisper Flyboy Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Negotiator Long Shotgun", category: "Primary", cost: PRIMARY_COST },
    { name: "Union Stocked Pistol", category: "Primary", cost: PRIMARY_COST },
    { name: "Hellion Heavy Shotgun", category: "Primary", cost: PRIMARY_COST },
    { name: "Judgement Incendiary Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Talon Cavalry Revolver", category: "Primary", cost: PRIMARY_COST },
    { name: "Volk Frontline Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Crestfall Ranger Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Jesse Precision Rifle", category: "Primary", cost: PRIMARY_COST },
    { name: "Equine Sawed Shotgun", category: "Primary", cost: PRIMARY_COST },

    { name: "Honour Insurgent Pistol", category: "Sidearm", cost: SIDEARM_COST },
    { name: "Knell Bandit Revolver", category: "Sidearm", cost: SIDEARM_COST }
  ];

  /* Weapons that start unchecked; the player opts them in from the weapon pool. */
  const DEFAULT_EXCLUDED_WEAPONS = ["Hope Automatic Pistol"];

  const PERKS = [
    { name: "Marksman" },
    { name: "Veteran" },
    { name: "Snake Eyes" },
    { name: "Greyhound" },
    { name: "Hippocratic" },
    { name: "Apparition" },
    { name: "Butcher" },
    { name: "Chemist" },
    { name: "Tunnel Rat" },
    { name: "Ambidextrous" },
    { name: "Leatherneck" },
    { name: "Devil Dog" },
    { name: "Black Hand" },
    { name: "Survivalist" }
  ];

  const BASE_SPACE = 2;
  const SOLDAT_BONUS = 1;
  const SURVIVALIST_BONUS = 1;

  /* ---- Elements ---- */
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  const randomizeBtn = document.getElementById("randomize");
  const soldatToggle = document.getElementById("soldat-toggle");
  const fixPerkToggle = document.getElementById("fix-perk-toggle");
  const fixedPerkSelect = document.getElementById("fixed-perk");
  const rollCards = Array.from(document.querySelectorAll("[data-roll-card]"));
  const weapon1El = document.getElementById("weapon-1");
  const weapon1Tag = document.getElementById("weapon-1-tag");
  const weapon2El = document.getElementById("weapon-2");
  const weapon2Tag = document.getElementById("weapon-2-tag");
  const perkEl = document.getElementById("perk");
  const perkTag = document.getElementById("perk-tag");
  const statusEl = document.getElementById("roll-status");
  const spacePipsEl = document.getElementById("space-pips");
  const spaceCountEl = document.getElementById("space-count");

  const primaryList = document.getElementById("primary-list");
  const sidearmList = document.getElementById("sidearm-list");
  const modifiedList = document.getElementById("modified-list");
  const perkList = document.getElementById("perk-list");
  const weaponsAllToggle = document.getElementById("weapons-all");
  const primaryAllToggle = document.getElementById("primary-all");
  const sidearmAllToggle = document.getElementById("sidearm-all");
  const modifiedAllToggle = document.getElementById("modified-all");
  const perksAllToggle = document.getElementById("perks-all");
  const weaponPoolCount = document.getElementById("weapon-pool-count");
  const perkPoolCount = document.getElementById("perk-pool-count");

  /* ---- Theme ---- */
  function currentTheme() {
    return root.getAttribute("data-theme") || "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  themeToggle.addEventListener("click", function () {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (err) {
      /* Storage may be unavailable (private mode); theme still applies. */
    }
  });

  applyTheme(currentTheme());

  /* ---- Mobile navigation ---- */
  navToggle.addEventListener("click", function () {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 640) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---- Footer year ---- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---- Pools: which weapons and perks are allowed to be rolled ---- */
  /* Each group renders its own list and "All" box. `defaultChecked: false` keeps a whole
     list out of the roll until the player opts in (that is how the modified variants start). */
  const weaponGroups = [
    { name: "Primary", list: primaryList, toggle: primaryAllToggle, items: weaponsIn("Primary"), defaultChecked: true },
    { name: "Sidearm", list: sidearmList, toggle: sidearmAllToggle, items: weaponsIn("Sidearm"), defaultChecked: true },
    { name: "Modified", list: modifiedList, toggle: modifiedAllToggle, items: MODIFIED_WEAPONS, defaultChecked: false }
  ];

  /* Name -> checkbox, so the data arrays stay the single source of truth. */
  const weaponInputs = new Map();
  const perkInputs = new Map();

  function weaponsIn(category) {
    return WEAPONS.filter(function (weapon) {
      return weapon.category === category;
    });
  }

  function addPoolItem(list, name, inputs, checked) {
    const item = document.createElement("label");
    item.className = "pool-item";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.addEventListener("change", onPoolChange);

    const text = document.createElement("span");
    text.textContent = name;

    item.appendChild(input);
    item.appendChild(text);
    list.appendChild(item);
    inputs.set(name, input);
  }

  function buildPools() {
    weaponGroups.forEach(function (group) {
      group.items.forEach(function (weapon) {
        const startOn = group.defaultChecked && DEFAULT_EXCLUDED_WEAPONS.indexOf(weapon.name) === -1;
        addPoolItem(group.list, weapon.name, weaponInputs, startOn);
      });
    });

    PERKS.forEach(function (perk) {
      addPoolItem(perkList, perk.name, perkInputs, true);
    });
  }

  function activeWeapons() {
    const pool = [];
    weaponGroups.forEach(function (group) {
      group.items.forEach(function (weapon) {
        if (weaponInputs.get(weapon.name).checked) pool.push(weapon);
      });
    });
    return pool;
  }

  function activePerks() {
    return PERKS.filter(function (perk) {
      return perkInputs.get(perk.name).checked;
    });
  }

  function inputsFor(group) {
    return group.items.map(function (weapon) {
      return weaponInputs.get(weapon.name);
    });
  }

  function allWeaponInputs() {
    return weaponGroups.reduce(function (inputs, group) {
      return inputs.concat(inputsFor(group));
    }, []);
  }

  /* An "All" box is ticked when everything under it is on, dashed when it is mixed. */
  function reflectInputs(toggle, inputs) {
    const on = inputs.filter(function (input) {
      return input.checked;
    }).length;
    toggle.checked = inputs.length > 0 && on === inputs.length;
    toggle.indeterminate = on > 0 && on < inputs.length;
  }

  function setInputsChecked(inputs, checked) {
    inputs.forEach(function (input) {
      input.checked = checked;
    });
  }

  function refreshPoolUi() {
    let weaponTotal = 0;

    weaponGroups.forEach(function (group) {
      reflectInputs(group.toggle, inputsFor(group));
      weaponTotal += group.items.length;
    });
    reflectInputs(weaponsAllToggle, allWeaponInputs());
    reflectInputs(perksAllToggle, Array.from(perkInputs.values()));

    weaponPoolCount.textContent = activeWeapons().length + " / " + weaponTotal + " selected";
    perkPoolCount.textContent = activePerks().length + " / " + PERKS.length + " selected";
  }

  function onPoolChange() {
    refreshPoolUi();
    syncPerkControls();
    performRoll();
  }

  weaponsAllToggle.addEventListener("change", function () {
    setInputsChecked(allWeaponInputs(), weaponsAllToggle.checked);
    onPoolChange();
  });

  weaponGroups.forEach(function (group) {
    group.toggle.addEventListener("change", function () {
      setInputsChecked(inputsFor(group), group.toggle.checked);
      onPoolChange();
    });
  });

  perksAllToggle.addEventListener("change", function () {
    setInputsChecked(Array.from(perkInputs.values()), perksAllToggle.checked);
    onPoolChange();
  });

  /* ---- Randomizer ---- */
  let rolling = false;
  let pendingRoll = false;

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function capacityFor(perk) {
    let capacity = BASE_SPACE;
    if (soldatToggle.checked) capacity += SOLDAT_BONUS;
    if (perk && perk.name === "Survivalist") capacity += SURVIVALIST_BONUS;
    return capacity;
  }

  /* Keep the fixed-perk dropdown to the perks that are currently in the pool. */
  function syncPerkControls() {
    const perks = activePerks();
    const previous = fixedPerkSelect.value;
    const options = document.createDocumentFragment();

    perks.forEach(function (perk) {
      const option = document.createElement("option");
      option.value = perk.name;
      option.textContent = perk.name;
      options.appendChild(option);
    });

    fixedPerkSelect.replaceChildren(options);
    if (perks.some(function (perk) { return perk.name === previous; })) {
      fixedPerkSelect.value = previous;
    }
    fixedPerkSelect.disabled = !fixPerkToggle.checked || perks.length === 0;
  }

  function pickPerk() {
    const pool = activePerks();
    if (pool.length === 0) return null;

    if (fixPerkToggle.checked) {
      const match = pool.find(function (perk) {
        return perk.name === fixedPerkSelect.value;
      });
      return match || pool[0];
    }

    return randomItem(pool);
  }

  /* Fill slots in order; a weapon can only be picked if it fits in the space left. */
  function rollWeapons(capacity) {
    const pool = activeWeapons();
    const weapons = [];
    const used = [];
    let remaining = capacity;

    for (let slot = 0; slot < 2; slot++) {
      const candidates = pool.filter(function (weapon) {
        return weapon.cost <= remaining && used.indexOf(weapon) === -1;
      });

      if (candidates.length === 0) {
        weapons.push(null);
        continue;
      }

      const pick = randomItem(candidates);
      weapons.push(pick);
      used.push(pick);
      remaining -= pick.cost;
    }

    return { weapons: weapons, used: capacity - remaining, remaining: remaining };
  }

  function renderSpace(capacity, used) {
    const pips = document.createDocumentFragment();
    for (let i = 0; i < capacity; i++) {
      const pip = document.createElement("span");
      pip.className = "space-pip" + (i < used ? " is-filled" : "");
      pips.appendChild(pip);
    }
    spacePipsEl.replaceChildren(pips);
    spaceCountEl.textContent = used + " / " + capacity + " used";
  }

  function setWeaponSlot(valueEl, tagEl, weapon, card, poolEmpty) {
    card.classList.remove("is-empty");

    if (!weapon) {
      valueEl.textContent = poolEmpty ? "No weapon" : "No space";
      tagEl.textContent = poolEmpty ? "No weapons selected" : "Not enough space left";
      card.classList.add("is-empty");
      return;
    }

    valueEl.textContent = weapon.name;
    tagEl.textContent = weapon.category + " · " + weapon.cost + " space";
  }

  function setPerk(perk, fixed) {
    if (!perk) {
      perkEl.textContent = "No perk";
      perkTag.textContent = "No perks selected";
      return;
    }

    perkEl.textContent = perk.name;
    let tag = fixed ? "Perk · fixed" : "Perk";
    if (perk.name === "Survivalist") tag += " · +1 space";
    perkTag.textContent = tag;
  }

  function showFlickerWeapon(valueEl, tagEl, weapon) {
    if (!weapon) {
      valueEl.textContent = "No weapon";
      tagEl.textContent = "No weapons selected";
      return;
    }

    valueEl.textContent = weapon.name;
    tagEl.textContent = weapon.category + " · " + weapon.cost + " space";
  }

  function finishRoll(result, perk, capacity, fixed) {
    const poolEmpty = activeWeapons().length === 0;

    setWeaponSlot(weapon1El, weapon1Tag, result.weapons[0], rollCards[0], poolEmpty);
    setWeaponSlot(weapon2El, weapon2Tag, result.weapons[1], rollCards[1], poolEmpty);
    setPerk(perk, fixed);
    renderSpace(capacity, result.used);

    rollCards.forEach(function (card) {
      card.classList.remove("is-rolling");
    });

    const names = result.weapons.filter(Boolean).map(function (weapon) {
      return weapon.name;
    });

    let summary = poolEmpty ? "No weapons selected" : (names.length ? names.join(" + ") : "No weapons fit");
    summary += " · Perk: " + (perk ? perk.name + (fixed ? " (fixed)" : "") : "none selected");

    if (result.remaining > 0 && !poolEmpty) {
      summary += " · " + result.remaining + " space unused";
    }

    statusEl.textContent = summary;

    rolling = false;
    randomizeBtn.disabled = false;
    soldatToggle.disabled = false;
    fixPerkToggle.disabled = false;
    syncPerkControls();

    if (pendingRoll) {
      pendingRoll = false;
      performRoll();
    }
  }

  function performRoll() {
    /* A pool edit landing mid-animation is replayed once the roll settles. */
    if (rolling) {
      pendingRoll = true;
      return;
    }

    rolling = true;
    randomizeBtn.disabled = true;
    soldatToggle.disabled = true;
    fixPerkToggle.disabled = true;
    fixedPerkSelect.disabled = true;

    const fixed = fixPerkToggle.checked;
    const perk = pickPerk();
    const capacity = capacityFor(perk);
    const result = rollWeapons(capacity);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    renderSpace(capacity, 0);
    if (fixed) setPerk(perk, true);
    statusEl.textContent = "Rolling…";

    if (reduceMotion) {
      finishRoll(result, perk, capacity, fixed);
      return;
    }

    rollCards.forEach(function (card) {
      card.classList.add("is-rolling");
      card.classList.remove("is-empty");
    });

    const flickerWeapons = activeWeapons();
    const flickerPerks = activePerks();
    let ticks = 0;
    const totalTicks = 10;
    const timer = window.setInterval(function () {
      ticks += 1;

      showFlickerWeapon(weapon1El, weapon1Tag, flickerWeapons.length ? randomItem(flickerWeapons) : null);
      showFlickerWeapon(weapon2El, weapon2Tag, flickerWeapons.length ? randomItem(flickerWeapons) : null);

      if (!fixed) {
        if (flickerPerks.length) {
          perkEl.textContent = randomItem(flickerPerks).name;
          perkTag.textContent = "Perk";
        } else {
          perkEl.textContent = "No perk";
          perkTag.textContent = "No perks selected";
        }
      }

      if (ticks >= totalTicks) {
        window.clearInterval(timer);
        finishRoll(result, perk, capacity, fixed);
      }
    }, 60);
  }

  randomizeBtn.addEventListener("click", performRoll);

  soldatToggle.addEventListener("change", function () {
    if (rolling) return;
    performRoll();
  });

  fixPerkToggle.addEventListener("change", function () {
    syncPerkControls();
    if (rolling) return;
    performRoll();
  });

  fixedPerkSelect.addEventListener("change", function () {
    if (rolling) return;
    performRoll();
  });

  buildPools();
  refreshPoolUi();
  syncPerkControls();
  renderSpace(BASE_SPACE, 0);
})();
