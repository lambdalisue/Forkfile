var expect;

if (!(typeof expect !== "undefined" && expect !== null)) {
  expect = require('expect.js');
}

describe('Mocha test', function() {
  it('should success', function() {
    return expect(1 + 1).to.be.equal(2);
  });
  return it('should not success', function() {
    return expect(1 + 2).to.be.equal(2);
  });
});
