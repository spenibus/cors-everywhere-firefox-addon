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

 - It is important to understand that this addon does not actually disable any kind of security within Firefox.
   It merely alters http requests to make the browser believe the server has answered favorably.
   This means the http requests have to be valid and follow the CORS rules.
 - This addon is now a WebExtension.
 - Android is untested therefore not officially supported.
   [Android platform support #15][9]
 - In Firefox 74.0, the addon can not operate on local files (using the file:/// protocol). This is apparently fixed in 75.0.
   [Firefox 74.0 #32][10]


Usage
-----

The addon's functionality can be toggled with the included button and is disabled by default.
The button can be found by right-clicking a toolbar and choosing `customize`.
It is labelled `CorsE` and has 3 states:

 - ![](media/button-48-off.png) red, addon is disabled, CORS rules are upheld.
 - ![](media/button-48-on.png) green, addon is enabled, CORS rules are bypassed.
 - ![](media/button-48-on-filter.png) green/red, addon is enabled and using the activation whitelist,
   CORS rules are bypassed when the origin url matches a filter in the whitelist.

A basic [CORS][6] test is available in the repository at `./_test/cors-everywhere-test.html`.

Intended for developers. Use at your own risk.


Options
-------

Available in about:addons.

 - `Enabled at startup`
   Enables this addon on startup.
 - `Force value of "access-control-allow-origin"`
   Self explanatory.
 - `Activation whitelist`
   When the addon is enabled, this will check the origin url against the whitelist
   to decide if headers will be modified. Uses regular expressions.


FAQ
---

 - The addon is enabled but the requests return content as if no user was logged in the target domain.
   Try using [withCredentials][8].
 - Localhost CORS requests over HTTPS may fail with `An error occurred: SEC_ERROR_UNKNOWN_ISSUER` in the Security tab of the Network tab in Dev Tools.
   This can happen when developing both a web server on localhost and a "back-end" server also on localhost, but at a different port.
   A certificate exception is required for both localhost ports.
   Example: if your web server is https://localhost:3000/ then you've already added a certificate exception for the web server or you couldn't be debugging it or making CORS requests from it.
   But you'll *also* need to add a separate cert exception for your localhost "back-end" server's port, e.g. https://localhost:4000/.
   An easy way to do this is:
   -  Right-click on the failed CORS request in Dev Tools.
   -  Choose "Open in New Tab".
   -  You'll see the usual Warning: Potential Security Risk Ahead" page.
   -  Click "Advanced".
   -  Click "Accept the Risk and Continue" to add the certificate exception.
   -  Your localhost CORS requests will now work over TLS (aka SSL).

 [1]: https://spenibus.net
 [2]: https://github.com/spenibus/cors-everywhere-firefox-addon
 [3]: https://gitlab.com/spenibus/cors-everywhere-firefox-addon
 [4]: https://spenibus.net/files/gitbin/cors-everywhere-firefox-addon/
 [5]: https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/
 [6]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
 [7]: https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Intercepting_Page_Loads
 [8]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
 [9]: ../../issues/15
[10]: ../../issues/32
