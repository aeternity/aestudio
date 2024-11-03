const axios = require('axios');
const atob = require('atob');
const md2json = require('md-2-json');
const regexGlobals = '**([^*]+)**';

// TODO: Find all **MY_VAR** and declare them as "globals" without the **s,
// TODO: Remove all **s from the raw generated source - maybe in the very end, I don't know

// the following function will create an object holding all information necessary to generate the final code.
var globals = {};
generateCodeStructure = async () => {
  // fetch markdown file

  const rawResponse = await axios.get(
    'https://api.github.com/repos/nikita-fuchs/ae-recipes/contents/JS/essentials.md',
  );

  const encodedResponse = rawResponse.data.content;
  const decodedResponse = atob(encodedResponse);
  const JSONfromMD = md2json.parse(decodedResponse);

  //process.exit();
  //console.log(JSONfromMD['Deploy a Contract'].deployment);
  //console.log(JSONfromMD)

  // Strategy: Have everything(!) contained in one object, also
  // filter out all **MY_VAR** declarations

  // traverse through parsed object
  // if one of the keys contains an object, pass the top-level key's name
  // into the recursive function call, so every **SOME_VAR** that is found
  // can be attributed to the "main big topic" it belongs to (SDK initialization? contract calling? Node setup?)
  // and will be only included in the final generated code if it's necessary.

  // prepare an object with definitions of MY_VAR values for every main topic
  // e.g. {
  //     top: [StuffAtTheTop] // these are the globals that are defined at the top of the doc and are not part of any top point
  //     install: [StuffFromInstall] // install will actually be ignored by the generator !
  //     setup: [StuffFromSetup] // vars that the setup sction needs to have defined
  //     etc...

  processObject = (obj, topLevelParent, scanForGlobals) => {
    for (var key in obj) {
      //console.log("Processing ", key)

      // if the object is empty, return immediately.
      if ('raw' in obj) {
        // usecase: create the formatted output
        // params: framework/language : JS, content to process: obj[key].raw
        if (scanForGlobals == undefined) {
          obj['formatted'] = processKeyContents('JS', obj['raw']);
        }
      }

      // usecase: search for globals here, but only from those entries in the 'formatted' field, that start with '// code'
      if (scanForGlobals == true) {
        var found_globals = [];

        if (obj['formatted'] != undefined) {
          //console.log("Formatted gefunden!")
          // get all strings that start with '// code'
          console.log('Formatted is: ', obj['formatted']);
          let codeStrings = obj['formatted'].filter((oneString) => oneString.startsWith('// code'));
          console.log('Code strings are: ', codeStrings);
          // process all "// code"s and concat results to the found_globals
          codeStrings.forEach((oneCode) => {
            found_globals.concat(oneCode.match(/\*\*([^*]+)\*\*/g));
          });

          console.log('Found globals: ', found_globals, ' in  top level parent: ', topLevelParent);

          // put them in the globals object accordingly
          topLevelParent == undefined
            ? (globals['top'] = found_globals)
            : (globals[topLevelParent] = found_globals);
        }
      }

      if (typeof obj[key] == 'object') {
        // if called recursiely, pass parent's name (but only if the parent is a top-level key)

        // if we check a top level key, pass its name into the recursive call so all succinct globals ( e.g. **MY_VAR** ) found will be attributed to this
        // top level key.
        if (topLevelParent == undefined) {
          obj[key] = processObject(obj[key], key, scanForGlobals);
        } else {
          // in this case, we are in some sub-topic already , and pass the name of the top level parent topic ( e.g. 1. "Setup" ) on.
          obj[key] = processObject(obj[key], topLevelParent, scanForGlobals);
        }

        //keys = keys.concat(subkeys.map(function(subkey) {
        //  return key + "." + subkey;
      }
      //));
    }
    return obj;
  };

  // Deprecated: this is to be done in the processObject function
  // WIP: call this function to define all the globals at the top-level of their corresponding key
  // TODO: parse **MY_VARS** from the `raw` here. pseudeocode: If **my_var** found AND topLevelTopic is defined, set my_var at object[topleveltopic]
  findGlobals = (obj) => {
    //var keys = [];

    var finalObject = obj;

    for (var key in obj) {
      // TODO: parse **MY_VARS** from the `raw` here. pseudeocode: If **my_var** found AND topLevelTopic is defined, set my_var at object[topleveltopic]

      // params: framework/language : JS, content to process: obj[key].raw
      obj['formatted'] = processKeyContents('JS', obj[key].raw);
      if (typeof obj[key] === 'object') {
        // if called recursiely, pass top-level topic's name
        obj[key] = processObject(obj[key], key);
        //keys = keys.concat(subkeys.map(function(subkey) {
        //  return key + "." + subkey;
      }
      //));
    }
    return obj;
  };

  processKey = (obj, topLevelParent, scanForGlobals) => {
    //console.log("Processing ", key)

    // if the object is empty, return immediately.
    if ('raw' in obj) {
      // usecase: create the formatted output
      // params: framework/language : JS, content to process: obj[key].raw
      if (scanForGlobals == undefined) {
        obj['formatted'] = processKeyContents('JS', obj['raw']);
      }
    }

    // usecase: search for globals here, but only from those entries in the 'formatted' field, that start with '// code'
    if (scanForGlobals == true) {
      var found_globals = [];

      if (obj['formatted'] != undefined) {
        //console.log("Formatted gefunden!")
        // get all strings that start with '// code'
        console.log('Formatted is: ', obj['formatted']);
        let codeStrings = obj['formatted'].filter((oneString) => oneString.startsWith('// code'));
        console.log('Code strings are: ', codeStrings);
        // process all "// code"s and concat results to the found_globals
        codeStrings.forEach((oneCode) => {
          found_globals.concat(oneCode.match(/\*\*([^*]+)\*\*/g));
        });

        console.log('Found globals: ', found_globals, ' in  top level parent: ', topLevelParent);

        // put them in the globals object accordingly
        topLevelParent == undefined
          ? (globals['top'] = found_globals)
          : (globals[topLevelParent] = found_globals);
      }
    }

    if (typeof obj[key] == 'object') {
      // if called recursiely, pass parent's name (but only if the parent is a top-level key)

      // if we check a top level key, pass its name into the recursive call so all succinct globals ( e.g. **MY_VAR** ) found will be attributed to this
      // top level key.
      if (topLevelParent == undefined) {
        obj[key] = processObject(obj[key], key, scanForGlobals);
      } else {
        // in this case, we are in some sub-topic already , and pass the name of the top level parent topic ( e.g. 1. "Setup" ) on.
        obj[key] = processObject(obj[key], topLevelParent, scanForGlobals);
      }

      //keys = keys.concat(subkeys.map(function(subkey) {
      //  return key + "." + subkey;
    }
    //));
  };

  processKeyContents = (formatting, content) => {
    var result = [];
    var evenOrOdd = 0;
    // assuming we have always code, text, code, text and so on, we just need to figure out what the content starts with. if it starts with code, the following will be text, and/or the other way round.
    content.startsWith('```') ? (evenOrOdd = 1) : (evenOrOdd = 0);
    let splitResults = content.split('```');
    //console.log("Splitresults sind:", splitResults )
    splitResults.forEach((block, index) => {
      if ((index + evenOrOdd) % 2 == 1) {
        // generate code and push to the result
        result.push('// code: \n ' + block);
      } else {
        // generate comment
        result.push(generateComment(formatting, block));
      }
    });
    return result;
  };

  generateComment = (formatting, content) => {
    switch (formatting) {
      case 'JS':
        return ` // ${content.replace('\n', '\n //')}`;
        break;

      default:
        break;
    }
  };

  // add everything necessary for the code generator to the JSON object in this step
  JSONwithCodeAndStrings = processObject(JSONfromMD);
  //console.log(JSONwithCodeAndStrings);
  //console.log(">>>>>>>>>>>Now scanning for globals...")
  // now scan for globals. scan only in code blocks that are marked as such.
  JSONwithStrigsCodeAndGlobals = processObject(JSONwithCodeAndStrings, undefined, true);
  console.log(globals);
  console.log(JSONwithCodeAndStrings.Setup['Install SDK']['Options for operating systems:']);
  process.exit();
};

generateJS = () => {
  generateCodeStructure();
};
generateJS();
