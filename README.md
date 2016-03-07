CORS Everywhere
===============

- [Website][1]

- Repositories
  - [GitHub][2]
  - [GitLab][3]

- [Packaged XPI releases][4]

- [Mozilla Addons page][5]


This is a firefox addon that allows the user to enable [CORS][6] everywhere by altering http responses.


Usage
-----

The addon's functionality can be toggled with the included button and is disabled by default.
The button can be found by right-clicking a toolbar and choosing `customize`.
It is labelled `CorsE` with a red background that turns green when enabled.

A basic [CORS][6] test is available in the repository at `./_test/cors-everywhere-test.html`.

Intended for developers. Use at your own risk.


Preferences
-----------

Branch: `extensions.spenibus_corsEverywhere.`

- `enabledAtStartup` (boolean) Enables this addon on startup


Technical note
--------------

This addon uses a JavaScript code module, which basically makes it run like a global, single instance service. In contrast, the standard method of instantiating addons is to load them via an "overlay" which is tied to an individual window. This is important because this addon registers http events in the observer service.

Allow me to quote the documentation, from [Intercepting Page Loads][7]:

>HTTP notifications are fired for all HTTP requests originating from Firefox.
>They are window-independent, so it is better to keep your observer code in non-chrome objects (your XPCOM service or jsm module). Otherwise you have to make sure to avoid duplicated work if you have 2 or more windows open.


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


FAQ
---

 - The addon is enabled but the requests return content as if no user was logged in the target domain.

   Try using [withCredentials][8].




[1]: http://spenibus.net
[2]: https://github.com/spenibus/cors-everywhere-firefox-addon
[3]: https://gitlab.com/spenibus/cors-everywhere-firefox-addon
[4]: http://spenibus.net/files/gitbin/cors-everywhere-firefox-addon/
[5]: https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/
[6]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
[7]: https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Intercepting_Page_Loads
[8]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials