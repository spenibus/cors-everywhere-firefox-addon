function saveOptions(e) {

    // prefs object
    let prefs = {
        enabledAtStartup     : document.querySelector('#enabledAtStartup').checked  || false
        ,staticOrigin        : document.querySelector('#staticOrigin').value        || ''
        ,activationWhitelist : document.querySelector('#activationWhitelist').value || ''
    }

    browser.storage.sync.set(prefs);

    // reload prefs
    browser.runtime.getBackgroundPage().then((res) => {
        res.spenibus_corsEverywhere.loadPrefs(function(){
            // refresh options
            restoreOptions();
        });
    });

    e.preventDefault();
}

function restoreOptions() {
    browser.storage.sync.get('enabledAtStartup').then((res) => {
        document.querySelector('#enabledAtStartup').checked = res.enabledAtStartup || false;
    });
    browser.storage.sync.get('staticOrigin').then((res) => {
        document.querySelector('#staticOrigin').value = res.staticOrigin || '';
    });
    browser.storage.sync.get('activationWhitelist').then((res) => {
        document.querySelector('#activationWhitelist').value = res.activationWhitelist || '';
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);