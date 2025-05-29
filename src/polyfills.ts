/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags.ts';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js'; // Included with Angular CLI.

//SDK zum laufen bringen:

// 0. file so anpassen wie hier: node_modules/pbkdf2/lib/default-encoding.js

// 1. nächster error, stichwort bei google: "aws-sdk requires global to exist"
(window as any).global = window;

// 2. Uncaught ReferenceError: process is not defined at Object../node_modules/pbkdf2/lib/default-encoding.js (default-encoding.js:3)
(window as any).process = {
  env: { DEBUG: undefined },
  version: '12.1337',
};

//4. json.stringify can't parse bigint
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

(window as any).process = {
  env: { DEBUG: undefined },
  version: '12.1337',
};

(window as any).GlobalDebug = (function () {
  const savedConsole = console;
  return function (debugOn, suppressAll) {
    const suppress = suppressAll || false;
    if (debugOn === false) {
      (console as any) = {};
      /* eslint-disable @typescript-eslint/no-empty-function */
      console.log = function () {};
      if (suppress) {
        console.info = function () {};
        console.warn = function () {};
        console.error = function () {};
        /* eslint-enable @typescript-eslint/no-empty-function */
      } else {
        console.info = savedConsole.info;
        console.warn = savedConsole.warn;
        console.error = savedConsole.error;
      }
    } else {
      console = savedConsole;
    }
  };
})();
// @ts-expect-error polyfills setup

window.GlobalDebug(false, false);
