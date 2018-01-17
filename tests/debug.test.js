const sinon = require('sinon');

const { debugCommand } = require('../src/');

describe('debugCommand()', () => {
  let fakeChalk;
  let fakeConsole;
  let fakeProcess;

  beforeEach(() => {
    fakeProcess = {
      exit: sinon.stub(),
      stdout: {
        write: sinon.stub(),
      },
    };

    fakeChalk = {
      red: sinon.stub(),
    };

    fakeConsole = {
      log: sinon.stub(),
    };
  });

  it('should call process.exit if pot file is invalid', () => {
    return debugCommand({ potfile: 'whatever', format: 'unicode' }, { _chalk: fakeChalk, _process: fakeProcess, _console: fakeConsole })
      .then(() => {
        sinon.assert.calledWith(fakeProcess.exit, 1);
        sinon.assert.calledWithMatch(fakeChalk.red, 'ENOENT');
      });
  });

  it('should output unicode output', () => {
    return debugCommand({ potfile: './tests/fixtures/source.pot', format: 'unicode', output: 'stdout' }, { _chalk: fakeChalk, _process: fakeProcess, _console: fakeConsole })
      .then(() => {
        sinon.assert.neverCalledWith(fakeProcess.exit, 1);
        sinon.assert.calledWithMatch(fakeProcess.stdout.write, 'msgstr "Ẏǿŭ ȧřḗ ȧŀřḗȧḓẏ ŀǿɠɠḗḓ īƞ."');
        sinon.assert.calledWithMatch(fakeProcess.stdout.write, 'msgstr[0] "Īƞṽȧŀīḓ ŧȧɠ: {0}"');
        sinon.assert.calledWithMatch(fakeProcess.stdout.write, 'msgstr[1] "Īƞṽȧŀīḓ ŧȧɠş: {0}"');
      });
  });

  it('should output mirror output', () => {
    return debugCommand({ potfile: './tests/fixtures/source.pot', format: 'mirror', output: 'stdout' }, { _chalk: fakeChalk, _process: fakeProcess, _console: fakeConsole })
      .then(() => {
        sinon.assert.neverCalledWith(fakeProcess.exit, 1);
        sinon.assert.calledWithMatch(fakeProcess.stdout.write, 'msgstr ".uı pǝƃƃoʅ ʎpɐǝɹʅɐ ǝɹɐ no⅄"');
        sinon.assert.calledWithMatch(fakeProcess.stdout.write, 'msgstr[0] "{0} :ƃɐʇ pıʅɐʌuI"');
        sinon.assert.calledWithMatch(fakeProcess.stdout.write, 'msgstr[1] "{0} :sƃɐʇ pıʅɐʌuI');
      });
  });

  it('should set plural forms if none are provided', () => {
    return debugCommand({ potfile: './tests/fixtures/source.pot', format: 'unicode', output: 'stdout' }, { _chalk: fakeChalk, _process: fakeProcess, _console: fakeConsole })
      .then(() => {
        sinon.assert.neverCalledWith(fakeProcess.exit, 1);
        sinon.assert.calledWithMatch(fakeProcess.stdout.write, '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"');
      });
  });
});
