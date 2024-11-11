export default ({
  sdkSetup,
  sourceCode,
  deployParams,
  entrypointName,
  entrypointParams,
}: {
  sdkSetup?: boolean;
  sourceCode?: string;
  deployParams?: unknown[];
  entrypointName?: string;
  entrypointParams?: unknown[];
}): string =>
  `
${
  sdkSetup
    ? `
// SDK & Node setup
// Before running the below you need to install \`@aeternity/aepp-sdk@14\`
import { AeSdk, MemoryAccount, Node, CompilerHttp, Contract } from '@aeternity/aepp-sdk';

// account that will be used for the transactions
const account = new MemoryAccount('sk_N421kTeR5aEW7oD9BzVhmAE4Y3HkNLJv3udBhB824rjJJQK8X');

// instantiate a connection to the aeternity blockchain
const node = new Node('https://testnet.aeternity.io');

// create an SDK instance
const aeSdk = new AeSdk({
  nodes: [{ name: 'testnet', instance: node }],
  accounts: [account],
  onCompiler: new CompilerHttp('https://v8.compiler.aepps.com'),
});

const height = await aeSdk.getHeight();
console.log('Connected to Testnet Node! Current Block:', height);
`.trimStart()
    : ''
}
${
  sourceCode != null
    ? `
// CONTRACT DEPLOYMENT

// the code of your contract - watch out for correct indentations!
const sourceCode = \`
${sourceCode.replaceAll('`', '`').replaceAll('${', '\\${').trim()}
\`;

// create a contract instance
const myContract = await Contract.initialize({
  ...aeSdk.getContext(),
  sourceCode,
});

// Deploy the contract
let deployInfo;
try {
  console.log('Deploying contract....');
  console.log('Using account for deployment:', aeSdk.address);
  deployInfo = await myContract.init(${JSON.stringify(deployParams).slice(1, -1)});
} catch (error) {
  console.log('Something went wrong, did you set up the SDK properly?');
  console.log('Deployment failed:');
  throw error;
}
console.log('Contract deployed successfully!');
console.log('Contract address:', myContract.$options.address);
console.log('Transaction ID:', deployInfo.transaction);
`.trimStart()
    : ''
}
${
  entrypointName
    ? `
// CONTRACT FUNCTION CALL
${sourceCode ? '' : `\n// don't forget to change the 'myContract' placeholder to yours\n`}
// the name of the function you want to call
const yourFunction = '${entrypointName}';

// the parameters of your function
const yourParams = ${JSON.stringify(entrypointParams)};

// call your function
console.log('Calling your function:', yourFunction);
try {
  const callResult = await myContract[yourFunction](...yourParams);
  console.log('Transaction ID:', callResult.hash);
  console.log('Advice: log the full callResult object for more useful information!');
  console.log('Function call returned:', callResult.decodedResult);
} catch (error) {
  console.log('Calling your function errored:');
  throw error;
}
`.trimStart()
    : ''
}
`.trim() + '\n';
