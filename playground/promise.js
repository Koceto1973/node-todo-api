// providing input for async work, utilizing promise 
// via function declaration using parameters and returning promise object
// this pattern is used also for promise chaining
var asyncAdd = (a, b) => {
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (typeof a === 'number' && typeof b === 'number') {
          resolve(a + b);
        } else {
          reject('Arguments must be numbers');
        }
      }, 1500);
    });

  };
  
  asyncAdd(5, '7')
    .then((res) => {
      console.log('Result: ', res);  // resolve handling
      return asyncAdd(res, 33);      // another promise object returned
    })
    .then((res) => {                 // chaining the resolve cases of the two promises
      console.log('Should be 45', res);
    })
    .catch((errorMessage) => {
      console.log(errorMessage);
    });