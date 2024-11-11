// CONTRACT FUNCTION CALL

// don't forget to change the 'myContract' placeholder to yours

// the name of the function you want to call
const yourFunction = 'multiplyByFactor';

// the parameters of your function
const yourParams = [2,6];

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
