//************************************************************* class definition
let spenibus_corsEverywhere = {


    /***************************************************************************
    props
    ***/
    enabled       : false
    ,prefs        : {} // holds user prefs
    ,transactions : {} // contains requests/responses


    /***************************************************************************
    init
    ***/
    ,init : function() {

        // toggle activation on button click
        browser.browserAction.onClicked.addListener(function(){
            spenibus_corsEverywhere.toggle();
        });

        // load prefs
        browser.storage.sync.get([
            'enabledAtStartup',
            'staticOrigin',
        ]).then((res) => {

            // get prefs, set default value if n/a
            this.prefs.enabledAtStartup = res.enabledAtStartup || false;
            this.prefs.staticOrigin     = res.staticOrigin     || '';

            if(this.prefs.enabledAtStartup) {
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
    updateButton
    ***/
    ,updateButton : function() {
        let buttonStatus = spenibus_corsEverywhere.enabled ? 'on' : 'off';
        browser.browserAction.setIcon({path:{48:'media/button-48-'+buttonStatus+'.png'}});
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
    }


    /***************************************************************************
    responseHandler
    ***/
    ,responseHandler : function(response) {

        // get transaction
        let transaction = spenibus_corsEverywhere.transactions[response.requestId];

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

        // set "access-control-allow-origin"
        // use static origin if set in prefs
        if(bg.prefs.staticOrigin) {
            transaction.responseHeaders['access-control-allow-origin'].value = bg.prefs.staticOrigin;
        }
        // default: prioritize "origin" else "*"
        else {
            transaction.responseHeaders['access-control-allow-origin'].value =
                transaction.requestHeaders['origin']
                && transaction.requestHeaders['origin'].value !== null
                    ? transaction.requestHeaders['origin'].value
                    : '*';
        }

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

        // delete transaction
        delete spenibus_corsEverywhere.transactions[response.requestId];

        // apply modifications
        return {
            responseHeaders: transaction.response.responseHeaders
            ,statusCode : 777
        };
    }
};




//************************************************************************** run
var bg = spenibus_corsEverywhere.init();
