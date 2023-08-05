"use strict";

// Check if Google Fonts are being used and put link into <head> section if needed
browser.storage.sync.get(
  { GoogleFonts: "false", boxFontLink: "" },
  (result) => {
    if (result.GoogleFonts === "true") {
      document.head.insertAdjacentHTML("beforeend", result.boxFontLink);
    }
  }
);

// Run convertCurrency function when clicking on the page
document.addEventListener("click", (e) => {
  browser.storage.sync.get({ toggle: "on" }, (result) => {
    if (result.toggle === "on") convertCurrency(e);
  });
});

// Function to convert highlighted number to selected currency
function convertCurrency(e) {
  // First check if the highlighted is a valid number then check if correct key is held while selecting
  browser.storage.sync.get(
    {
      latestRates: "",
      decimalSeparator: "period",
      from: "USD",
      to: "EUR",
      key: "Ctrl",
      position: "below",
      boxColour: "lightyellow",
      boxBorderColour: "grey",
      boxShadowColour: "grey",
      boxFont: "Arial, sans-serif",
      boxFontColour: "black",
      boxFontSize: "13px",
      GoogleFonts: "false",
      boxFontLink: "",
    },
    function (result) {
      if (result.decimalSeparator === "period") {
        let selectedNum = Number(
          document.getSelection().toString().replace(/,/g, "")
        );
        if (!selectedNum) return;
        testKeyHeld(result, selectedNum);
      } else {
        let selectedNum = Number(
          document
            .getSelection()
            .toString()
            .replace(/\./g, "")
            .replace(/,/g, ".")
        );
        if (!selectedNum) return;
        testKeyHeld(result, selectedNum);
      }

      function testKeyHeld(result, selectedNum) {
        if (result.key === "Ctrl" && e.ctrlKey) {
          getRates(result, selectedNum);
        } else if (result.key === "Alt" && e.altKey) {
          getRates(result, selectedNum);
        } else if (result.key === "Shift" && e.shiftKey) {
          getRates(result, selectedNum);
        } else if (result.key === "Cmd" && e.metaKey) {
          getRates(result, selectedNum);
        } else if (result.key === "None") {
          getRates(result, selectedNum);
        }
      }
    }
  );

  function getRates(result, selectedNum) {
    let rate =
      result.latestRates.rates[result.to] /
      result.latestRates.rates[result.from];
    let convertedNum = (selectedNum * rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    displayPopup(result, convertedNum);
  }
}

// Function to display popup for the converted currency value
function displayPopup(result, convertedNum) {
  // Get the location of the highlighted number to determine the location of the popup box
  let selectedLocation = document
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();

  // Create div elements for the popup box
  let box = document.createElement("div");
  let arrow = document.createElement("div");
  let arrowBorder = document.createElement("div");

  // Add popup box and the popup box arrow and arrow border to display converted currency
  box.className = "currency-popup";
  box.style.left =
    selectedLocation.left + selectedLocation.width / 2 + window.scrollX + "px";
  box.style.top = selectedLocation.bottom + 10 + window.scrollY + "px";
  box.style.background = result.boxColour;
  box.style.border = `1px solid ${result.boxBorderColour}`;
  box.style.borderRadius = "3px";
  box.style.boxShadow = `0 0 7px 1px ${result.boxShadowColour}`;
  box.style.color = result.boxFontColour;
  box.style.fontFamily = result.boxFont;
  box.style.fontSize = result.boxFontSize;
  box.style.padding = "0.5em";
  box.style.position = "absolute";
  box.style.transform = "translateX(-50%)";
  box.style.whiteSpace = "nowrap";
  box.style.zIndex = "100000000";
  box.innerText = `${result.to} ${convertedNum}`;
  box.addEventListener("click", (e) => e.stopPropagation()); // Stop the popup from closing when clicking on it, since it might be useful to copy the value inside
  box.style.visibility = "hidden";
  document.body.appendChild(box);

  arrowBorder.className = "currency-popup";
  arrowBorder.style.borderLeft = "9px solid transparent";
  arrowBorder.style.borderRight = "9px solid transparent";
  arrowBorder.style.borderBottom = `9px solid ${result.boxBorderColour}`;
  arrowBorder.style.top = selectedLocation.bottom + 1 + window.scrollY + "px";
  arrowBorder.style.left =
    selectedLocation.left + selectedLocation.width / 2 + window.scrollX + "px";
  arrowBorder.style.height = "0";
  arrowBorder.style.position = "absolute";
  arrowBorder.style.transform = "translateX(-50%)";
  arrowBorder.style.width = "0";
  arrowBorder.style.zIndex = "100000000";

  arrow.className = "currency-popup";
  arrow.style.borderLeft = "9px solid transparent";
  arrow.style.borderRight = "9px solid transparent";
  arrow.style.borderBottom = `9px solid ${result.boxColour}`;
  arrow.style.top = selectedLocation.bottom + 2 + window.scrollY + "px";
  arrow.style.left =
    selectedLocation.left + selectedLocation.width / 2 + window.scrollX + "px";
  arrow.style.height = "0";
  arrow.style.position = "absolute";
  arrow.style.transform = "translateX(-50%)";
  arrow.style.width = "0";
  arrow.style.zIndex = "100000000";

  // fixes for if the popup box goes beyond the window edge and also adjust box for above or below selection
  let boxPos = box.getBoundingClientRect();
  if (result.position === "above") {
    box.style.top =
      selectedLocation.top - boxPos.height - 10 + window.scrollY + "px";
    boxPos = box.getBoundingClientRect();
    arrowBorder.style.top = selectedLocation.top - 10 + window.scrollY + "px";
    arrowBorder.style.borderTop = `9px solid ${result.boxBorderColour}`;
    arrowBorder.style.borderBottom = null;
    arrow.style.top = selectedLocation.top - 11 + window.scrollY + "px";
    arrow.style.borderTop = `9px solid ${result.boxColour}`;
    arrow.style.borderBottom = null;
    if (boxPos.left < 0) {
      box.style.transform = "none";
      box.style.left = window.scrollX + "px";
      if (boxPos.top < 0) {
        box.style.top = selectedLocation.bottom + 10 + window.scrollY + "px";
        arrowBorder.style.top =
          selectedLocation.bottom + 1 + window.scrollY + "px";
        arrowBorder.style.borderTop = null;
        arrowBorder.style.borderBottom = `9px solid ${result.boxBorderColour}`;
        arrow.style.top = selectedLocation.bottom + 2 + window.scrollY + "px";
        arrow.style.borderTop = null;
        arrow.style.borderBottom = `9px solid ${result.boxColour}`;
      }
    } else if (boxPos.right > document.documentElement.clientWidth) {
      box.style.transform = "none";
      box.style.left =
        document.documentElement.clientWidth -
        boxPos.width +
        window.scrollX +
        "px";
      if (boxPos.top < 0) {
        box.style.top = selectedLocation.bottom + 10 + window.scrollY + "px";
        arrowBorder.style.top =
          selectedLocation.bottom + 1 + window.scrollY + "px";
        arrowBorder.style.borderTop = null;
        arrowBorder.style.borderBottom = `9px solid ${result.boxBorderColour}`;
        arrow.style.top = selectedLocation.bottom + 2 + window.scrollY + "px";
        arrow.style.borderTop = null;
        arrow.style.borderBottom = `9px solid ${result.boxColour}`;
      }
    } else if (boxPos.top < 0) {
      box.style.top = selectedLocation.bottom + 10 + window.scrollY + "px";
      arrowBorder.style.top =
        selectedLocation.bottom + 1 + window.scrollY + "px";
      arrowBorder.style.borderTop = null;
      arrowBorder.style.borderBottom = `9px solid ${result.boxBorderColour}`;
      arrow.style.top = selectedLocation.bottom + 2 + window.scrollY + "px";
      arrow.style.borderTop = null;
      arrow.style.borderBottom = `9px solid ${result.boxColour}`;
    }
  } else {
    if (boxPos.left < 0) {
      box.style.transform = "none";
      box.style.left = window.scrollX + "px";
      if (boxPos.bottom > document.documentElement.clientHeight) {
        box.style.top =
          selectedLocation.top - boxPos.height - 10 + window.scrollY + "px";
        arrowBorder.style.top =
          selectedLocation.top - 10 + window.scrollY + "px";
        arrowBorder.style.borderTop = `9px solid ${result.boxBorderColour}`;
        arrowBorder.style.borderBottom = null;
        arrow.style.top = selectedLocation.top - 11 + window.scrollY + "px";
        arrow.style.borderTop = `9px solid ${result.boxColour}`;
        arrow.style.borderBottom = null;
      }
    } else if (boxPos.right > document.documentElement.clientWidth) {
      box.style.transform = "none";
      box.style.left =
        document.documentElement.clientWidth -
        boxPos.width +
        window.scrollX +
        "px";
      if (boxPos.bottom > document.documentElement.clientHeight) {
        box.style.top =
          selectedLocation.top - boxPos.height - 10 + window.scrollY + "px";
        arrowBorder.style.top =
          selectedLocation.top - 10 + window.scrollY + "px";
        arrowBorder.style.borderTop = `9px solid ${result.boxBorderColour}`;
        arrowBorder.style.borderBottom = null;
        arrow.style.top = selectedLocation.top - 11 + window.scrollY + "px";
        arrow.style.borderTop = `9px solid ${result.boxColour}`;
        arrow.style.borderBottom = null;
      }
    } else if (boxPos.bottom > document.documentElement.clientHeight) {
      box.style.top =
        selectedLocation.top - boxPos.height - 10 + window.scrollY + "px";
      arrowBorder.style.top = selectedLocation.top - 10 + window.scrollY + "px";
      arrowBorder.style.borderTop = `9px solid ${result.boxBorderColour}`;
      arrowBorder.style.borderBottom = null;
      arrow.style.top = selectedLocation.top - 11 + window.scrollY + "px";
      arrow.style.borderTop = `9px solid ${result.boxColour}`;
      arrow.style.borderBottom = null;
    }
  }

  box.style.visibility = "visible";
  document.body.appendChild(arrowBorder);
  document.body.appendChild(arrow);

  // Close popup when clicking anywhere on the page and when resizing the window
  document.addEventListener("click", closePopup, { once: true });
  window.addEventListener("resize", closePopup, { once: true });
}

// Function for closing the popup
function closePopup() {
  let popups = document.querySelectorAll(".currency-popup");
  if (!popups[0]) {
    return;
  } else {
    for (let i = 0; i < popups.length; i++) {
      document.body.removeChild(popups[i]);
    }
  }
}
