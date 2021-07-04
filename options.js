"use strict";

// Select elements
const keySelection = document.querySelector('#keys');
const positionAbove = document.querySelector('#position-above');
const positionBelow = document.querySelector('#position-below');
const boxColour = document.querySelector('#box-colour');
const boxBorderColour = document.querySelector('#box-border-colour');
const boxShadowColour = document.querySelector('#box-shadow-colour');
const boxFont = document.querySelector('#box-font');
const boxFontColour = document.querySelector('#box-font-colour');
const boxFontSize = document.querySelector('#box-font-size');
const googleFontsCheckbox = document.querySelector('#Google-fonts-checkbox');
const enableDark = document.querySelector('#enable-dark');
const disableDark = document.querySelector('#disable-dark');
const ratesDate = document.querySelector('#current-rates-date');

// Set previously saved settings
chrome.commands.getAll((commands) => {
    console.log(commands);
    document.querySelector('#shortcut-keys').innerText = commands[0].shortcut;
});

chrome.storage.sync.get({
'latestRates' : '',
'key' : 'Ctrl', 
'position' : 'below',
'boxColour': '#FFFFE0', 
'boxBorderColour' : '#808080', 
'boxShadowColour' : '#808080',
'boxFont' : 'Arial, sans-serif', 
'boxFontColour' : '#000000', 
'boxFontSize' : '13px', 
'GoogleFonts' : 'false', 
'boxFontLink' : '', 
'darkTheme' : 'false'
}, (result) => {
    keySelection.value = result.key;
    boxColour.value = result.boxColour;
    boxBorderColour.value = result.boxBorderColour;
    boxShadowColour.value = result.boxShadowColour;
    boxFont.value = result.boxFont;
    boxFontColour.value = result.boxFontColour;
    boxFontSize.value = result.boxFontSize;
    ratesDate.innerText = result.latestRates.date;

    result.position === 'below' ? positionBelow.checked = true : positionAbove.checked = true;

    if (result.GoogleFonts === 'true') {
        googleFontsCheckbox.checked = true;
        addLinkInputBox(result);
    }

    if (result.darkTheme === 'true') {
        enableDark.checked = true;
        document.body.style.background = '#393939';
        document.body.style.color = '#E3E3E3';
        document.querySelector('select').classList.add('dark');
        document.querySelectorAll('.link').forEach((element) => element.style.color = '#8AB4F8');
        document.querySelectorAll('input').forEach((element) => element.classList.add('dark'));
        document.querySelectorAll('button').forEach((element) => element.classList.add('dark'));
    } else {
        disableDark.checked = true;
    }
});

// Change selection for key to be held down to trigger currency popup
keySelection.addEventListener('change', () => chrome.storage.sync.set({'key': keySelection.value}));

// Save popup box above or below selection
positionAbove.addEventListener('click', () => chrome.storage.sync.set({'position' : 'above'}));
positionBelow.addEventListener('click', () => chrome.storage.sync.set({'position' : 'below'}));

// Add <link> input for using Google Fonts 
googleFontsCheckbox.addEventListener('change', function() {
    chrome.storage.sync.get({'GoogleFonts': 'false', 'boxFontLink': ''}, (result) => {
        if (result.GoogleFonts === 'true') {
            chrome.storage.sync.set({'GoogleFonts' : 'false'});
            document.body.removeChild(document.querySelector('#link-input-label'));
        } else {
            chrome.storage.sync.set({'GoogleFonts' : 'true'});
            addLinkInputBox(result);
        }
    });
});

// function to add <link> input box
function addLinkInputBox(result) {
    let linkInputLabel = document.createElement('label');
    let linkInput = document.createElement('input');
    let lineBreak = document.createElement('br');

    // check if dark mode is on
    if (document.body.style.background) linkInput.className = 'dark';

    linkInputLabel.innerText = '<link>:';
    linkInputLabel.appendChild(lineBreak);
    linkInputLabel.id = 'link-input-label';
    linkInputLabel.style.marginBottom = '0';
    linkInputLabel.style.marginLeft = '5px';
    linkInput.type = 'text';
    linkInput.id = 'box-font-link';
    linkInput.value = result.boxFontLink;
    linkInputLabel.appendChild(linkInput);

    document.querySelector('#font-label').insertAdjacentElement('afterend', linkInputLabel);
};

// Save popup box customisation settings
let saveButton = document.querySelector("#save-box-settings");
saveButton.addEventListener('click', () => {
    chrome.storage.sync.set({
        'boxColour' : boxColour.value, 
        'boxBorderColour' : boxBorderColour.value,
        'boxShadowColour' : boxShadowColour.value,
        'boxFont' : boxFont.value.replace(/(font-family:)|[;]/gi, '').trim(), 
        'boxFontColour' : boxFontColour.value, 
        'boxFontSize' : boxFontSize.value
    });
    let boxFontLink = document.querySelector('#box-font-link');
    if (boxFontLink) chrome.storage.sync.set({'boxFontLink' : boxFontLink.value});
    displaySuccessMessage('Successfully saved popup box settings')
});

// Reload page button
document.querySelector('#reload-page').addEventListener('click', () => location.reload());

// Show preview of popup box
// Check if Google Fonts are being used and put link into <head> section if needed
chrome.storage.sync.get({'GoogleFonts': 'false', 'boxFontLink': ''}, (result) => {
    if (result.GoogleFonts === 'true') document.head.insertAdjacentHTML('beforeend', result.boxFontLink);
});

let previewButton = document.querySelector('#preview-box');
previewButton.addEventListener('click', () => {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    };
    chrome.storage.sync.get({
        'latestRates' : '', 
        'position' : 'below',
        'boxColour' : '#FFFFE0',
        'boxBorderColour' : '#808080',
        'boxShadowColour' : '#808080',
        'boxFont' : 'Arial, sans-serif',
        'boxFontColour' : '#000000',
        'boxFontSize' : '13px',
        'boxFontLink' : ''}, function(result) {
        let location = previewButton.getBoundingClientRect();

        let box = document.createElement('div');
        let arrow = document.createElement('div');
        let arrowBorder = document.createElement('div');
        
        box.className = 'currency-popup';
        box.style.left = location.left + (location.width / 2) + 'px';
        box.style.background = result.boxColour;
        box.style.border = `1px solid ${result.boxBorderColour}`;
        box.style.borderRadius = '3px';
        box.style.boxShadow = `0 0 7px 1px ${result.boxShadowColour}`;
        box.style.color = result.boxFontColour;
        box.style.fontFamily = result.boxFont;
        box.style.fontSize = result.boxFontSize;
        box.style.padding = '0.5em';
        box.style.position = 'absolute';
        box.style.transform = 'translateX(-50%)';
        box.style.whiteSpace = 'nowrap';
        let currenciesArray = Object.keys(result.latestRates.rates);
        box.innerText = `${currenciesArray[getRandomInt(currenciesArray.length)]} ${(getRandomInt(100000)/100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        box.addEventListener('click', (e) => e.stopPropagation());
        box.style.visibility = 'hidden';
        document.body.appendChild(box);

        arrowBorder.className = 'currency-popup';
        arrowBorder.style.left = location.left + (location.width / 2) + 'px';
        arrowBorder.style.top = location.bottom + 1 + window.pageYOffset + 'px';
        arrowBorder.style.borderBottom = `9px solid ${result.boxBorderColour}`;
        arrowBorder.style.borderLeft = '9px solid transparent';
        arrowBorder.style.borderRight = '9px solid transparent';
        arrowBorder.style.height = '0';
        arrowBorder.style.position = 'absolute';
        arrowBorder.style.transform = 'translateX(-50%)';
        arrowBorder.style.width = '0';

        arrow.className = 'currency-popup';
        arrow.style.left = location.left + (location.width / 2) + 'px';
        arrow.style.top = location.bottom + 2 + window.pageYOffset + 'px';
        arrow.style.borderBottom = `9px solid ${result.boxColour}`;
        arrow.style.borderLeft = '9px solid transparent';
        arrow.style.borderRight = '9px solid transparent';
        arrow.style.height = '0';
        arrow.style.position = 'absolute';
        arrow.style.transform = 'translateX(-50%)';
        arrow.style.width = '0';

        // Check if position is above or below
        let boxPos = box.getBoundingClientRect();
        if (result.position === 'below') {
            box.style.top = location.bottom + 10 + window.pageYOffset + 'px';
        } else {
            box.style.top = location.top - boxPos.height - 10 + window.pageYOffset + 'px';
            arrowBorder.style.top = location.top - 10 + window.pageYOffset + 'px';
            arrowBorder.style.borderBottom = null;
            arrowBorder.style.borderTop = `9px solid ${result.boxBorderColour}`;
            arrow.style.top = location.top - 11 + window.pageYOffset + 'px';
            arrow.style.borderBottom = null;
            arrow.style.borderTop = `9px solid ${result.boxColour}`;
        }

        box.style.visibility = 'visible';
        document.body.appendChild(arrowBorder);
        document.body.appendChild(arrow);

        document.addEventListener('click', closePopup, {once: true});
    
        // Function for closing the popup
        function closePopup() {
            let popups = document.querySelectorAll('.currency-popup');
            if (!popups[0]) {
                return;
            } else {
                for (let i = 0; i < popups.length; i++) {
                    document.body.removeChild(popups[i]);
                };
            }
        };
    });
});

// Reset popup box default appearance settings
let defaultButton = document.querySelector('#default-box-settings');
defaultButton.addEventListener('click', () => {
    let confirmButton = document.createElement('button');
    confirmButton.innerText = 'Are you sure you want to reset to default?';
    // check if dark mode is on
    if (document.body.style.background) confirmButton.classList.add('dark');
    defaultButton.replaceWith(confirmButton);
    confirmButton.addEventListener('click', () => {
        chrome.storage.sync.set({
            'boxColour' : '#FFFFE0', 
            'boxBorderColour' : '#808080',
            'boxShadowColour' : '#808080',
            'boxFont' : 'Arial, sans-serif', 
            'boxFontColour' : '#000000', 
            'boxFontSize' : '13px', 
            'boxFontLink' : ''
        });
        chrome.storage.sync.get(['boxColour', 'boxBorderColour', 'boxShadowColour', 'boxFont', 'boxFontColour', 'boxFontSize', 'boxFontLink'], (result) => {
            positionBelow.click();
            let boxFontLink = document.querySelector('#box-font-link');
            if (boxFontLink) boxFontLink.value = result.boxFontLink;
            boxColour.value = result.boxColour;
            boxBorderColour.value = result.boxBorderColour;
            boxShadowColour.value = result.boxShadowColour;
            boxFont.value = result.boxFont;
            boxFontColour.value = result.boxFontColour;
            boxFontSize.value = result.boxFontSize;
            if (googleFontsCheckbox.checked) {
                googleFontsCheckbox.checked = false;
                let changeEvent = new Event('change');
                googleFontsCheckbox.dispatchEvent(changeEvent);
            }
        });
        displaySuccessMessage('Popup box settings reset to default');
    });
    setTimeout(() => confirmButton.replaceWith(defaultButton), 4000);
    setTimeout(() => document.body.style.background ? defaultButton.classList.add('dark') : defaultButton.classList.remove('dark'), 4000);
});

// Enable or disable dark theme
enableDark.addEventListener('click', () => {
    document.body.style.background = '#393939';
    document.body.style.color = '#E3E3E3';
    document.querySelector('select').classList.add('dark');
    document.querySelectorAll('.link').forEach((element) => element.style.color = '#8AB4F8');
    document.querySelectorAll('input').forEach((element) => element.classList.add('dark'));
    document.querySelectorAll('button').forEach((element) => element.classList.add('dark'));
    chrome.storage.sync.set({'darkTheme' : 'true'});
});

disableDark.addEventListener('click', () => {
    document.body.style.background = null;
    document.body.style.color = null;
    document.querySelector('select').classList.remove('dark');
    document.querySelectorAll('.link').forEach((element) => element.style.color = null);
    document.querySelectorAll('input').forEach((element) => element.classList.remove('dark'));
    document.querySelectorAll('button').forEach((element) => element.classList.remove('dark'));
    chrome.storage.sync.set({'darkTheme' : 'false'});
});

// Update exchange rates and list of currencies when clicking the button
document.querySelector('#update-currencies').addEventListener('click', () => {
    fetch('https://api.exchangerate.host/latest', {
        method: 'GET',
        headers: {'cache-control' : 'no-cache'}
        })
        .then(response => response.json())
        .then(result => chrome.storage.sync.set({'latestRates': result}, () => {
            displaySuccessMessage('Successfully updated exchange rates and list of currencies');
            ratesDate.innerText = result.date;
        }));
});

// Open new tabs for the relevant links
document.querySelector('#shortcuts-link').addEventListener('click', () => {
    chrome.tabs.create({url: "chrome://extensions/shortcuts"});
});
document.querySelector('#font-link').addEventListener('click', () => {
    chrome.tabs.create({url: "https://fonts.google.com/"});
});

// function to display success message
function displaySuccessMessage(message) {
    // remove old message (if any)
    let oldMsg = document.querySelector('.msg'); 
    if (oldMsg) document.body.removeChild(oldMsg);
    
    let successMsg = document.createElement('div');
    successMsg.className = 'msg';
    successMsg.innerText = message;
    document.body.appendChild(successMsg);

    setTimeout(() => document.querySelector('.msg').classList.add("fade"), 3000);
    setTimeout(() => document.body.removeChild(document.querySelector('.msg')), 3500);
};