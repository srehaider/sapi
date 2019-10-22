export function promisify(func) {
  return new Promise((resolve, reject) => {
    if (typeof func !== 'function') {
      reject('First argument is not a function');
    }
    const cb = (error, value) => (error ? reject(error) : resolve(value));
    const args = [...arguments, cb].slice(1);
    func.apply(null, args);
  });
}
