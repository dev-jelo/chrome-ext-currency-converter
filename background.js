"use strict";

function fetchRates() {
  fetch("https://d31tvtj54mj8x5.cloudfront.net/rates", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      // Do nothing if no data returned. Likely due to API request limit being reached
      if (!result.data) {
        return;
      }

      browser.storage.sync.set({
        latestRates: { date: result.date, rates: { data: result.data } },
      });
    });
}

// Upon install, get exchange rates and currencies from exchangerate.host site and store in browser storage
browser.runtime.onInstalled.addListener(function () {
  fetchRates();

  // Check if there are previously saved currency pairs, load defaults if not
  const defaultPairs = {
    from1: "USD",
    to1: "EUR",
    from2: "EUR",
    to2: "GBP",
    from3: "JPY",
    to3: "AUD",
  };
  browser.storage.sync.get({ savedPairs: defaultPairs }, (result) => {
    browser.storage.sync.set({ savedPairs: result.savedPairs });
  });
});

// Update latest exchange rates to chrome storage when opening browser if saved rates are older than 12 hours
browser.runtime.onStartup.addListener(function () {
  fetchRates();

  // Set correct icon colour (B&W) for if the extension has been toggled off previously
  browser.storage.sync.get(["toggle"], function (result) {
    if (result.toggle === "off") {
      browser.action.setIcon({
        path: "icons/extension_icon_128(off).png",
      });
    }
  });
});

// Set alarm to check for new rates every 3 hours for when chrome is not restarted in that time
browser.alarms.create("alarm", { periodInMinutes: 180 });
browser.alarms.onAlarm.addListener(function () {
  fetchRates();
});

// Listen for when the shortcut keys are pressed to toggle extension on/off and send message to popup if it is, otherwise just toggle on/off
browser.runtime.onConnect.addListener(function (port) {
  port.onDisconnect.addListener(() =>
    browser.storage.sync.set({ popup: "closed" })
  );
});
browser.commands.onCommand.addListener(function (command) {
  if (command === "toggle-extension") {
    browser.storage.sync.get({ popup: "closed" }, function (result) {
      if (result.popup === "open") {
        browser.runtime.sendMessage({ toggle: "sc-pressed" });
      } else {
        browser.storage.sync.get(["toggle"], function (result) {
          if (result.toggle === "on") {
            browser.storage.sync.set({ toggle: "off" });
            browser.action.setIcon({
              path: "icons/extension_icon_128(off).png",
            });
          } else {
            browser.storage.sync.set({ toggle: "on" });
            browser.action.setIcon({ path: "icons/extension_icon_128.png" });
          }
        });
      }
    });
  }
});
