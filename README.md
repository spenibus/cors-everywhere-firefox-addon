# cors-everywhere

> A firefox addon that allows you to enable CORS<sup>1</sup> everywhere by altering HTTP responses.

## Installation

- Download the extension from the [Firefox store](https://addons.mozilla.org/en/firefox/addon/cors-everywhere/)
- Or download a [packaged XPI release](http://spenibus.net/files/gitbin/cors-everywhere-firefox-addon/) manually

## Description

To use the addon you have to make the built-in toggle button visible. You can do this by 
right clicking a toolbar and choosing "customize", then dragging the button "CorsE" to the
toolbar. Clicking the button will allow you to toggle cross-origin resource sharing.
It is disabled by default and has a red/green background indicating the current status.

## Preferences

Branch: `extensions.spenibus_corsEverywhere`

- __enabledAtStartup__ (boolean): Enables the addon on startup
   
## Contributing

A basic CORS<sup>1</sup> test is available in the repository at `./_test/cors-everywhere-test.html`.
Intended for developers. Use it at your own risk.

## Behind the scenes

This addon uses a JavaScript code module, which basically makes it run like a global, single instance service.
In contrast, the standard method of instantiating addons is to load them via an "overlay" which is tied to an
individual window. This is important because this addon registers http events in the observer service.  
Quotes from the [documentation](https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Intercepting_Page_Loads):

> HTTP notifications are fired for all HTTP requests originating from Firefox.
> They are window-independent, so it is better to keep your observer code in non-chrome
> objects (your XPCOM service or jsm module). Otherwise you have to make sure to avoid
> duplicated work if you have 2 or more windows open."

As such, this addon runs its core logic in a global context and only uses
overlays for the UI. This avoids 2 issues:
- Redundant observers.
  Each window being unaware of the status of other windows, the addon could be
  enabled within each of them, each with its own observer, all doing the exact
  same thing at the same time. Not critical but still a better deal regarding
  cpu and memory.
- Running silently.
  This is much more critical. Since each window is only aware of itself,
  enabling the addon in one of them would let the user believe that it is only
  running in that one window while actually affecting all http requests
  regardless of the window in which they run.
  
  
---
<sup>1</sup>CORS: [Cross-origin resource sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
