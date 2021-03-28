"use strict";

// Select elements
const currencyDropdown = document.querySelectorAll(".currency");
const fromSelect = document.querySelector("#from");
const toSelect = document.querySelector("#to");
const periodSeparator = document.querySelector('#period-separator');
const commaSeparator = document.querySelector('#comma-separator');
const inputNumber = document.querySelector('#input-number');
const fromCurrency = document.querySelector('#from-currency');
const toCurrency = document.querySelector('#to-currency');

// Load correct toggle, i.e. on or off according to previous setting and set dark theme if selected in options
// Also load correct decimal separator
let container = document.createElement('div');
container.className = 'center';
let label = document.createElement('label');
label.className = 'switch';
let toggleSwitch = document.createElement('input');
toggleSwitch.type = 'checkbox';
let slider = document.createElement('span');
slider.className = 'slider';

label.appendChild(toggleSwitch);
label.appendChild(slider);
container.appendChild(label);

let selects = document.querySelectorAll('select');

chrome.storage.sync.get({'toggle': 'on', 'darkTheme': 'false', 'decimalSeparator' : 'period'}, function(result) {
    if (result.toggle === 'on') {
        toggleSwitch.checked = true;
        if (result.darkTheme === 'true') {
            document.body.style.background = '#393939';
            document.body.style.color = '#E3E3E3';
            selects.forEach(function(element) {
                element.style.background = '#636363';
                element.style.color = '#F3F3F3';
            });
            inputNumber.style.background = '#636363';
            inputNumber.style.color = '#F3F3F3';
        }
    } else {
        toggleSwitch.checked = false;
        document.body.style.background = 'dimgray';
        document.body.style.color = '#3D3D3D';
        selects.forEach((select) => {
            select.style.background = 'gray';
            select.style.color = '#3D3D3D';
        });
        inputNumber.style.background = 'gray';
        inputNumber.style.color = '#3D3D3D';

        let coverPeriod = document.createElement('div');
        let periodSeparatorRect = periodSeparator.getBoundingClientRect();
        coverPeriod.style.height = periodSeparatorRect.height + 'px';
        coverPeriod.style.width = periodSeparatorRect.width + 'px';
        coverPeriod.style.top = periodSeparatorRect.top + 35 + 'px';
        coverPeriod.style.left = periodSeparatorRect.left + 'px';
        coverPeriod.className = 'cover';
        
        let coverComma = document.createElement('div');
        let commaSeparatorRect = commaSeparator.getBoundingClientRect();
        coverComma.style.height = commaSeparatorRect.height + 'px';
        coverComma.style.width = commaSeparatorRect.width + 'px';
        coverComma.style.top = commaSeparatorRect.top + 35 + 'px';
        coverComma.style.left = commaSeparatorRect.left + 'px';
        coverComma.className = 'cover';
        if (result.darkTheme === 'true') {
            document.body.style.background = '#262626';
            document.body.style.color = '#545454';
            selects.forEach(function(element) {
                element.style.background = '#424242';
                element.style.color = '#545454';
            });
            inputNumber.style.background = '#424242';
            inputNumber.style.color = '#545454';
            coverPeriod.className = 'cover-dark';
            coverComma.className = 'cover-dark';
        }
        document.body.appendChild(coverPeriod);
        document.body.appendChild(coverComma);
    }
    document.body.insertBefore(container, document.body.firstChild);

    // Set radio button to saved decimal separator
    (result.decimalSeparator === 'period') ? periodSeparator.checked = true : commaSeparator.checked = true;
});

// Deal with toggle selection and save such selection, i.e. on or off
toggleSwitch.addEventListener('change', function() {
    chrome.storage.sync.get({'toggle': 'on', 'darkTheme': 'false'}, function(result) {
        let oldCovers = document.querySelectorAll('.cover');
        let oldCoversDark = document.querySelectorAll('.cover-dark');
        if (oldCovers) {
            oldCovers.forEach((cover) => {
                document.body.removeChild(cover);
            })
        }
        if (oldCoversDark) {
            oldCoversDark.forEach((cover) => {
                document.body.removeChild(cover);
            })
        }
        if (result.toggle === 'on') {
            chrome.storage.sync.set({'toggle' : 'off'});
            let coverPeriod = document.createElement('div');
            let periodSeparatorRect = periodSeparator.getBoundingClientRect();
            coverPeriod.style.height = periodSeparatorRect.height + 'px';
            coverPeriod.style.width = periodSeparatorRect.width + 'px';
            coverPeriod.style.top = periodSeparatorRect.top + 'px';
            coverPeriod.style.left = periodSeparatorRect.left + 'px';
            coverPeriod.className = 'cover';
            
            let coverComma = document.createElement('div');
            let commaSeparatorRect = commaSeparator.getBoundingClientRect();
            coverComma.style.height = commaSeparatorRect.height + 'px';
            coverComma.style.width = commaSeparatorRect.width + 'px';
            coverComma.style.top = commaSeparatorRect.top + 'px';
            coverComma.style.left = commaSeparatorRect.left + 'px';
            coverComma.className = 'cover';
            if (result.darkTheme === 'true') {
                document.body.style.background = '#262626';
                document.body.style.color = '#545454';
                selects.forEach(function(element) {
                    element.style.background = '#424242';
                    element.style.color = '#545454';
                });
                inputNumber.style.background = '#424242';
                inputNumber.style.color = '#545454';
                coverPeriod.className = 'cover-dark';
                coverComma.className = 'cover-dark';
            } else {
                document.body.style.background = 'dimgray';
                document.body.style.color = '#3D3D3D';
                selects.forEach((select) => {
                    select.style.background = 'gray';
                    select.style.color = '#3D3D3D';
                });
                inputNumber.style.background = 'gray';
                inputNumber.style.color = '#3D3D3D';
                coverPeriod.className = 'cover';
                coverComma.className = 'cover';
            }
            document.body.appendChild(coverPeriod);
            document.body.appendChild(coverComma);
            chrome.browserAction.setIcon({path: 'icons/extension_icon_128(off).png'});
        } else {
            chrome.storage.sync.set({'toggle' : 'on'});
            if (result.darkTheme === 'true') {
                document.body.style.background = ' #393939';
                document.body.style.color = '#E3E3E3';
                selects.forEach(function(element) {
                    element.style.background = '#636363';
                    element.style.color = '#F3F3F3';
                });
                inputNumber.style.background = '#636363';
                inputNumber.style.color = '#F3F3F3';
            } else {
                document.body.style.background = null;
                selects.forEach((element) => element.style.background = null);
                inputNumber.style.background = null;
            }
            chrome.browserAction.setIcon({path: 'icons/extension_icon_128.png'});
        }
    });
});

// Get currencies list from chrome storage to populate dropdown selectors
chrome.storage.sync.get({'latestRates' : '', 'from' : 'USD', 'to' : 'EUR'}, function(result) {
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < Object.keys(result.latestRates.rates).length; j++) {
            let option = document.createElement("option");
            option.text = Object.keys(result.latestRates.rates)[j];
            currencyDropdown[i].add(option);
        };
    };

    // Set currency dropdown to previously selected currencies and show exchange rate at bottom of popup
    if (result.from && result.to) {
        fromSelect.value = result.from;
        toSelect.value = result.to;
        exchangeRate(result);
    };
});

// Save selected currencies in chrome storage each time currencies are changed and update exchange rate displayed
fromSelect.addEventListener("change", function() {
    chrome.storage.sync.set({"from": fromSelect.value});
    let oldDate = document.querySelector('.date');
    if (oldDate) document.body.removeChild(oldDate);
    chrome.storage.sync.get({'latestRates' : '', 'from' : 'USD', 'to' : 'EUR'}, function(result) {
        exchangeRate(result);
    });
});

toSelect.addEventListener("change", function() {
    chrome.storage.sync.set({"to": toSelect.value});
    let oldDate = document.querySelector('.date');
    if (oldDate) document.body.removeChild(oldDate);
    chrome.storage.sync.get({'latestRates' : '', 'from' : 'USD', 'to' : 'EUR'}, function(result) {
        exchangeRate(result);
    });
});

// Save decimal separator selection
periodSeparator.addEventListener('click', function() {
    chrome.storage.sync.set({'decimalSeparator' : 'period'});
});
commaSeparator.addEventListener('click', function() {
    chrome.storage.sync.set({'decimalSeparator' : 'comma'});
});

// function to add exchange rate and date of exchange rates obtained to bottom of popup
function exchangeRate(result) {
    inputNumber.value = 1;
    fromCurrency.innerText = `${result.from}`
    let rateValue = (result.latestRates.rates[result.to] / result.latestRates.rates[result.from]).toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4});
    toCurrency.innerText = `${result.to} ${rateValue}`;

    let date = document.createElement('div');
    date.className = 'date';
    date.innerText = `As at ${result.latestRates.date}`;
    let reload = document.createElement('div');
    reload.className = 'reload';
    reload.innerHTML = ` &#x21BB;`;
    reload.addEventListener('click', function() {
        fetch('https://api.exchangerate.host/latest', {
            method: 'GET',
            headers: {'cache-control' : 'no-cache'}
        })
            .then(response => response.json())
            .then(result => chrome.storage.sync.set({'latestRates' : result}))
            .then(() => {
                let event = new Event('change');
                fromSelect.dispatchEvent(event);
            })
    });
    date.appendChild(reload);
    document.body.appendChild(date);
};

// Listener for the when other numbers are entered into the number input area
inputNumber.addEventListener('change', function() {
    chrome.storage.sync.get({'latestRates' : '', 'from' : 'USD', 'to' : 'EUR'}, function(result) {
        let rateValue = (result.latestRates.rates[result.to] / result.latestRates.rates[result.from]).toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4});
        let decimals = 4;
        let numberToConvert = inputNumber.value.replace(/,/g, '.');
        if (numberToConvert != 1) decimals = 2;  
        toCurrency.innerText = `${result.to} ${(rateValue * numberToConvert).toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}`;    
    });
});

// Restrict input for the number input area to the given inputFilter function
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
        textbox.addEventListener(event, function() {
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
};
setInputFilter(inputNumber, function(value) {
    return /^\d*[.,]?\d*$/.test(value); // Allow only positive numbers of the format 123.45 or 123,45
});

// Listener for when the shortcut to toggle extension on/off is pressed
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.toggle === "sc-pressed") {
        let event = new Event('change');
        toggleSwitch.dispatchEvent(event);
        if (toggleSwitch.checked) {
            toggleSwitch.checked = false;
        } else {
            toggleSwitch.checked = true;
        }
        sendResponse({message: "toggledInPopup"});
    }
});

// Let background script know if popup is open or closed, i.e. create connection with background script
// when popup is open, and fire an ondisconnect event in background script when popup closes 
chrome.storage.sync.set({'popup' : 'open'});
chrome.runtime.connect();