"use strict";

// Select elements
const currencyDropdown = document.querySelectorAll(".currency");
const fromSelect = document.querySelector("#from");
const toSelect = document.querySelector("#to");
const swapButton = document.querySelector("#swap-button");
const periodSeparator = document.querySelector("#period-separator");
const commaSeparator = document.querySelector("#comma-separator");
const inputNumber = document.querySelector("#input-number");
const fromCurrency = document.querySelector("#from-currency");
const toCurrency = document.querySelector("#to-currency");
const coverAll = document.querySelector(".cover-all");

// Load correct toggle, i.e. on or off according to previous setting and set dark theme if selected in options
// Also load correct decimal separator
const container = document.createElement("div");
container.className = "center-button";
const label = document.createElement("label");
label.className = "switch";
const toggleSwitch = document.createElement("input");
toggleSwitch.type = "checkbox";
const slider = document.createElement("span");
slider.className = "slider";

label.appendChild(toggleSwitch);
label.appendChild(slider);
container.appendChild(label);

const selects = document.querySelectorAll("select");

let rotateDeg = 0;

// API key (if you are seeing this, don't even think about exploiting this key)
const apiKey = "fca_live_2MrxM1YLNE1b4FkOopQQ4RXIMaRjoYnDTHwyfFwr";

chrome.storage.sync.get(
  {
    toggle: "on",
    darkTheme: "false",
    decimalSeparator: "period",
    latestRates: "",
  },
  (result) => {
    // Check if toggle is on or off
    if (result.toggle === "on") {
      toggleSwitch.checked = true;
    } else {
      toggleSwitch.checked = false;
      coverAll.style.display = "block";
    }

    // Check if dark theme is set
    if (result.darkTheme === "true") {
      document.body.style.background = "#393939";
      document.body.style.color = "#E3E3E3";
      selects.forEach((element) => {
        element.style.background = "#636363";
        element.style.color = "#F3F3F3";
      });
      swapButton.style.background = "#636363";
      swapButton.style.color = "#F3F3F3";
      inputNumber.style.background = "#636363";
      inputNumber.style.color = "#F3F3F3";
    }

    document.body.insertBefore(container, document.body.firstChild);

    // Set radio button to saved decimal separator
    result.decimalSeparator === "period"
      ? (periodSeparator.checked = true)
      : (commaSeparator.checked = true);

    // Add exchange rates date and update rates button event listener
    const updateRatesButton = document.querySelector(".reload");
    const ratesDate = document.querySelector("#rates-date");

    ratesDate.innerText = new Date(
      result.latestRates.date
    ).toLocaleDateString();

    updateRatesButton.addEventListener("click", () => {
      rotateDeg += 360;
      updateRatesButton.style.transform = `rotate(${rotateDeg}deg)`;
      updateRatesButton.style.pointerEvents = "none";
      setTimeout(() => {
        updateRatesButton.style.pointerEvents = "auto";
      }, 1000);

      chrome.storage.sync.get("latestRates", (result) => {
        // Update rates only if older than 12 hours
        const twelveHoursInMS = 3600000 * 12;
        if (Date.now() - twelveHoursInMS > Number(result.date)) {
          fetch("https://api.freecurrencyapi.com/v1/latest", {
            method: "GET",
            headers: { apiKey },
          })
            .then((response) => response.json())
            .then((result) => {
              chrome.storage.sync.set({
                latestRates: { date: Date.now(), rates: result },
              });
              const event = new Event("change");
              fromSelect.dispatchEvent(event);
              ratesDate.innerText = new Date(
                result.latestRates.date
              ).toLocaleDateString();
            });
        }
      });
    });
  }
);

// Deal with toggle selection and save such selection, i.e. on or off
toggleSwitch.addEventListener("change", () => {
  chrome.storage.sync.get({ toggle: "on", darkTheme: "false" }, (result) => {
    if (result.toggle === "on") {
      chrome.storage.sync.set({ toggle: "off" });
      coverAll.style.display = "block";
      chrome.action.setIcon({ path: "icons/extension_icon_128(off).png" });
    } else {
      chrome.storage.sync.set({ toggle: "on" });
      coverAll.style.display = "none";
      chrome.action.setIcon({ path: "icons/extension_icon_128.png" });
    }
  });
});

// Get currencies list from chrome storage to populate dropdown selectors
chrome.storage.sync.get(
  { latestRates: "", from: "USD", to: "EUR" },
  (result) => {
    for (let i = 0; i < 2; i++) {
      for (
        let j = 0;
        j < Object.keys(result.latestRates.rates.data).length;
        j++
      ) {
        let option = document.createElement("option");
        option.text = Object.keys(result.latestRates.rates.data)[j];
        currencyDropdown[i].add(option);
      }
    }

    // Set currency dropdown to previously selected currencies and show exchange rate at bottom of popup
    if (result.from && result.to) {
      fromSelect.value = result.from;
      toSelect.value = result.to;
      exchangeRate(result);
    }
  }
);

// Save selected currencies in chrome storage each time currencies are changed and update exchange rate displayed
fromSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ from: fromSelect.value });
  chrome.storage.sync.get(
    { latestRates: "", from: "USD", to: "EUR" },
    (result) => {
      exchangeRate(result);
    }
  );

  // Unhighlight all saved pair buttons when selecting new currencies
  document.querySelectorAll(".saved-pair-button").forEach((elem) => {
    elem.classList.remove("selected-button");
    elem.classList.remove("selected-button-dark");
    chrome.storage.sync.set({ savedNumber: "none" });
  });
});

toSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ to: toSelect.value });
  chrome.storage.sync.get(
    { latestRates: "", from: "USD", to: "EUR" },
    (result) => {
      exchangeRate(result);
    }
  );

  // Unhighlight all saved pair buttons when selecting new currencies
  document.querySelectorAll(".saved-pair-button").forEach((elem) => {
    elem.classList.remove("selected-button");
    elem.classList.remove("selected-button-dark");
    chrome.storage.sync.set({ savedNumber: "none" });
  });
});

// function to update exchange rates shown on bottom after selecting new currencies
function exchangeRate(result) {
  inputNumber.value = 1;
  fromCurrency.innerText = `${result.from}`;
  let rateValue = (
    result.latestRates.rates.data[result.to] /
    result.latestRates.rates.data[result.from]
  ).toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
  toCurrency.innerText = `${result.to} ${rateValue}`;
}

// Add functionality to swap button, i.e. swaps currencies back and forth when clicked
swapButton.addEventListener("click", () => {
  let fromSelectTemp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = fromSelectTemp;

  let event = new Event("change");
  fromSelect.dispatchEvent(event);
  toSelect.dispatchEvent(event);
});

// Load saved pairs buttons
const savedPairsContainer = document.querySelector(".saved-pairs-container");
chrome.storage.sync.get(
  { savedPairs: "", darkTheme: "false", savedNumber: "none" },
  (result) => {
    let pairsAmount = Object.keys(result.savedPairs).length / 2;
    for (let i = 1; i <= pairsAmount; i++) {
      let savedPairButton = document.createElement("div");

      result.darkTheme === "true"
        ? savedPairButton.classList.add(
            "saved-pair-button",
            "saved-pair-button-dark"
          )
        : savedPairButton.classList.add("saved-pair-button");
      savedPairButton.innerHTML = i;

      // Change currencies to saved pair on click of relevant button
      savedPairButton.addEventListener("click", (e) => {
        let number = e.target.innerHTML;
        fromSelect.value = result.savedPairs[`from${number}`];
        toSelect.value = result.savedPairs[`to${number}`];

        let event = new Event("change");
        fromSelect.dispatchEvent(event);
        toSelect.dispatchEvent(event);

        // Highlight selected and unhighlight others
        document.querySelectorAll(".saved-pair-button").forEach((elem) => {
          elem.classList.remove("selected-button");
          elem.classList.remove("selected-button-dark");
        });
        result.darkTheme === "true"
          ? e.target.classList.add("selected-button-dark")
          : e.target.classList.add("selected-button");

        // Record which saved pair number was clicked so it stays highlighted when unchanged
        chrome.storage.sync.set({ savedNumber: number });
      });

      // Show pair value when hovering with mouse
      let previousFrom;
      let previousTo;
      savedPairButton.addEventListener("mouseenter", (e) => {
        previousFrom = fromSelect.value;
        previousTo = toSelect.value;
        fromSelect.value = result.savedPairs[`from${e.target.innerHTML}`];
        toSelect.value = result.savedPairs[`to${e.target.innerHTML}`];
        fromSelect.classList.add("preview");
        toSelect.classList.add("preview");
      });
      savedPairButton.addEventListener("mouseleave", () => {
        chrome.storage.sync.get(["savedPairs", "savedNumber"], (result) => {
          if (result.savedNumber !== "none") {
            fromSelect.value = result.savedPairs[`from${result.savedNumber}`];
            toSelect.value = result.savedPairs[`to${result.savedNumber}`];
          } else {
            fromSelect.value = previousFrom;
            toSelect.value = previousTo;
          }
          fromSelect.classList.remove("preview");
          toSelect.classList.remove("preview");
        });
      });

      // Highlight relevant button if previously set
      if (result.savedNumber == i) {
        result.darkTheme === "true"
          ? savedPairButton.classList.add("selected-button-dark")
          : savedPairButton.classList.add("selected-button");

        // Set currency pair to saved values
        fromSelect.value = result.savedPairs[`from${i}`];
        toSelect.value = result.savedPairs[`to${i}`];
      }

      savedPairsContainer.appendChild(savedPairButton);
    }
  }
);

// Save decimal separator selection
periodSeparator.addEventListener("click", () => {
  chrome.storage.sync.set({ decimalSeparator: "period" });
});
commaSeparator.addEventListener("click", () => {
  chrome.storage.sync.set({ decimalSeparator: "comma" });
});

// Listener for the when other numbers are entered into the number input area
inputNumber.addEventListener("change", () => {
  chrome.storage.sync.get(
    { latestRates: "", from: "USD", to: "EUR" },
    (result) => {
      let rateValue = (
        result.latestRates.rates.data[result.to] /
        result.latestRates.rates.data[result.from]
      ).toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
      let decimals = 4;
      let numberToConvert = inputNumber.value.replace(/,/g, ".");
      if (numberToConvert != 1) decimals = 2;
      toCurrency.innerText = `${result.to} ${(
        rateValue * numberToConvert
      ).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    }
  );
});

// Restrict input for the number input area to the given inputFilter function
function setInputFilter(textbox, inputFilter) {
  [
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mouseup",
    "select",
    "contextmenu",
    "drop",
  ].forEach(function (event) {
    textbox.addEventListener(event, function () {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });
}
setInputFilter(inputNumber, function (value) {
  return /^\d*[.,]?\d*$/.test(value); // Allow only positive numbers of the format 123.45 or 123,45
});

// Listener for when the shortcut to toggle extension on/off is pressed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.toggle === "sc-pressed") {
    let event = new Event("change");
    toggleSwitch.dispatchEvent(event);
    if (toggleSwitch.checked) {
      toggleSwitch.checked = false;
    } else {
      toggleSwitch.checked = true;
    }
    sendResponse({ message: "toggledInPopup" });
  }
});

// Let background script know if popup is open or closed, i.e. create connection with background script
// when popup is open, and fire an ondisconnect event in background script when popup closes
chrome.storage.sync.set({ popup: "open" });
chrome.runtime.connect();
