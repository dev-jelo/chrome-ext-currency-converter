"use strict";

// Upon install, get exchange rates and currencies from exchangerate.host site and store in browser storage
browser.runtime.onInstalled.addListener(function () {
  // Set http request header so that there will be a check if there are changes in the json compared to the browser cached version
  fetch("https://api.exchangerate.host/latest", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => browser.storage.sync.set({ latestRates: result }));

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

// Update latest exchange rates to browser storage when opening browser
browser.runtime.onStartup.addListener(function () {
  fetch("https://api.exchangerate.host/latest", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => browser.storage.sync.set({ latestRates: result }));
});

// Set alarm to update the exchange rates every 6 hours for when browser is not restarted in that time
browser.alarms.create("alarm", { periodInMinutes: 360 });
browser.alarms.onAlarm.addListener(function () {
  fetch("https://api.exchangerate.host/latest", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      browser.storage.sync.set({ latestRates: result });
      console.log("rates updated");
    });
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
