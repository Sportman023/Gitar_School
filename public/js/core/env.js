// Which copy of the app is running.
//
// The beta branch is published to the beta/ subfolder of the same site, so the
// teacher can try changes before the children get them. Both copies share one
// origin, and with it localStorage and the service worker caches, so the beta
// keeps its own players and progress (see store.js and sw.js).
export const IS_BETA = location.pathname.includes('/beta/');
