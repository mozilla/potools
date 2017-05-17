const splitText = require('../src/').splitText;

describe('splitText()', () => {
  it('splits placeholders', () => {
    expect(splitText('foo %(whatever)s'))
      .toEqual([
        {value: 'foo ', type: 'text'},
        {value: '%(whatever)s', type: 'placeholder', name: 'whatever'},
      ]);
  });

  it('still returns text without placeholders', () => {
    expect(splitText('foo bar'))
      .toEqual([
        {value: 'foo bar', type: 'text'},
      ]);
  });
});
