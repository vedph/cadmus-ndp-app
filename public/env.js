// https://www.jvandemo.com/how-to-use-environment-variables-to-configure-your-angular-application-without-a-rebuild/
(function (window) {
  window.__env = window.__env || {};

  // environment-dependent settings
  window.__env.apiUrl = "http://localhost:5172/api/";
  // window.__env.biblioApiUrl = "http://localhost:60058/api/";
  window.__env.version = "0.0.6";
  // enable thesaurus import in thesaurus list for admins
  window.__env.thesImportEnabled = true;
  // MUFI
  window.__env.mufiUrl = "http://localhost:5172/api/";
  // Zotero
  window.__env.zoteroApiKey = "TODO:YOUR_ZOTERO_KEY";
  window.__env.zoteroUserId = "TODO:YOUR_ZOTERO_USER_ID";
  window.__env.zoteroLibraryId = "TODO:YOUR_ZOTERO_LIBRARY_ID";
})(this);
