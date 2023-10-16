"use strict";

// API key (if you are seeing this, don't even think about exploiting this key)
const apiKey = "fca_live_2MrxM1YLNE1b4FkOopQQ4RXIMaRjoYnDTHwyfFwr";

// Upon install, fetch exchange rates and currencies and store in chrome storage
chrome.runtime.onInstalled.addListener(function () {
  // Fetch rates and add current date to fetched results object to restrict to daily updates
  fetch("https://api.freecurrencyapi.com/v1/latest", {
    method: "GET",
    headers: { apiKey },
  })
    .then((response) => response.json())
    .then((result) =>
      chrome.storage.sync.set({
        latestRates: { date: Date.now(), rates: result },
      })
    );

  // Check if there are previously saved currency pairs, load defaults if not
  const defaultPairs = {
    from1: "USD",
    to1: "EUR",
    from2: "EUR",
    to2: "GBP",
    from3: "JPY",
    to3: "AUD",
  };
  chrome.storage.sync.get({ savedPairs: defaultPairs }, (result) => {
    chrome.storage.sync.set({ savedPairs: result.savedPairs });
  });
});

// Update latest exchange rates to chrome storage when opening browser if saved rates are older than 12 hours
chrome.runtime.onStartup.addListener(function () {
  chrome.storage.sync.get("latestRates", (result) => {
    const twelveHoursInMS = 3600000 * 12;
    if (Date.now() - twelveHoursInMS > Number(result.latestRates.date)) {
      fetch("https://api.freecurrencyapi.com/v1/latest", {
        method: "GET",
        headers: { apiKey },
      })
        .then((response) => response.json())
        .then((result) =>
          chrome.storage.sync.set({
            latestRates: { date: Date.now(), rates: result },
          })
        );
    }
  });
});

// Set alarm to check for new rates every 3 hours for when chrome is not restarted in that time
chrome.alarms.create("alarm", { periodInMinutes: 180 });
chrome.alarms.onAlarm.addListener(function () {
  chrome.storage.sync.get("latestRates", (result) => {
    const twelveHoursInMS = 3600000 * 12;
    if (Date.now() - twelveHoursInMS > Number(result.latestRates.date)) {
      fetch("https://api.freecurrencyapi.com/v1/latest", {
        method: "GET",
        headers: { apiKey },
      })
        .then((response) => response.json())
        .then((result) =>
          chrome.storage.sync.set({
            latestRates: { date: Date.now(), rates: result },
          })
        );
    }
  });
});

// Listen for when the shortcut keys are pressed to toggle extension on/off and send message to popup if it is, otherwise just toggle on/off
chrome.runtime.onConnect.addListener(function (port) {
  port.onDisconnect.addListener(() =>
    chrome.storage.sync.set({ popup: "closed" })
  );
});
chrome.commands.onCommand.addListener(function (command) {
  if (command === "toggle-extension") {
    chrome.storage.sync.get({ popup: "closed" }, function (result) {
      if (result.popup === "open") {
        chrome.runtime.sendMessage({ toggle: "sc-pressed" });
      } else {
        chrome.storage.sync.get(["toggle"], function (result) {
          if (result.toggle === "on") {
            chrome.storage.sync.set({ toggle: "off" });
            chrome.action.setIcon({
              path: "icons/extension_icon_128(off).png",
            });
          } else {
            chrome.storage.sync.set({ toggle: "on" });
            chrome.action.setIcon({ path: "icons/extension_icon_128.png" });
          }
        });
      }
    });
  }
});
