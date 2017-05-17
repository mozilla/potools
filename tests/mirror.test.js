const assert = require('assert');
const mirrorTransform = require('../src/').mirrorTransform;

describe('mirrorTransform()', () => {
  it('should return a mirrorTransformed string', () => {
    assert.equal(mirrorTransform('foo bar'), 'ɹɐq ooɟ');
  });

  it('should return a mirrorTransformed string with trailing space', () => {
    assert.equal(mirrorTransform('foo '), ' ooɟ');
  });

  it('should not mangle a placeholder', () => {
    assert.equal(mirrorTransform('foo %(whatever)s'), '%(whatever)s ooɟ');
  });

  it('should not mangle a curly brace placeholder', () => {
    assert.equal(mirrorTransform('Abuse Reports for {addon} ({num})'), '({num}) {addon} ɹoɟ sʇɹodǝᴚ ǝsnq∀');
  });

  it('should not mangle a word wrapped with square brackets', () => {
    assert.equal(mirrorTransform('Square braces should [work]'), '[ʞɹoʍ] pʅnoɥs sǝɔɐɹq ǝɹɐnbS');
  });

  it('should not mangle HTML', () => {
    assert.equal(mirrorTransform('foo <a href="#whatevs">bar</a>'), '<a href="#whatevs">ɹɐq</a> ooɟ');
  });

  it('should not mangle more complex HTML', () => {
    assert.equal(mirrorTransform('foo <a href="#whatevs">bar <span>test</span></a>'),
                 '<a href="#whatevs"><span>ʇsǝʇ</span> ɹɐq</a> ooɟ');
  });
});
