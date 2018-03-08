function saveOptions(e) {

    // prefs object
    let prefs = {
        enabledAtStartup : document.querySelector('#enabledAtStartup').checked
        ,staticOrigin    : document.querySelector('#staticOrigin').value
    }

    browser.storage.sync.set(prefs);

    // update background script
    browser.runtime.getBackgroundPage().then(function(page){
        page.bg.prefs = prefs;
    });

    e.preventDefault();
}

function restoreOptions() {
    browser.storage.sync.get('enabledAtStartup').then((res) => {
        document.querySelector('#enabledAtStartup').checked = res.enabledAtStartup || false;
    });
    browser.storage.sync.get('staticOrigin').then((res) => {
        document.querySelector('#staticOrigin').value = res.staticOrigin;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);