/********************************************************* import code module */
Components.utils.import("resource://cors-everywhere-spenibus/module.js");




/*********************************************************** init code module */
window.addEventListener("load", spenibus_corsEverywhere.init, false);


window.addEventListener("unload", function() {
   window.removeEventListener("load", spenibus_corsEverywhere.init, false);
}, false);




/******************************************* prepare button of current window */
window.addEventListener('load', function(){


   // button id
   var id = 'spenibus_cors_everywhere_button_toggle';


   // get button, try document first
   var btn = document.getElementById(id);


   // try toolbar palette if document yielded nothing
   if(btn == null) {
      btn = gNavToolbox.palette.querySelector('#'+id);
   }


   // no button found, abort
   if(btn == null) {
      return;
   }


   // add command to button: toggle
   btn.addEventListener("command", spenibus_corsEverywhere.toggle, false);


   // observer service
   var obs = Components.classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);


   // observe: enable
   obs.addObserver(
      {observe:function(subject, topic, data){
         btn.setAttribute('data-enabled', true);
      }},
      'spenibus_corsEverywhere_enabled',
      false
   );


   // observe: disable
   obs.addObserver(
      {observe:function(subject, topic, data){
         btn.setAttribute('data-enabled', false);
      }},
      'spenibus_corsEverywhere_disabled',
      false
   );


   // check if enabled for proper init
   if(spenibus_corsEverywhere.enabled) {
      btn.setAttribute('data-enabled', true);
   }


}, false);