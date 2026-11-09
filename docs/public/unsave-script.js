/*
 * Run this in the browser DevTools console while viewing an Instagram
 * Saved collection. It completely unsaves each post/reel it processes.
 *
 * Assumes Instagram is displayed in English. Press Escape to stop.
 */
(async () => {
  "use strict";

  const SETTINGS = {
    minimumDelayMs: 1800,
    maximumDelayMs: 3200,
    controlTimeoutMs: 10000,
    maximumItems: 5000,
    idleScrollLimit: 4,
    clearConsoleOnSuccess: true,
  };

  if (!location.hostname.endsWith("instagram.com") ||
      !location.pathname.includes("/saved/")) {
    throw new Error("Open the intended Instagram Saved collection first.");
  }

  const confirmation = prompt(
    "This will completely UNSAVE every post in the open collection.\n" +
    "It can affect other collections too. Type UNSAVE ALL to continue:"
  );
  if (confirmation !== "UNSAVE ALL") {
    console.info("Cancelled; nothing was changed.");
    return;
  }

  let stopped = false;
  const processed = new Set();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomDelay = () =>
    SETTINGS.minimumDelayMs +
    Math.random() * (SETTINGS.maximumDelayMs - SETTINGS.minimumDelayMs);
  const isVisible = (element) =>
    Boolean(element && element.getClientRects().length);

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      stopped = true;
      console.warn("Stop requested. Finishing the current UI action only.");
    }
  };
  document.addEventListener("keydown", onKeyDown, true);

  async function waitFor(getValue, description) {
    const deadline = Date.now() + SETTINGS.controlTimeoutMs;
    while (!stopped && Date.now() < deadline) {
      const value = getValue();
      if (value) return value;
      await sleep(150);
    }
    throw new Error(`Timed out waiting for ${description}. Instagram's UI may have changed.`);
  }

  function currentTiles() {
    return [...document.querySelectorAll(
      'main a[href*="/p/"], main a[href*="/reel/"]'
    )].filter((link) => isVisible(link) && !processed.has(link.href));
  }

  function controlWithSvgLabel(root, labels) {
    // Prefer a control's own label. Do not match a large clickable wrapper just
    // because it contains a labelled icon somewhere deep inside it.
    for (const control of root.querySelectorAll('button, [role="button"]')) {
      if (!isVisible(control)) continue;
      const label = control.getAttribute("aria-label") || "";
      if (labels.includes(label)) return control;
    }

    // Instagram commonly labels the SVG rather than the clickable ancestor.
    // Start at the exact icon and select only its nearest clickable control.
    for (const svg of root.querySelectorAll("svg[aria-label]")) {
      if (!isVisible(svg)) continue;
      if (!labels.includes(svg.getAttribute("aria-label") || "")) continue;
      return svg.closest('button, [role="button"]') || svg;
    }

    for (const title of root.querySelectorAll("svg title")) {
      if (!labels.includes(title.textContent?.trim() || "")) continue;
      const svg = title.closest("svg");
      if (!isVisible(svg)) continue;
      return svg.closest('button, [role="button"]') || svg;
    }
    return null;
  }

  function controlWithExactText(root, text) {
    for (const control of root.querySelectorAll('button, [role="button"]')) {
      if (!isVisible(control)) continue;
      if (control.textContent?.trim() === text) return control;
    }
    return null;
  }

  try {
    let count = 0;
    let idleScrolls = 0;

    while (!stopped && count < SETTINGS.maximumItems) {
      const tile = currentTiles()[0];

      if (!tile) {
        const oldHeight = document.documentElement.scrollHeight;
        window.scrollTo({ top: oldHeight, behavior: "smooth" });
        await sleep(1500);

        const foundMore = currentTiles().length > 0;
        const grew = document.documentElement.scrollHeight > oldHeight;
        idleScrolls = foundMore || grew ? 0 : idleScrolls + 1;
        if (idleScrolls >= SETTINGS.idleScrollLimit) break;
        continue;
      }

      const postUrl = tile.href;
      tile.scrollIntoView({ block: "center" });
      tile.click();

      const dialog = await waitFor(
        () => [...document.querySelectorAll('[role="dialog"]')].find(isVisible),
        "the post dialog"
      );

      // The filled bookmark is labelled “Remove” in Instagram's English UI.
      // There is intentionally no broad text fallback: guessing here is unsafe.
      const removeButton = await waitFor(
        () => controlWithSvgLabel(dialog, ["Remove"]),
        "the filled Remove bookmark"
      );
      removeButton.click();

      // In a collection, Instagram asks whether to remove only from this
      // collection or from everything saved. Choose the exact "Remove" action.
      const confirmationDialog = await waitFor(
        () => [...document.querySelectorAll('[role="dialog"]')].find(
          (candidate) =>
            candidate !== dialog &&
            isVisible(candidate) &&
            candidate.textContent?.includes("Remove From Saved and Collections?") &&
            controlWithExactText(candidate, "Remove")
        ),
        "the Remove From Saved and Collections confirmation"
      );
      const confirmRemoveButton = controlWithExactText(confirmationDialog, "Remove");
      if (!confirmRemoveButton) {
        throw new Error('Could not safely identify the exact "Remove" confirmation button.');
      }
      confirmRemoveButton.click();

      await waitFor(
        () =>
          !document.body.contains(confirmationDialog) ||
          !isVisible(confirmationDialog),
        "the removal confirmation to close"
      );

      // Count an item only after Instagram changes or removes the bookmark.
      await waitFor(
        () =>
          !document.body.contains(removeButton) ||
          !isVisible(removeButton) ||
          controlWithSvgLabel(dialog, ["Save"]) ||
          !controlWithSvgLabel(dialog, ["Remove"]),
        "the bookmark to change to its unsaved state"
      );

      if (document.body.contains(dialog) && isVisible(dialog)) {
        // The overlay's close control is frequently a sibling of the dialog.
        const closeButton = controlWithSvgLabel(document, ["Close"]);
        if (!closeButton) {
          throw new Error("Could not safely identify the dialog's Close button.");
        }
        closeButton.click();
        await waitFor(
          () => !document.body.contains(dialog) || !isVisible(dialog),
          "the post dialog to close"
        );
      }

      processed.add(postUrl);
      count += 1;
      console.info(`Unsave complete: ${count}`, postUrl);
      await sleep(randomDelay());
    }

    if (count >= SETTINGS.maximumItems) {
      console.warn(`Stopped at the safety limit of ${SETTINGS.maximumItems} items.`);
    } else if (stopped) {
      console.warn(`Stopped by user after ${count} item(s).`);
    } else {
      if (SETTINGS.clearConsoleOnSuccess) console.clear();
      console.info(`Finished. Completely unsaved ${count} item(s).`);
    }
  } catch (error) {
    stopped = true;
    console.error("Stopped safely:", error);
    console.info("No further posts will be changed. Reload Instagram before retrying.");
  } finally {
    document.removeEventListener("keydown", onKeyDown, true);
  }
})();
