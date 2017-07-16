function saveOptions(e) {
    browser.storage.sync.set({
        enabledAtStartup : document.querySelector('#enabledAtStartup').checked
    });
    e.preventDefault();
}

function restoreOptions() {
    let prefs = browser.storage.sync.get('enabledAtStartup');
    prefs.then((res) => {
        document.querySelector('#enabledAtStartup').checked = res.enabledAtStartup || false;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);