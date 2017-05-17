const assert = require('assert');
const splitText = require('../src/').splitText;
const split = require('../src/').split;


describe('splitText()', function() {
  it('splits placeholders', function() {
    assert.deepEqual(splitText('foo %(whatever)s'), [
      {value: 'foo ', type: 'text'},
      {value: '%(whatever)s', type: 'placeholder'}
    ]);
  });

  it('still returns text without placeholders', function() {
    assert.deepEqual(splitText('foo bar'), [
      {value: 'foo bar', type: 'text'},
    ]);
  });

});
