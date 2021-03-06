const { unicode, unicodeTransform } = require('../src/');

describe('unicode()', () => {
  it('should return a unicode string', () => {
    expect(unicode('foo')).toEqual('ƒǿǿ');
  });

  it('should not mangle a placeholder', () => {
    expect(unicodeTransform('foo %(whatever)s')).toEqual('ƒǿǿ %(whatever)s');
  });

  it('should not mangle a date placeholder', () => {
    expect(unicodeTransform('foo %%Y-%%m-%%d')).toEqual('ƒǿǿ %%Y-%%m-%%d');
  });

  it('should not mangle HTML', () => {
    expect(unicodeTransform('foo <a href="#whatevs">bar</a>')).toEqual('ƒǿǿ <a href="#whatevs">ƀȧř</a>');
  });

  it('should not mangle more complex HTML', () => {
    // Note the br is no-longer self-closed.
    expect(unicodeTransform('foo <a href="#whatevs">bar <span>test</span><br/></a>'))
      .toEqual('ƒǿǿ <a href="#whatevs">ƀȧř <span>ŧḗşŧ</span><br></a>');
  });

  it('should not mangle a curly brace placeholder', () => {
    expect(unicodeTransform('Abuse Reports for {addon} ({num})')).toEqual('Aƀŭşḗ Řḗƥǿřŧş ƒǿř {addon} ({num})');
  });

  it('should not mangle a word wrapped with square brackets', () => {
    expect(unicodeTransform('Square braces should [work]')).toEqual('Şɋŭȧřḗ ƀřȧƈḗş şħǿŭŀḓ [ẇǿřķ]');
  });

  it('should not change placeholders that are prefixed with start and end', () => {
    expect(unicodeTransform('foo %(startLink)sbar test%(endLink)s'))
      .toEqual('ƒǿǿ %(startLink)sƀȧř ŧḗşŧ%(endLink)s');
  });
});
