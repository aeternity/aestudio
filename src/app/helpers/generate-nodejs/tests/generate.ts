import fs from 'fs';
import generate from '../index.js';

const sourceCode = `
contract Multiplier =
  record state = { factor1: int, factor2: int }

  entrypoint init(f1 : int, f2 : int) = { factor1 = f1, factor2 = f2 }

  entrypoint multiplyByFactor(x1 : int, x2 : int) =
    (x1 * state.factor1, x2 * state.factor2)
`;

let module;

module = generate({
  sdkSetup: true,
  sourceCode,
  deployParams: [21, 7],
  entrypointName: 'multiplyByFactor',
  entrypointParams: [2, 6],
});
await fs.promises.writeFile('./tests/generated/all.js', module);

module = generate({
  sourceCode,
  deployParams: [21, 7],
  entrypointName: 'multiplyByFactor',
  entrypointParams: [2, 6],
});
await fs.promises.writeFile('./tests/generated/deploy-call.js', module);

module = generate({
  entrypointName: 'multiplyByFactor',
  entrypointParams: [2, 6],
});
await fs.promises.writeFile('./tests/generated/call.js', module);
