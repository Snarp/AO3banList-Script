# AO3BanList-Script
A simple Greasemonkey script that blocks authors on AO3.
Although AO3's own tag system is very convenient to filter, sometimes there are still some unfiltered articles, or sometimes you just don't like some authors, and you may still need to block the author's function sometimes.
Mainly because I need it myself, so I wrote it, including the shortcut point kudo and opening a new window, which are not very useful.

## v0.1.1 version 11/20
Added the ability to block comments from specific users

## v0.1.2 version 12/9
Added import/export list function
The exported data is converted into base64 format; although it is not necessary, the user name of AO3 will not have Chinese or special characters

## v0.1.3 version 12/25
Added one-click clearing list function
Although the necessity of this function is not too great, it can be achieved by directly closing the corresponding block list; but it is still added.

## v0.1.4 version 05/23
Added the function of clearing invalid authors: if the author name does not exist or there is no work under the author's name, it will be cleared; the clearing speed is related to the network speed and the length of the list
If the list of blocked authors is too long, there will be problems, and there will be problems with frequent use of this function; in short, the function is not perfect, but it is enough for my own blocked list to clear

## v0.1.5 version 10/13
Add the function of quickly blocking the `orphan_account` account: If you need to block the articles of the `orphan_account` account, you can use this function
Adding `orphan_account` to the blocking list can also achieve the blocking function, but deleting it may be troublesome, so it is handled separately;
Although this is generally not used, it may be mainly to prevent the problem caused by adding `orphan_account` to the blocked list; the function of clearing invalid authors can delete the `orphan_account` name keyword and prompt.

## v0.1.6 version 10/21
Fixed the problem of clearing invalid authors; added a text prompt when clearing
If the list of blocked authors is too long, continue to clean up after a period of time; the time required for cleanup is related to the length of the list

## v0.1.7 version 04/02
Add keyword blocking function; can block title and introduction/title only/introduction only
This function is case-sensitive, so it is not very convenient to be case-sensitive when blocking English; it may be improved in the future
I basically don't use this function, so I haven't done much testing, so there may be more problems
There is no tag detection, the user themself can set up tag filtering, so it is not done


## Functions
- Open article in new window
- Quick Like[K]
- Block author articles based on username (if the author changes the username, it will be invalid)
- User comments are blocked based on user names, and unlogged (anonymous) user comments cannot be blocked (if the user changes the user name, it will be invalid); there is no way to repeatedly modify the user name.
- Import/export roster data
- Clear the list with one click
- Clear the invalid author (the author name does not exist or there is no work under the author name, it will be cleared; the time required for clearing is related to the length of the list); if the list of blocked authors is too long, or the function is used frequently, a cooling time will be required , resulting in a long cleanup time (AO3 has a limit on requests within a period of time, so if the number of lists is too large, you need to continue making requests after a period of time)
- Quickly block orphan_account account function
- Block articles with keywords in the title/intro
