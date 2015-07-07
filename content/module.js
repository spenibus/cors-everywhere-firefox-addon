/*******************************************************************************
Docs
https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
https://developer.mozilla.org/en/docs/Debugging_JavaScript#Console.log_in_Browser_Console
*******************************************************************************/




/*********************************************** export javacript code module */
var EXPORTED_SYMBOLS = ["spenibus_corsEverywhere"];


// import console
const { console } = Components.utils.import("resource://gre/modules/devtools/Console.jsm", {});




/******************************************************************************/
var spenibus_corsEverywhere = {




   /***************************************************************************/
   enabled         : false,
   observerService : null,




   /******************************************************************** init */
   init : function() {


      // observer service
      spenibus_corsEverywhere.observerService =
         Components.classes["@mozilla.org/observer-service;1"]
         .getService(Components.interfaces.nsIObserverService);


      // prefs service
      spenibus_corsEverywhere.prefs =
         Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.spenibus_corsEverywhere.");


      // enabled at startup
      // mozilla, you're just addicted to exceptions
      try {
         if(spenibus_corsEverywhere.prefs.getBoolPref('enabledAtStartup')) {
            spenibus_corsEverywhere.toggle(true);
         }
      } catch(e) {}
   },




   /****************************************************************** toggle */
   toggle : function(state) {


      // set state by input
      if(typeof state === 'boolean') {
         spenibus_corsEverywhere.enabled = state;
      }
      // set state by toggle
      else {
         spenibus_corsEverywhere.enabled = !spenibus_corsEverywhere.enabled;
      }


      // notification topic
      var topic = spenibus_corsEverywhere.enabled
         ? 'spenibus_corsEverywhere_enabled'
         : 'spenibus_corsEverywhere_disabled';


      // notify
      spenibus_corsEverywhere.observerService.notifyObservers(
         null,
         topic,
         null
      );


      // add observer, observe http responses
      if(spenibus_corsEverywhere.enabled) {

         spenibus_corsEverywhere.observerService.addObserver(
            spenibus_corsEverywhere.observerHandler,
            'http-on-examine-response',
            false
         );
      }


      // remove observer
      else {

         spenibus_corsEverywhere.observerService.removeObserver(
            spenibus_corsEverywhere.observerHandler,
            'http-on-examine-response'
         );
      }
   },




   /******************************************************** observer handler */
   observerHandler : { observe : function(subject, topic, data) {


      // request headers storage
      var reqHeaders = {
         'Origin'                         : null,
         'Access-Control-Request-Method'  : null,
         'Access-Control-Request-Headers' : null,
      };


/*
      // response headers storage
      var respHeaders = {
         'Access-Control-Allow-Origin'      : null,
         'Access-Control-Expose-Headers'    : null,
         'Access-Control-Max-Age'           : null,
         'Access-Control-Allow-Credentials' : null,
         'Access-Control-Allow-Methods'     : null,
         'Access-Control-Allow-Headers'     : null,
      };
*/


      // http interface
      var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
      if(httpChannel === null) {
         return;
      }


      // get request headers
      for(var header in reqHeaders) {

         // was throwing an exception necessary if header is not set, mozilla ?
         try {
            reqHeaders[header] = httpChannel.getRequestHeader(header);
         } catch(e) {}
      }


/*
      // get response headers
      for(var header in respHeaders) {

         // was throwing an exception necessary if header is not set, mozilla ?
         try {
            respHeaders[header] = httpChannel.getResponseHeader(header);
         } catch(e) {}
      }
*/


      // set "Access-Control-Allow-Origin"
      // prioritize "Origin" else "*"
      httpChannel.setResponseHeader(
         'Access-Control-Allow-Origin',
         reqHeaders['Origin'] !== null
            ? reqHeaders['Origin']
            : '*',
         false
      );


      // set "Access-Control-Allow-Methods"
      if(reqHeaders['Access-Control-Request-Method'] !== null) {
         httpChannel.setResponseHeader(
            'Access-Control-Allow-Methods',
            reqHeaders['Access-Control-Request-Method'],
            false
         );
      }


      // set "Access-Control-Allow-Headers"
      if(reqHeaders['Access-Control-Request-Headers'] !== null) {
         httpChannel.setResponseHeader(
            'Access-Control-Allow-Headers',
            reqHeaders['Access-Control-Request-Headers'],
            false
         );
      }


   }},


};