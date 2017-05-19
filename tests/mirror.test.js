const mirrorTransform = require('../src/').mirrorTransform;

describe('mirrorTransform()', () => {
  it('should return a mirrorTransformed string', () => {
    expect(mirrorTransform('foo bar')).toEqual('ɹɐq ooɟ');
  });

  it('should return a mirrorTransformed string with trailing space', () => {
    expect(mirrorTransform('foo ')).toEqual(' ooɟ');
  });

  it('should not mangle a placeholder', () => {
    expect(mirrorTransform('foo %(whatever)s')).toEqual('%(whatever)s ooɟ');
  });

  it('should not mangle a curly brace placeholder', () => {
    expect(mirrorTransform('Abuse Reports for {addon} ({num})')).toEqual('({num}) {addon} ɹoɟ sʇɹodǝᴚ ǝsnq∀');
  });

  it('should not mangle a word wrapped with square brackets', () => {
    expect(mirrorTransform('Square braces should [work]')).toEqual('[ʞɹoʍ] pʅnoɥs sǝɔɐɹq ǝɹɐnbS');
  });

  it('should not mangle HTML', () => {
    expect(mirrorTransform('foo <a href="#whatevs">bar</a>')).toEqual('<a href="#whatevs">ɹɐq</a> ooɟ');
  });

  it('should not reverse entities', () => {
    expect(mirrorTransform('foo &nbsp;<a href="#whatevs">bar</a>')).toEqual('<a href="#whatevs">ɹɐq</a>&nbsp; ooɟ');
  });

  it('should not mangle more complex HTML', () => {
    expect(mirrorTransform('foo <a href="#whatevs">bar <span>test</span></a>'))
      .toEqual('<a href="#whatevs"><span>ʇsǝʇ</span> ɹɐq</a> ooɟ');
  });

  it('should not reverse placeholders that are prefixed with start and end', () => {
    expect(mirrorTransform('foo %(startLink)sbar test%(endLink)s'))
      .toEqual('%(startLink)sʇsǝʇ ɹɐq%(endLink)s ooɟ');
  });

  it('should not reverse brace placeholders that are prefixed with start and end', () => {
    expect(mirrorTransform('foo {startLink}bar test{endLink}'))
      .toEqual('{startLink}ʇsǝʇ ɹɐq{endLink} ooɟ');
  });

  it('should touch a single placeholder that has a start prefix with a matching end', () => {
    expect(mirrorTransform('foo %(startSomething)sbar test'))
      .toEqual('ʇsǝʇ ɹɐq%(startSomething)s ooɟ');
  });

  it('should only reverse children with textNodes', () => {
    expect(mirrorTransform('<h1>Heading</h1><ul><li>List item 1</li><li>List item <span>2</span></li></ul>'))
      .toEqual('<h1>ƃuıpɐǝH</h1><ul><li>1 ɯǝʇı ʇsı⅂</li><li><span>2</span> ɯǝʇı ʇsı⅂</li></ul>');
  });

  it('should only reverse children if contain textNodes without whitespace', () => {
    expect(mirrorTransform('<h1>Heading</h1> <ul><li>List item 1</li><li>List item <span>2</span></li></ul>'))
      .toEqual('<h1>ƃuıpɐǝH</h1> <ul><li>1 ɯǝʇı ʇsı⅂</li><li><span>2</span> ɯǝʇı ʇsı⅂</li></ul>');
  });

  it('should only reverse children if contain textNodes without whitespace and newline', () => {
    expect(mirrorTransform('<h1>Heading</h1>\n <ul><li>List item 1</li><li>List item <span>2</span></li></ul>'))
      .toEqual(`<h1>ƃuıpɐǝH</h1>\n <ul><li>1 ɯǝʇı ʇsı⅂</li><li><span>2</span> ɯǝʇı ʇsı⅂</li></ul>`);
  });

  it('should handle a single placeholder named "start"', () => {
    expect(mirrorTransform('foo %(start)sbar test'))
      .toEqual('ʇsǝʇ ɹɐq%(start)s ooɟ');
  });
});
