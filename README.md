# AO3 Blacklist Userscript

A userscript with a friendly user interface that permits the user to:

* Hide search results by authors they don't want to see

* Hide search results containing keywords they don't want to see

* Hide comments by users they don't want to see

Forked and sloppily-translated from [AO3banList-Script](https://github.com/VincentPvoid/AO3banList-Script) by [VincentPvoid](https://github.com/VincentPvoid). [For now, please see the MTL translation of their README has more information.](/README_EN.md)


## Installation

1. Install a userscript manager browser extension like [ViolentMonkey](https://violentmonkey.github.io/), [TamperMonkey](https://www.tampermonkey.net/), or [GreaseMonkey](https://www.greasespot.net/).

1. Install the latest version of the script (currently, [AO3_blacklist_v0.1.8](/AO3_blacklist_v0.1.8.js)).


## TODO

Author blacklisting:

* Add blacklist author button + "this author is blacklisted" notif to author profile pages.

* Fix formatting of "Blacklist Author" button. Ensure that it appears where expected when a work has multiple authors; add tooltip confirming author username.

* Make works disappear immediately after blacklisting all authors / "Hide work and blacklist all" button.

* Add extra information to saved blacklist entries? (Fic for which author was blacklisted, timestamp?)
