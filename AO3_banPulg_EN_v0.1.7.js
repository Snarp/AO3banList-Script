// ==UserScript==
// @name         AO3banList-Script
// @namespace    https://github.com/VincentPvoid
// @version      0.1.7
// @description  A simple Greasemonkey script that blacklists user-selected authors, users, and keywords on AO3.
// @author       VincentPViod
// @match        https://*.archiveofourown.org/*
// @supportURL   https://github.com/VincentPvoid/AO3banList-Script
// ==/UserScript==

(function () {
  'use strict';

  let setting = {
    openNewPage: false, // Open works in new window
    quickKudo: false,   // Enable quick-like shortcut
    showBanBtn: true, // Show 'Blacklist Author' button
    useBanAuthors: true, // Hide blacklisted authors' works
    useBanUsers: true, // Hide blacklisted users' comments
    useBanOrphans: false, // Blacklist `orphan_account`
    useFilterTitleSummary: false, // Enable keyword filter
    filterKwType: 'ALL', // Keyword filter mode ('TITLE'/'SUMMARY'/'ALL')
  }
  let banAuthorsList = []; // blacklisted authors
  // saved author blacklist
  let localBanAuthorsList = JSON.parse(window.localStorage.getItem('vpv_ban_list'));
  if (localBanAuthorsList && localBanAuthorsList.length) {
    banAuthorsList = localBanAuthorsList;
  }

  let banUsersList = []; // blacklisted users
  // saved user blacklist
  let localBanUsersList = JSON.parse(window.localStorage.getItem('vpv_ban_users_list'));
  if (localBanUsersList && localBanUsersList.length) {
    banUsersList = localBanUsersList;
  }
  // A timer to monitor the comment list
  let watchCommentsListTimer = null;

  let filterKwList = []; // blacklisted keywords
  // saved keyword blacklist
  let localFilterKwList = JSON.parse(window.localStorage.getItem('vpv_filter_kw_list'));
  if (localFilterKwList && localFilterKwList.length) {
    filterKwList = localFilterKwList;
  }


  // Generate a button to open settings menu
  let btnOpenSetting = document.createElement('div');
  btnOpenSetting.setAttribute('id', 'vpv_AO3_switch_btn');
  btnOpenSetting.innerHTML = 'AO3BanList';

  // Generate top tip
  let topTip = document.createElement('div');
  topTip.setAttribute('id', 'vpv_top_tip');
  topTip.innerHTML = '';
  document.body.appendChild(topTip);

  // Generate the overall container; covers entire page
  let mainDivCover = document.createElement('div');
  mainDivCover.setAttribute('id', 'vpv_AO3_main_cover');
  mainDivCover.innerHTML = `
    <div class="vpv-AO3-main-con">
      <div class="btn-close">x</div>
      <h3 class="title">AO3BanList v0.1.7</h3>
      <div class="setting-items">
        <label>
          <input type="checkbox"> Open works in new window
        </label>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox"> Enable Quick-Like (quick key=[K])
        </label>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox" checked> Show "Blacklist Author" button
        </label>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox" checked> Blacklist orphan_account
        </label>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox" checked> Hide works by blacklisted authors
        </label>
      </div>
      <div class="setting-items">
        <button class="btn-authors-list">Manage author blacklist</button>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox" checked> Hide comments by blacklisted users
        </label>
      </div>
      <div class="setting-items">
        <button class="btn-users-list">Manage User Blacklist</button>
      </div>

      <div class="setting-items">
        <label>
          <input type="checkbox" checked> Enable keyword blacklist
        </label>
      </div>
      <div class="setting-items">
        <button class="btn-keywords-list">Manage keyword blacklist</button>
        <select id="vpv-AO3-keyword-select">
          <option value="ALL">Title + Summary</option>
          <option value="TITLE">Title</option>
          <option value="SUMMARY">Summary</option>
        </select>
      </div>

      <div class="bottom-con">
        <button class="btn-open-import">Import/Export Data</button>
        <button class="btn-save">Save Settings</button>
      </div>

      <div class="inner-cover-authors">
        <div class="ban-authors-list-con">
          <div class="btn-close">x</div>
          <h4>Manage Author Blacklist</h4>
          <div class="ban-authors-list">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>

              </tbody>
            </table>
          </div>
          <button class="btn-open-add-author">Add</button>
          <button class="btn-clear-authors-list">Delete all</button>
          <button class="btn-clear-invalid-authors" title="Identifies and removes authors who do not exist or have no visible works; prevents memory bloat.">Delete invalid</button>
          <div class="add-author-con">
            <div>
              <div class="btn-close">x</div>
            </div>
            <p>Add author</p>
            <input type="text" placeholder="author name" class="add-input">
            <button class="btn-add-author">Add</button>
          </div>
          <p class="clear-list-tip"></p>
        </div>
      </div>

      <div class="inner-cover-users">
        <div class="ban-users-list-con">
          <div class="btn-close">x</div>
          <h4>Manage User Blacklist</h4>
          <div class="ban-users-list">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>

              </tbody>
            </table>
          </div>
          <button class="btn-open-add-user">Add user</button>
          <button class="btn-clear-users-list">Delete all</button>
          <div class="add-user-con">
            <div>
              <div class="btn-close">x</div>
            </div>
            <p>Add User</p>
            <input type="text" placeholder="username" class="add-input">
            <button class="btn-add-user">Add</button>
          </div>
        </div>
      </div>

      <div class="inner-cover-import">
        <div class="import-export-con">
          <div class="btn-close">x</div>
          <div class="import-left">
            <h4>Data to Export</h4>
            <div class="export-items">
              <label>
                <input type="checkbox"> Author Blacklist
              </label>
            </div>
            <div class="export-items">
              <label>
                <input type="checkbox"> User Blacklist
              </label>
            </div>
            <div class="import-btn-con">
              <button class="btn-export">Export</button>
              <button class="btn-import">Import</button>
            </div>
            <div class="import-export-msg">
            </div>
          </div>

          <div class="import-right">
            <h4>List String</h4>
            <textarea cols="30" rows="12" placeholder="Copy the list string here. Click [Import] to import the list. Click [Export] to display the current list string, which can be copied-and-pasted."></textarea>
          </div>
     
        </div>
      </div>


      <div class="inner-cover-keywords">
        <div class="filter-keywords-list-con">
          <div class="btn-close">x</div>
          <h4>Keyword Blacklist</h4>
          <div class="filter-keywords-list">
            <textarea cols="20" rows="15"></textarea>
          </div>
          <p>Description: one per line, case sensitive</p>
          <button class="btn-save-filter-keywords">Save List</button>

        </div>
      </div>




      </div>`;

  // Insert the required structures into document body
  document.body.appendChild(mainDivCover);

  // Saved settings
  let localSetting = window.localStorage.getItem('vpv_AO3_setting');
  if (JSON.parse(localSetting)) {
    // console.log(localSetting)
    setting = JSON.parse(localSetting);
    let settingItems = document.querySelectorAll('#vpv_AO3_main_cover .setting-items input');
    let settingSelect = document.querySelector('#vpv-AO3-keyword-select')
    settingItems[0].checked = setting.openNewPage;
    settingItems[1].checked = setting.quickKudo;
    settingItems[2].checked = setting.showBanBtn;
    settingItems[3].checked = setting.useBanOrphans;
    settingItems[4].checked = setting.useBanAuthors;
    settingItems[5].checked = setting.useBanUsers;
    settingItems[6].checked = setting.useFilterTitleSummary;
    settingSelect.value = setting.filterKwType || 'ALL';
  }

  // Open work in new window
  if (setting.openNewPage) {
    let titlesA = document.querySelectorAll('#main h4.heading a:first-child');
    for (let i = 0; i < titlesA.length; i++) {
      titlesA[i].target = '_blank';
    }
  }

  // Press K to quick-like; not triggered when text box is focused
  if (setting.quickKudo) {
    document.onkeyup = function (e) {
      // select Kudos button
      let btnKudo = document.querySelector('#new_kudo [type="submit"]');

      // Listen for keyboard events, and do not trigger events when e.target is input or textarea
      // Note: the kudos key itself is an input; if the kudos key is focused, the event cannot be triggered
      if (e.keyCode === 75 && !(e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA')) {
        window.scroll(0, btnKudo.offsetTop);
        btnKudo.click();
        // console.log('kudos')
      }
    }
  }

  // Array of all authors
  let authors = document.querySelectorAll('h4.heading [rel="author"]');
  authors = [].slice.call(authors);

  // If author-filtering is enabled:
  if (setting.useBanAuthors && banAuthorsList.length) {
    let tars = [];
    let temp = null;
    for (let i = 0; i < authors.length; i++) {
      // let tars = authors.filter((item) => item.innerHTML === banAuthorsList[i]);
      temp = banAuthorsList.find((item) => item === authors[i].innerHTML) ? authors[i] : null;
      if (temp) {
        tars.push(temp)
      }
    }
    tars.forEach((item) => {
      // a --- h4 --- div -- li
      let li = item.parentElement.parentElement.parentElement;
      // li.style.display = 'none';
      li.parentElement.removeChild(li);
    })
  }

  // If blacklisting 'orphan_account' is enabled:
  if (setting.useBanOrphans) {
    let tars = [];
    let temp = null;
    for (let i = 0; i < authors.length; i++) {
      temp = authors[i].innerHTML === 'orphan_account' ? authors[i] : null;
      if (temp) {
        tars.push(temp)
      }
    }
    tars.forEach((item) => {
      // a --- h4 --- div -- li
      let li = item.parentElement.parentElement.parentElement;
      // li.style.display = 'none';
      li.parentElement.removeChild(li);
    })
  }

  // If keyword filtering is enabled:
  if (setting.useFilterTitleSummary && filterKwList.length) {
    // works list
    let workLis = document.querySelectorAll('ol.work>li')
    let tarsArr = [];
    let temp = null;
    let tar = null;
    for (let i = 0; i < workLis.length; i++) {
      tar = filterKwList.find(item => {
        // If title-checking is enabled, ensure that title exists
        if (setting.filterKwType === 'ALL' || setting.filterKwType === 'TITLE') {
          temp = workLis[i].querySelector('.heading a:first-child')
          if (temp.innerHTML.includes(item)) {
            return true
          }
        }
        // If summary-checking is enabled
        if (setting.filterKwType === 'ALL' || setting.filterKwType === 'SUMMARY') {
          temp = workLis[i].querySelector('.summary')
          // Ensure that summary exists
          if (temp) {
            temp = temp.innerText.replaceAll('\n\n', ' ')
            if (temp.includes(item)) {
              return true
            }
          }

        }
        return false;
      })
      if (tar) {
        tarsArr.push(workLis[i])
      }
    }
    tarsArr.forEach(item => {
      item.parentElement.removeChild(item);
    })
  }


  // Open settings menu
  btnOpenSetting.addEventListener('click', () => {
    let mainDivCover = document.querySelector('#vpv_AO3_main_cover');
    mainDivCover.style.display = 'flex';
    // console.log('abc')
  })

  // Inserting button into upper-left user navbar
  let greeting = document.querySelector('#greeting') ? document.querySelector('#greeting') : document.querySelector('#login');
  // If navbar is not present, do not insert
  if (greeting != null) {
    greeting.insertBefore(btnOpenSetting, greeting.children[0]);
  }

  // Clear tips container under "invalid author" button
  let clearListTip = document.querySelector('.inner-cover-authors .clear-list-tip')

  // Close button event
  let btnCloses = document.querySelectorAll('#vpv_AO3_main_cover .btn-close');
  for (let i = 0; i < btnCloses.length; i++) {
    btnCloses[i].addEventListener('click', () => {
      let tar = btnCloses[i].parentElement.parentElement;
      tar.style.display = 'none';
      clearListTip.innerHTML = '';
    })
  }




  /*
  BLACKLISTING AUTHORS
  */

  // Generate inline "Blacklist Author" button for works listings
  if (setting.showBanBtn) {
    for (let i = 0; i < authors.length; i++) {
      let tar = authors[i].parentElement;
      if (authors[i].textContent === 'orphan_account') continue;
      let btnBan = document.createElement('div');
      btnBan.setAttribute('class', 'vpv-AO3-ban-btn');
      btnBan.innerHTML = 'Blacklist Author';
      tar.appendChild(btnBan);

      // Click the inline "Blacklist Author" button to blacklist author
      btnBan.addEventListener('click', function () {
        // console.log(authors[i].textContent);
        let text = authors[i].textContent;
        // if (text === 'orphan_account') {

        // }
        if (banAuthorsList.indexOf(text) === -1) {
          banAuthorsList.push(text);
        }
        window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));
        showTopTip(topTip, 'Author blacklisted; reload to filter results.');
      })
    }
  }

  // Generate author blacklist
  let banAuthorsTable = document.querySelector('#vpv_AO3_main_cover .ban-authors-list table');
  if (banAuthorsList.length) {
    createBanList(banAuthorsList, banAuthorsTable)
  }
  // Click delete to clear author blacklist
  banAuthorsTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      let tr = e.target.parentElement.parentElement;
      let value = tr.querySelector('td').innerHTML;
      // console.log(value)
      tr.parentElement.removeChild(tr);
      banAuthorsList = banAuthorsList.filter((item) => item != value);
      window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));
    }
  })


  // Open author blacklist
  let btnAnthorsList = document.querySelector('#vpv_AO3_main_cover .btn-authors-list');
  btnAnthorsList.addEventListener('click', () => {
    let listCover = document.querySelector('#vpv_AO3_main_cover .inner-cover-authors');
    listCover.style.display = 'block';
  })

  // Open "Blacklist author" dialog
  let btnOpenAddAuthor = document.querySelector('#vpv_AO3_main_cover .btn-open-add-author');
  btnOpenAddAuthor.addEventListener('click', () => {
    let addAuthorCon = document.querySelector('#vpv_AO3_main_cover .add-author-con');
    addAuthorCon.style.display = 'block';
  })

  let btnAddAuthor = document.querySelector('#vpv_AO3_main_cover .btn-add-author');
  // Add author to blacklist
  btnAddAuthor.addEventListener('click', () => {
    let par = btnAddAuthor.parentElement;
    let input = par.querySelector('.add-input');
    // console.log(input.value)
    let text = input.value.trim();
    if (text === '') {
      showTopTip(topTip, 'Enter author name');
      return;
    }
    if (banAuthorsList.indexOf(text) === -1) {
      banAuthorsList.push(text);
      window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));

      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${text}</td>
          <td><button class="btn-delete">Delete</button></td>`;
      banAuthorsTable.querySelector('tbody').appendChild(tr);
    }
    input.value = '';
    // Close "Blacklist author" dialog
    par.style.display = 'none';
  })

  // Clear invalid authors
  let btnClearInvaildAuthors = document.querySelector('.inner-cover-authors .btn-clear-invalid-authors')
  // let clearListTip = document.querySelector('.inner-cover-authors .clear-list-tip')
  btnClearInvaildAuthors.addEventListener('click', () => {
    if (banAuthorsList.length === 0) return;
    if (banAuthorsList.includes('orphan_account')) {
      banAuthorsList = banAuthorsList.filter(item => item != 'orphan_account')
      window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));
      createBanList(banAuthorsList, banAuthorsTable)
      clearListTip.innerHTML = `If you wish to blacklist "orphan_account", please use the "Blacklist orphan_account" function. Please restart the "Clear invalid" function.`
      return;
    }

    let invaildArr = [];
    // let promiseArr = [];
    let failedReqList = []  // Clear the failed list of requests sent by invalid authors
    let num = 0;
    // let isHasOrphanAcc = false;
    const baseUrl = 'https://archiveofourown.org/users/'
    const keyword = 'id="user-works"' // If the author exists and has works, this field will be included
    // banAuthorsList.forEach(item => {
    //   promiseArr.push(baseSendRequest(baseUrl + item))
    // })

    sendList(banAuthorsList)

    function sendList(listArr) {
      clearListTip.innerHTML = 'Processing; please do not click. (To abort, refresh page.)'
      let promiseArr = [];
      listArr.forEach(item => {
        promiseArr.push(baseSendRequest(baseUrl + item))
      })
      Promise.all(promiseArr)
        .then(res => {
          clearListTip.innerHTML = ''
          failedReqList = []
          invaildArr = [];
          res.forEach((xhr, index) => {
            // console.log(item)
            // if (item.indexOf('Retry later') != -1) return;
            if (xhr.status >= 200 && xhr.status < 300) {
              let response = xhr.response;
              if (response.indexOf(keyword) === -1) {
                invaildArr.push(listArr[index])
              }
            } else {
              if (xhr.status === 429) {
                failedReqList.push(listArr[index])
              }
            }
            // return true;
          })
          // console.log(invaildArr)
          // if(isHasOrphanAcc) return;
          if (invaildArr.length) {
            num += invaildArr.length;
            banAuthorsList = banAuthorsList.filter(item => !invaildArr.includes(item))
            window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));

            createBanList(banAuthorsList, banAuthorsTable)
          }
          clearListTip.innerHTML = `${num} invalid authors purged. `
          if (failedReqList.length) {
            clearListTip.innerHTML += 'Too many requests; AO3 on cooldown for roughly 60 seconds. List cleanup incomplete. To continue cleanup, please wait; to abort, click refresh.'
            setTimeout(() => {
              sendList(failedReqList)
            }, 60000)
          } else {
            clearListTip.innerHTML = `Cleanup complete. ${num} invalid authors purged.`
          }
        })
    }

  })



  // If "Show/Hide comments" is checked
  let showCommentBtn = document.querySelector('#show_comments_link')

  // If user blacklist is enabled
  if (setting.useBanUsers && banUsersList.length && showCommentBtn) {
    // Select all comments currently displayed (excluding collapsed comments)
    // Note: Comments are fetched asynchronously, and so cannot be acquired immediately on page load
    // let comments = document.querySelectorAll('#comments_placeholder li.comment')

    // Determine the status of the current comment button ("Hide" means that the comment list has been expanded)
    if (showCommentBtn.innerText.indexOf('Hide') != -1) {
      clearInterval(watchCommentsListTimer);
      let usersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
      filterUserList(banUsersList, usersComments);

      watchCommentsListTimer = setInterval(() => {
        // console.log(456)
        let newUsersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
        if (newUsersComments[0] != usersComments[0]) {
          filterUserList(banUsersList, newUsersComments);
          usersComments = newUsersComments;
        }
      }, 200)
    }

    // Add click event to comment button
    showCommentBtn.addEventListener('click', function () {
      clearInterval(watchCommentsListTimer);
      let usersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
      // The button remains in its previous state when the button is clicked
      // If "Hide" when clicked, collapse; otherwise, expand
      if (this.innerText.indexOf('Hide') === -1) {
        watchCommentsListTimer = setInterval(() => {
          // console.log(123)
          let newUsersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
          if (newUsersComments[0] != usersComments[0]) {
            filterUserList(banUsersList, newUsersComments);
            usersComments = newUsersComments;
          }
        }, 200)
      }
    })
  }




  /*
  BLACKLISTING USERS
  */

  // Generate list of blacklisted users
  let banUsersTable = document.querySelector('#vpv_AO3_main_cover .ban-users-list table');
  if (banUsersList.length) {
    createBanList(banUsersList, banUsersTable)
  }
  // Click delete to delete the user list entry
  banUsersTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      let tr = e.target.parentElement.parentElement;
      let value = tr.querySelector('td').innerHTML;
      // console.log(value)
      tr.parentElement.removeChild(tr);
      banUsersList = banUsersList.filter((item) => item != value);
      window.localStorage.setItem('vpv_ban_users_list', JSON.stringify(banUsersList));
    }
  })


  // Open the list of blacklisted users
  let btnUsersList = document.querySelector('#vpv_AO3_main_cover .btn-users-list');
  btnUsersList.addEventListener('click', () => {
    let listCover = document.querySelector('#vpv_AO3_main_cover .inner-cover-users');
    listCover.style.display = 'block';
  })

  // Open "Add User" dialog
  let btnOpenAddUser = document.querySelector('#vpv_AO3_main_cover .btn-open-add-user');
  btnOpenAddUser.addEventListener('click', () => {
    let addUserCon = document.querySelector('#vpv_AO3_main_cover .add-user-con');
    addUserCon.style.display = 'block';
  })

  let btnAddUser = document.querySelector('#vpv_AO3_main_cover .btn-add-user');
  // Add users to blacklist
  btnAddUser.addEventListener('click', () => {
    let par = btnAddUser.parentElement;
    let input = par.querySelector('.add-input');
    // console.log(input.value)
    let text = input.value.trim();
    if (text === '') {
      showTopTip(topTip, 'Enter username');
      return;
    }
    if (banUsersList.indexOf(text) === -1) {
      banUsersList.push(text);
      window.localStorage.setItem('vpv_ban_users_list', JSON.stringify(banUsersList));

      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${text}</td>
          <td><button class="btn-delete">Delete</button></td>`;
      banUsersTable.querySelector('tbody').appendChild(tr);
    }
    input.value = '';
    // Close "Add User" dialog
    par.style.display = 'none';
  })



  /*
  CLEARING BLACKLISTS
  */

  // Clear author blacklist
  let btnClearAuthorsList = document.querySelector('.inner-cover-authors .btn-clear-authors-list');
  btnClearAuthorsList.addEventListener('click', () => {
    let list = btnClearAuthorsList.parentElement.querySelector('table tbody');
    if (list.innerHTML.trim() === '') return;
    if (!window.confirm('Are you sure you want to clear the author blacklist?')) return;

    list.innerHTML = '';
    window.localStorage.removeItem('vpv_ban_list');
    showTopTip(topTip, 'Author blacklist cleared; please refresh.')
  })

  // Clear user blacklist
  let btnClearUsersList = document.querySelector('.inner-cover-users .btn-clear-users-list');
  btnClearUsersList.addEventListener('click', () => {
    let list = btnClearUsersList.parentElement.querySelector('table tbody');
    if (list.innerHTML.trim() === '') return;
    if (!window.confirm('Are you sure you want to clear the user blacklist?')) return;

    list.innerHTML = '';
    window.localStorage.removeItem('vpv_ban_users_list');
    showTopTip(topTip, 'User blacklist cleared; please refresh.')
  })





  /*
  IMPORT AND EXPORT
  */

  // Import/Export buttons
  let btnOpenImport = document.querySelector('#vpv_AO3_main_cover .btn-open-import');
  // Export button:
  let btnExport = document.querySelector('#vpv_AO3_main_cover .inner-cover-import .btn-export');
  // Import button:
  let btnImport = document.querySelector('#vpv_AO3_main_cover .inner-cover-import .btn-import');
  // Text info display area:
  let importExportMsg = document.querySelector('#vpv_AO3_main_cover .inner-cover-import .import-export-msg');
  // Import/export data display area:
  let listStringT = document.querySelector('.inner-cover-import .import-right textarea')

  // Open Import/Export dialog
  btnOpenImport.addEventListener('click', () => {
    let importCover = document.querySelector('#vpv_AO3_main_cover .inner-cover-import');
    importCover.style.display = 'flex';
    importExportMsg.innerHTML = '';
    listStringT.value = '';
    let lists = document.querySelectorAll('.inner-cover-import .export-items input');
    lists[0].checked = false;
    lists[1].checked = false;
  })

  // Export data string
  btnExport.addEventListener('click', () => {
    let obj = {};
    let lists = document.querySelectorAll('.inner-cover-import .export-items input');

    if (!lists[0].checked && !lists[1].checked) {
      listStringT.value = '';
      importExportMsg.innerHTML = 'Select list to export'
      return;
    }
    lists[0].checked && banAuthorsList.length && (obj['vpv_ban_list'] = banAuthorsList);
    lists[1].checked && banUsersList.length && (obj['vpv_ban_users_list'] = banUsersList);

    if (Object.keys(obj).length) {
      listStringT.value = encode(JSON.stringify(obj));
      importExportMsg.innerHTML = 'Export succeeded';
    } else {
      listStringT.value = '';
      importExportMsg.innerHTML = 'The selected list is empty';
    }
  })

  // Import data string
  btnImport.addEventListener('click', () => {
    if (listStringT.value) {
      try {
        let obj = JSON.parse(decode(listStringT.value));
        if (!window.confirm('This will overwrite your existing data. Import?')) {
          return;
        }
        // console.log(obj)
        if (Object.keys(obj).includes('vpv_ban_list')) {
          window.localStorage.setItem('vpv_ban_list', JSON.stringify(obj['vpv_ban_list']));
        }
        if (Object.keys(obj).includes('vpv_ban_users_list')) {
          window.localStorage.setItem('vpv_ban_users_list', JSON.stringify(obj['vpv_ban_users_list']));
        }
        importExportMsg.innerHTML = 'Import succeeded; please refresh.';
      } catch (error) {
        importExportMsg.innerHTML = 'Could not import; string formatting error.';
      }
    } else {
      importExportMsg.innerHTML = 'Field is empty'
    }
  })


  /*
  KEYWORD BLACKLIST
  */
  // Manage keywords button
  let btnOpenfilterList = document.querySelector('#vpv_AO3_main_cover .btn-keywords-list');
  // Open manage keywords dialog
  btnOpenfilterList.addEventListener('click', () => {
    let filterCover = document.querySelector('#vpv_AO3_main_cover .inner-cover-keywords');
    filterCover.style.display = 'block';
  })
  // Keyword list text area
  let filterKwTextarea = document.querySelector('#vpv_AO3_main_cover .filter-keywords-list textarea');
  // Generate keyword list text
  if (filterKwList.length) {
    filterKwTextarea.value = filterKwList.join('\n')
  }

  // Save keyword list button
  let btnSaveFilterKw = document.querySelector('#vpv_AO3_main_cover .btn-save-filter-keywords');
  btnSaveFilterKw.addEventListener('click', () => {
    let par = btnSaveFilterKw.parentElement.parentElement;

    // Process the content of the text area; if it is empty, save it as an empty array
    let temp = filterKwTextarea.value;
    if (temp) {
      temp = temp.split('\n');
    } else {
      temp = []
    }
    window.localStorage.setItem('vpv_filter_kw_list', JSON.stringify(temp));

    par.style.display = 'none';
    showTopTip(topTip, 'Keywords saved; please refresh');
  })







  // Save settings
  let btnSaveSetting = document.querySelector('#vpv_AO3_main_cover .btn-save');
  btnSaveSetting.addEventListener('click', () => {
    let settingItems = document.querySelectorAll('#vpv_AO3_main_cover .setting-items input');
    let settingSelect = document.querySelector('#vpv-AO3-keyword-select')
    setting.openNewPage = settingItems[0].checked;
    setting.quickKudo = settingItems[1].checked;
    setting.showBanBtn = settingItems[2].checked;
    setting.useBanOrphans = settingItems[3].checked;
    setting.useBanAuthors = settingItems[4].checked;
    setting.useBanUsers = settingItems[5].checked;
    setting.useFilterTitleSummary = settingItems[6].checked;
    setting.filterKwType = settingSelect.value;
    window.localStorage.setItem('vpv_AO3_setting', JSON.stringify(setting));

    // Close settings dialog
    // .btn-save --- .bottom-con --- .vpv-AO3-main-con --- vpv_AO3_main_cover
    btnSaveSetting.parentElement.parentElement.parentElement.style.display = 'none';

    // Dialog prompt
    showTopTip(topTip, 'Settings saved; please refresh.');

  })




  // Top prompt public function ele element container str content
  function showTopTip(ele, str) {
    ele.style.display = 'block';
    ele.innerHTML = str;
    setTimeout(() => {
      ele.style.display = 'none';
    }, 2000);
  }

  // Filter users function
  // banUsersList = currently-saved user blacklist; usersComments = current list of all comments
  function filterUserList(banUsersList, usersComments) {
    // console.log('--------',usersComments)
    usersComments = [].slice.call(usersComments);
    for (let i = 0; i < banUsersList.length; i++) {
      let tars = usersComments.filter((item) => item.innerHTML === banUsersList[i]);
      tars.forEach((item) => {
        // a --- h4 -- li
        let li = item.parentElement.parentElement;
        // li.style.display = 'none';
        li.parentElement.removeChild(li);
      })
    }
  }


  // Transcoding function; although AO3 usernames cannot use Chinese/special characters, base64 conversion is possible
  // base64 encoding
  function encode(str) {
    return window.btoa(unescape(encodeURIComponent(str)))
  }
  // base64 decoding
  function decode(str) {
    return decodeURIComponent(escape(window.atob(str)))
  }

  // Generate mask list function list list data ele container
  function createBanList(list, ele) {
    let tbody = ele.querySelector('tbody')
    tbody.innerHTML = ''
    for (let i = 0; i < list.length; i++) {
      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${list[i]}</td>
            <td><button class="btn-delete">Delete</button></td>`;
      // ele.querySelector('tbody').appendChild(tr);
      tbody.appendChild(tr)
    }
  }

  // Send request function
  function baseSendRequest(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      xhr.timeout = 10000 // 超时时间
      xhr.send()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          // Return the response when the request is successful;
          // When the status code is not in this range, there may be too many requests (about 100)
          // 429, the response is Retry later; 302 is redirected to people search (the user does not exist); 0 is 404 page (orphan_account account page)
          // if (xhr.status >= 200 && xhr.status < 300) {
          //   resolve(xhr.response);
          // } else {
          //   reject(xhr.status)
          // }
          resolve(xhr)
        }
      }
    })
  }


  /*
  CSS Styling
  */
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = ` #vpv_AO3_switch_btn {
      display: inline-block;
      padding: .4em .5em;
      margin: .4em 5px;
      font-size: inherit;
      border-radius: 5px;
      font-size: inherit;
    }

    #vpv_AO3_switch_btn:hover {
      background: #ddd;
      color: #900;
      cursor: pointer;
    }

    .vpv-AO3-ban-btn {
      display: inline-block;
      padding: 0 3px;
      margin: 0 1em;
      font-size: 14px;
      color: #aaa;
      border-radius: 5px;
    }

    .vpv-AO3-ban-btn:hover {
      color: #fff;
      background: #900;
      cursor: pointer;
    }

    #vpv_top_tip {
      display: none;
      position: fixed;
      top: 5px;
      left: 50%;
      z-index: 10;
      transform: translate(-50%);
      padding: 5px;
      border: 1px solid #333;
      background: #d1e1ef;
    }

    #vpv_AO3_main_cover {
      display:none;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
      background: transparent;
      width: 100%;
      height: 100%;
    }

    #vpv_AO3_main_cover h3 {
      margin: 10px 0;
    }

    #vpv_AO3_main_cover .vpv-AO3-main-con {
      display: flex;
      flex-direction: column;
      position: relative;
      width: 300px;
      padding: 10px 20px;
      border: 1px solid #ccc;
      background: #fff;
      box-shadow: 0 0 5px #333;
    }

    #vpv_AO3_main_cover .setting-items {
      margin: 5px 0;
      vertical-align: middle;
    }

    #vpv_AO3_main_cover .bottom-con {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
    }

    #vpv_AO3_main_cover [class^="btn"] {
      padding: 5px 10px;
      background: #eee;
      border: 1px solid #ccc;
      outline: none;
      line-height: 16px;
      text-decoration: none;
      color: #000;
      font-size: 15px;
    }

    #vpv_AO3_main_cover [class^="btn"]:hover {
      background: #900;
      border: 1px solid #900;
      color: #fff;
      cursor: pointer;
    }

    #vpv_AO3_main_cover .btn-close {
      position: absolute;
      top: 10px;
      right: 10px;
      border: 1px solid #ccc;
      padding: 3px 8px;
      font-size: 18px;
    }

    #vpv_AO3_main_cover [class^=inner-cover] {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    #vpv_AO3_main_cover .ban-authors-list-con,
    #vpv_AO3_main_cover .ban-users-list-con {
      position: absolute;
      top: -15%;
      left: -10px;
      background: #fff;
      width: 100%;
      padding: 0 10px;
      height: 540px;
      border: 1px solid #ccc;
      box-shadow: 0 0 5px #333;
    }

    #vpv_AO3_main_cover .ban-authors-list,
    #vpv_AO3_main_cover .ban-users-list {
      height: 360px;
      border: 1px solid #ccc;
      margin: 20px 0 12px;
      line-height: 2.5;
      text-align: left;
      overflow: auto;
    }

    #vpv_AO3_main_cover table {
      border-collapse: collapse;
      width: 100%;
      overflow: hidden;
    }

    #vpv_AO3_main_cover th,
    tr,
    td {
      border: 1px solid #ccc;
      padding: 0 10px;
    }

    #vpv_AO3_main_cover tbody {
      height: auto;
    }

    #vpv_AO3_main_cover .add-author-con,
    #vpv_AO3_main_cover .add-user-con {
      display: none;
      position: absolute;
      left:10px;
      bottom: 10px;
      width: 95%;
      background: #fff;
      border: 1px solid #aaa;
      padding: 10px;
      box-shadow: 0 0 5px #333;
      box-sizing: border-box;
    }

    #vpv_AO3_main_cover p {
      margin: 5px 0;
    }

    #vpv_AO3_main_cover .add-input {
      line-height: 1.5;
      font-size: 15px;
      outline: none;
    }
    
    #vpv_AO3_main_cover .inner-cover-import{
      display: none;
      position: fixed;
      justify-content: center;
      align-items: center;
    }

    .inner-cover-import .import-export-con{
      position: absolute;
      display:flex;
      background: #fff;
      border: 1px solid #ccc;
      padding: 0 10px;
      width: 400px;
      height:360px;
      box-shadow: 0 0 5px #333;
    }
    .import-export-con>div{
      flex:1;
      margin:0 5px;
    }
    .import-export-con .export-items{
      margin: 5px 0;
      vertical-align: middle;
    }
    .import-export-con button{
      margin:15px 5px 20px;
    }
    .import-export-con textarea{
      resize:none;
    }
    .import-export-con .import-export-msg{
      font-size:14px;
    }

    .btn-clear-authors-list,
    .btn-clear-users-list{
      margin-left:.3em;
    }
    
    #vpv-AO3-keyword-select{
      width:140px;
      height:2em;
    }
    #vpv_AO3_main_cover .filter-keywords-list-con{
      position: absolute;
      top: -5%;
      left: 10%;
      background: #fff;
      width: 74%;
      padding: 0 10px;
      height: 500px;
      border: 1px solid #ccc;
      box-shadow: 0 0 5px #333;
    }
    .filter-keywords-list-con .filter-keywords-list textarea{
      width:98%;
    }
    `;
  document.querySelector('head').appendChild(style);
})();