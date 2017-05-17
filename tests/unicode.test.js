const assert = require('assert');
const unicode = require('../src/').unicode;
const unicodeTransform = require('../src/').unicodeTransform;

describe('unicode()', () => {
  it('should return a unicode string', () => {
    assert.equal(unicode('foo'), 'ƒǿǿ');
  });

  it('should not mangle a placeholder', () => {
    assert.equal(unicodeTransform('foo %(whatever)s'), 'ƒǿǿ %(whatever)s');
  });

  it('should not mangle HTML', () => {
    assert.equal(unicodeTransform('foo <a href="#whatevs">bar</a>'), 'ƒǿǿ <a href="#whatevs">ƀȧř</a>');
  });

  it('should not mangle more complex HTML', () => {
    // Note the br is no-longer self-closed.
    assert.equal(
      unicodeTransform('foo <a href="#whatevs">bar <span>test</span><br/></a>'),
      'ƒǿǿ <a href="#whatevs">ƀȧř <span>ŧḗşŧ</span><br></a>'
    );
  });

  it('should not mangle a curly brace placeholder', () => {
    assert.equal(unicodeTransform('Abuse Reports for {addon} ({num})'), 'Aƀŭşḗ Řḗƥǿřŧş ƒǿř {addon} ({num})');
  });

  it('should not mangle a word wrapped with square brackets', () => {
    assert.equal(unicodeTransform('Square braces should [work]'), 'Şɋŭȧřḗ ƀřȧƈḗş şħǿŭŀḓ [ẇǿřķ]');
  });
});


