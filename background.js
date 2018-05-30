//************************************************************* class definition
var spenibus_corsEverywhere = {


    /***************************************************************************
    props
    ***/
    enabled                     : false
    ,activationWhitelistEnabled : false
    ,prefs                      : {} // holds user prefs
    ,transactions               : {} // contains requests/responses


    /***************************************************************************
    init
    ***/
    ,init : function() {

        // toggle activation on button click
        browser.browserAction.onClicked.addListener(function(){
            spenibus_corsEverywhere.toggle();
        });

        // load prefs
        spenibus_corsEverywhere.loadPrefs(function(){
            // enact enabled at startup
            if(spenibus_corsEverywhere.prefs.enabledAtStartup) {
                spenibus_corsEverywhere.toggle(true);
            }

            // update button
            spenibus_corsEverywhere.updateButton();
        });

        return this;
    }


    /***************************************************************************
    toggle
    ***/
    ,toggle : function(state) {

        // set state by input
        if(typeof state === 'boolean') {
            spenibus_corsEverywhere.enabled = state;
        }
        // set state by toggle
        else {
            spenibus_corsEverywhere.enabled = !spenibus_corsEverywhere.enabled;
        }

        // update button
        spenibus_corsEverywhere.updateButton();

        // clear transactions
        spenibus_corsEverywhere.transactions = {};

        // add observer, observe http responses
        if(spenibus_corsEverywhere.enabled) {

            browser.webRequest.onBeforeSendHeaders.addListener(
                spenibus_corsEverywhere.requestHandler
                ,{urls: ["<all_urls>"]}
                ,["blocking" ,"requestHeaders"]
            );

            browser.webRequest.onHeadersReceived.addListener(
                spenibus_corsEverywhere.responseHandler
                ,{urls: ["<all_urls>"]}
                ,["blocking" ,"responseHeaders"]
            );
        }

        // remove observer
        else {

            browser.webRequest.onBeforeSendHeaders.removeListener(
                spenibus_corsEverywhere.requestHandler
            );

            browser.webRequest.onHeadersReceived.removeListener(
                spenibus_corsEverywhere.responseHandler
            );
        }

        return this;
    }


    /***************************************************************************
    re/load preferences
    Because fetching prefs returns a promise, we use a callback to do stuff when
    the promise is fullfilled.
    ***/
    ,loadPrefs : function(callback) {

        browser.storage.sync.get([
            'enabledAtStartup',
            'staticOrigin',
            'activationWhitelist',
        ]).then((res) => {

            // get prefs, set default value if n/a
            spenibus_corsEverywhere.prefs.enabledAtStartup    = res.enabledAtStartup    || false;
            spenibus_corsEverywhere.prefs.staticOrigin        = res.staticOrigin        || '';
            spenibus_corsEverywhere.prefs.activationWhitelist = res.activationWhitelist || '';

            // parse activation whitelist
            spenibus_corsEverywhere.prefs.activationWhitelist = spenibus_corsEverywhere.prefs.activationWhitelist
                ? spenibus_corsEverywhere.prefs.activationWhitelist.split(/[\r\n]+/)
                : [];

            spenibus_corsEverywhere.activationWhitelistEnabled = spenibus_corsEverywhere.prefs.activationWhitelist.length > 0
                ? true
                : false;

            if(callback) {
                callback();
            }
        });

        return this;
    }


    /***************************************************************************
    updateButton
    ***/
    ,updateButton : function() {

        // icon
        let buttonStatus = spenibus_corsEverywhere.enabled ? 'on' : 'off';

        // tooltip text
        let buttonTitle = spenibus_corsEverywhere.enabled
            ? 'CorsE enabled, CORS rules are bypassed'
            : 'CorsE disabled, CORS rules are followed';

        // using activation whitelist while enabled
        if(spenibus_corsEverywhere.enabled && spenibus_corsEverywhere.activationWhitelistEnabled) {
            buttonStatus =  'on-filter';
            buttonTitle  += ' (using activation whitelist)';
        }

        // proceed
        browser.browserAction.setIcon({path:{48:'media/button-48-'+buttonStatus+'.png'}});
        browser.browserAction.setTitle({title:buttonTitle});

        return this;
    }


    /***************************************************************************
    requestHandler
    ***/
    ,requestHandler : function(request) {

        // prepare transaction, store transaction request
        let transaction = {
             request         : request
            ,requestHeaders  : {}
            ,response        : {}
            ,responseHeaders : {}
        };

        // shorthand access to request headers
        for(let header of request.requestHeaders) {
            transaction.requestHeaders[header.name.toLowerCase()] = header;
        }

        // store transaction
        spenibus_corsEverywhere.transactions[request.requestId] = transaction;

        // force origin based on prefs
        if(bg.prefs.staticOrigin) {
            transaction.requestHeaders['origin'].value = bg.prefs.staticOrigin;
        }

        // apply modifications
        return {
            requestHeaders : transaction.request.requestHeaders
        };
    }


    /***************************************************************************
    responseHandler
    ***/
    ,responseHandler : function(response) {

        // get transaction
        let transaction = spenibus_corsEverywhere.transactions[response.requestId];

        // processing flag
        let doProcess = true;

        // check activation whitelist
        if(spenibus_corsEverywhere.activationWhitelistEnabled) {

            // disable flag
            doProcess = false;

            for(let filter of spenibus_corsEverywhere.prefs.activationWhitelist) {

                // looks like I don't need to do any escaping, cool
                let pattern = filter.match(/^\/(.*)\/([a-z]*)$/i);
                pattern = new RegExp(pattern[1], pattern[2]);

                // stop at first match, enable f1ag
                if(transaction.request.originUrl.match(pattern)) {
                    doProcess = true;
                    break;
                }
            }
        }

        // modify the headers
        if(doProcess) {

            // store transaction response
            transaction.response = response;

            // shorthand access to response headers
            for(let header of response.responseHeaders) {
                transaction.responseHeaders[header.name.toLowerCase()] = header;
            }

            // create response headers if necessary
            for(let name of [
                 'access-control-allow-origin'
                ,'access-control-allow-methods'
                ,'access-control-allow-headers'
                ,'access-control-allow-credentials'
            ]) {
                // header exists, skip
                if(transaction.responseHeaders[name]) {
                    continue;
                }

                // create header
                let header = {
                     name  : name
                    ,value : "null"
                };

                // update response
                transaction.response.responseHeaders.push(header)

                // update shorthand
                transaction.responseHeaders[name] = header;
            }

            // set "access-control-allow-origin", prioritize "origin" else "*"
            transaction.responseHeaders['access-control-allow-origin'].value =
                transaction.requestHeaders['origin']
                && transaction.requestHeaders['origin'].value !== null
                    ? transaction.requestHeaders['origin'].value
                    : '*';

            // set "access-control-allow-methods"
            if(
                transaction.requestHeaders['access-control-request-method']
                && transaction.requestHeaders['access-control-request-method'].value !== null
            ) {
                transaction.responseHeaders['access-control-allow-methods'].value =
                    transaction.requestHeaders['access-control-request-method'].value
            }

            // set "access-control-allow-headers"
            if(
                transaction.requestHeaders['access-control-request-headers']
                && transaction.requestHeaders['access-control-request-headers'].value !== null
            ) {
                transaction.responseHeaders['access-control-allow-headers'].value =
                    transaction.requestHeaders['access-control-request-headers'].value
            }

            // set "access-control-allow-credentials"
            transaction.responseHeaders['access-control-allow-credentials'].value = "true";
        }

        // delete transaction
        delete spenibus_corsEverywhere.transactions[response.requestId];

        // return headers
        return {
            responseHeaders: transaction.response.responseHeaders
        };
    }
};




//************************************************************************** run
var bg = spenibus_corsEverywhere.init();
