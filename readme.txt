cors everywhere
http://spenibus.net
https://github.com/spenibus/cors-everywhere-firefox-addon
https://gitlab.com/spenibus/cors-everywhere-firefox-addon




This is a firefox addon that allows the user to enable CORS everywhere by
altering http responses.

The addon's functionality can be toggled with the included button and is
disabled by default.

Intended for developers. Use at your own risk.

Packaged xpi releases here:
http://spenibus.net/files/gitbin/cors-everywhere-firefox-addon/

prefs on "extensions.spenibus_corsEverywhere."
   enabledAtStartup (boolean) enables this addon on startup


*** Technical note *************************************************************
This addon uses a javascript code module, which basically makes it run like a
global, single instance service. In contrast, the standard method of
instantiating addons is to load them via an "overlay" which is tied to an
individual window. This is important because this addon registers http events
in the observer service. Allow me to quote the documentation:

"HTTP notifications are fired for all HTTP requests originating from Firefox.
They are window-independent, so it is better to keep your observer code in
non-chrome objects (your XPCOM service or jsm module). Otherwise you have to
make sure to avoid duplicated work if you have 2 or more windows open."

from https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Intercepting_Page_Loads

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