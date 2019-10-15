const axios = require('axios');
const atob = require('atob');
const md2json = require('md-2-json'); 

// TODO: Find all **MY_VAR** and declare them as "globals" without the **s,
// TODO: Remove all **s from the raw generated source - maybe in the very end, I don't know

// the following function will create an object holding all information necessary to generate the final code.
generateCodeStructure = async () => {
    // fetch markdown file

    const rawResponse = await axios.get("https://api.github.com/repos/nikita-fuchs/ae-recipes/contents/JS/essentials.md")

    const encodedResponse = rawResponse.data.content;
    const decodedResponse = atob(encodedResponse);
    const JSONfromMD = md2json.parse(decodedResponse);
    //console.log(JSONfromMD['Deploy a Contract'].deployment);
    //console.log(JSONfromMD)


    // Strategy: Have everything(!) contained in one object, also
    // filter out all **MY_VAR** declarations

   /*  regex = /\`([\s\S]*?)\`/;
    let globals = JSONfromMD.match(regex);
    console.log(globals); */

    // prepare a string with definitions of MY_VAR values

    // traverse through parsed object 
    // if one of the keys contains an object, pass the top-level key's name 
    // into the recursive function call, so every **SOME_VAR** that is found 
    // can be attributed to the "main big topic" it belongs to (SDK initialization? contract calling? Node setup?)
    // and will be only displayed if it's necessary. 
    


    processObject = (obj) => {

        for(var key in obj) {               
            
            // if the object is empty, return immediately.
            if('raw' in obj) {
                
           
            //console.log("Empty object?", Object.keys(obj).length === 0)
            //console.log("Checking: ", key, "from ", obj, " the key is ", key);
            //console.log("Is " , obj[key] , "an object ?", (typeof obj[key] == "object"));
            //console.log(`Does ${obj[key]} have keys ? `, Object.keys(obj[key])  );

            // params: framework/language : JS, content to process: obj[key].raw
            obj["formatted"] = processKeyContents("JS", obj["raw"]);
            //console.log("Gibts auch was formatted ?");
            //console.log(obj["formatted"]);
            }
            
            if( (typeof obj[key] == "object"))  {
                // if called recursiely, pass top-level topic's name
                obj[key] = processObject(obj[key]);
                //keys = keys.concat(subkeys.map(function(subkey) {
                  //  return key + "." + subkey;
                }
                //));
            
            
        }
        return obj;
    
    }
    
    // WIP: call this function to define all the globals at the top-level of their corresponding key
     // TODO: parse **MY_VARS** from the `raw` here. pseudeocode: If **my_var** found AND topLevelTopic is defined, set my_var at object[topleveltopic]
    findGlobals = (obj) => {
        //var keys = [];

        var finalObject = obj;

        for(var key in obj) {            
            // TODO: parse **MY_VARS** from the `raw` here. pseudeocode: If **my_var** found AND topLevelTopic is defined, set my_var at object[topleveltopic]
            
            // params: framework/language : JS, content to process: obj[key].raw
            obj["formatted"] = processKeyContents("JS", obj[key].raw);
            if(typeof obj[key] === "object") {
                // if called recursiely, pass top-level topic's name
                obj[key] = processObject(obj[key], key);
                //keys = keys.concat(subkeys.map(function(subkey) {
                  //  return key + "." + subkey;
                }
                //));
            }
        return obj;
    }

    processKeyContents = (formatting, content) => {
        var result = [];
        var evenOrOdd = 0;
        // assuming we have always code, text, code, text and so on, we just need to figure out what the content starts with. if it starts with code, the following will be text, and/or the other way round.
        content.startsWith("```") ? evenOrOdd = 1 : evenOrOdd = 0;
        let splitResults = content.split("```");
        //console.log("Splitresults sind:", splitResults )
        splitResults.forEach((block, index) => {
            if ((index + evenOrOdd) % 2 == 1){
                // generate code and push to the result
                result.push(block);
            } else {
                // generate comment
                result.push(generateComment(formatting, block));
            }
        });
        return result;
    };

    generateComment = (formatting, content) => {
        switch (formatting) {
            case "JS":
                return ` // ${content.replace("\n", "\n //")}`
                break;
        
            default:
                break;
        }

    }

    // add everything necessary for the code generator to the JSON object in this step
    JSONwithCodeAndStrings = processObject(JSONfromMD);
    console.log(JSONwithCodeAndStrings);
    
    process.exit();

    JSONwithCodeStringsAndGlobals = findGlobals(JSONwithCodeAndStrings);
} 

generateJS = () => {
    generateCodeStructure();

}
generateJS();
