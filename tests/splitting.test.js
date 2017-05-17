const splitText = require('../src/').splitText;

describe('splitText()', function() {
  it('splits placeholders', function() {
    expect(splitText('foo %(whatever)s'))
      .toEqual([
        {value: 'foo ', type: 'text'},
        {value: '%(whatever)s', type: 'placeholder'}
      ]);
  });

  it('still returns text without placeholders', function() {
    expect(splitText('foo bar'))
      .toEqual([
        {value: 'foo bar', type: 'text'},
      ]);
  });
});
