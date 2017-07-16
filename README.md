CORS Everywhere
===============

- Author: [spenibus][1]

- Repositories
  - [GitHub][2]
  - [GitLab][3]

- [Packaged XPI releases][4]

- [Mozilla Addons page][5]


This is a firefox addon that allows the user to enable [CORS][6] everywhere by altering http responses.

Note
----

This addon is now a WebExtension.


Usage
-----

The addon's functionality can be toggled with the included button and is disabled by default.
The button can be found by right-clicking a toolbar and choosing `customize`.
It is labelled `CorsE` with a red background that turns green when enabled.

A basic [CORS][6] test is available in the repository at `./_test/cors-everywhere-test.html`.

Intended for developers. Use at your own risk.


Preferences
-----------

Available in about:addons.

- `enabledAtStartup` : Enables this addon on startup


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