expect = require('expect.js') if not expect?

describe 'Mocha test', ->
  it 'should success', ->
    expect(1 + 1).to.be.equal(2)
  it 'should not success', ->
    expect(1 + 2).to.be.equal(2)
