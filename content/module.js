/*********************************************** export javacript code module */
var EXPORTED_SYMBOLS = ["spenibus_corsEverywhere"];




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
   },




   /****************************************************************** toggle */
   toggle : function() {


      // toggle
      spenibus_corsEverywhere.enabled = !spenibus_corsEverywhere.enabled;


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

      // http interface
      var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
      if(httpChannel == null) {
         return;
      }


      // check origin header
      // was throwing an exception necessary if header is not set, mozilla ?
      var origin;
      try {
         origin = httpChannel.getRequestHeader('Origin');
      }
      catch(e) {
      }

      if(!origin) {
         origin = '*';
      }


      // check response header
      // was throwing an exception necessary if header is not set, mozilla ?
      var header;
      try {
         header = httpChannel.getResponseHeader('Access-Control-Allow-Origin');
      }
      catch(e) {
      }


      // abort if header has cors already
      if(header == '*' || header == 'null') {
         return;
      }


      // force cross origin
      httpChannel.setResponseHeader('Access-Control-Allow-Origin', origin, false);
   }},


};