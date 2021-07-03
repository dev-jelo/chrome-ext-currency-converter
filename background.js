"use strict";

// Upon install, get exchange rates and currencies from exchangerate.host site and store in chrome storage
chrome.runtime.onInstalled.addListener(function() {
    // Set http request header so that there will be a check if there are changes in the json compared to the browser cached version
    fetch('https://api.exchangerate.host/latest', {
        method: 'GET',
        headers: {'cache-control' : 'no-cache'}
    })
        .then(response => response.json())
        .then(result => chrome.storage.sync.set({'latestRates' : result}))
});

// Update latest exchange rates to chrome storage when opening browser
chrome.runtime.onStartup.addListener(function() { 
    fetch('https://api.exchangerate.host/latest', {
        method: 'GET',
        headers: {'cache-control' : 'no-cache'}
    })
        .then(response => response.json())
        .then(result => chrome.storage.sync.set({'latestRates' : result}))
});

// Set alarm to update the exchange rates every 6 hours for when chrome is not restarted in that time
chrome.alarms.create("alarm", {periodInMinutes : 360});
chrome.alarms.onAlarm.addListener(function() {
    fetch('https://api.exchangerate.host/latest', {
        method: 'GET',
        headers: {'cache-control' : 'no-cache'}
    })
        .then(response => response.json())
        .then(result => {
            chrome.storage.sync.set({'latestRates' : result});
            console.log('rates updated');
        });
});

// Listen for when the shortcut keys are pressed to toggle extension on/off and send message to popup if it is, otherwise just toggle on/off
chrome.runtime.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(() => chrome.storage.sync.set({'popup' : 'closed'}));
});
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'toggle-extension') {
        chrome.storage.sync.get({'popup' : 'closed'}, function(result) {
            if (result.popup === 'open') {
                chrome.runtime.sendMessage({toggle: 'sc-pressed'});
            } else {
                chrome.storage.sync.get(['toggle'], function(result) {
                    if (result.toggle === 'on') {
                        chrome.storage.sync.set({'toggle' : 'off'});
                        chrome.action.setIcon({path: 'icons/extension_icon_128(off).png'});
                    } else {
                        chrome.storage.sync.set({'toggle' : 'on'});
                        chrome.action.setIcon({path: 'icons/extension_icon_128.png'});
                    } 
                }); 
            }
        })
    }
});