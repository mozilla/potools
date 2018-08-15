const chalk = require('chalk');
const htmlparser = require('htmlparser2');
const prog = require('cli-progress');
const PO = require('pofile');
const promisify = require('promisify-node');
const render = require('dom-serializer');

const poLoad = promisify(PO.load);

const unicodeFrom = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const unicodeTo = 'ȦƁƇḒḖƑƓĦĪĴĶĿḾȠǾƤɊŘŞŦŬṼẆẊẎẐȧƀƈḓḗƒɠħīĵķŀḿƞǿƥɋřşŧŭṽẇẋẏẑ';
const mirrorFrom = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+\\|`~[{]};:\'",<.>/?';
const mirrorTo = 'ɐqɔpǝɟƃɥıɾʞʅɯuodbɹsʇnʌʍxʎz∀ԐↃᗡƎℲ⅁HIſӼ⅂WNOԀÒᴚS⊥∩ɅＭX⅄Z0123456789¡@#$%ᵥ⅋⁎)(-_=+\\|,~]}[{;:,„´>.</¿';

// Match simple sprintf placholders eg: %(placeholder)s, {foo}
const sprintfRx = /(?:%\(|\{)([\S]+?)(?:\}|\)[sd]{1})/;
// Match simple placeholders %s %d
const percentRx = /%[sd]{1}/;
// Match dates - E.g. %%Y-%%m-%%d
const dateRx = /%%-?[a-zA-Z]{1}-%%-?[a-zA-Z]{1}-%%-?[a-zA-Z]{1}/;
// HTML entities e.g: &nbsp;
const htmlEntityRx = /&[^\s]+?;/;

const placeholderRx = new RegExp(`${sprintfRx.source}|${percentRx.source}|${dateRx.source}|${htmlEntityRx.source}`, 'g');
const whitespaceRx = /^\s+$/m;

function splitText(input) {
  const parts = [];
  let pos = 0;
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = placeholderRx.exec(input)) !== null) {
    if (pos < match.index) {
      // Push the non-matching string into the list.
      parts.push({
        type: 'text',
        value: input.substr(pos, match.index - pos),
      });
    }
    // Push the matching parts piece on the parts array.
    parts.push({
      name: match[1],
      type: 'placeholder',
      value: match[0],
    });
    pos = match.index + match[0].length;
  }
  if (pos < input.length) {
    parts.push({
      type: 'text',
      value: input.substr(pos, input.length - pos),
    });
  }
  return parts;
}

function mirror(inputString) {
  let trans = '';
  for (let i = inputString.length - 1; i >= 0; i--) {
    const idx = mirrorFrom.indexOf(inputString.charAt(i));
    if (idx > -1) {
      trans += mirrorTo[idx];
    } else {
      trans += inputString[i];
    }
  }
  return trans;
}

function unicode(inputString) {
  let trans = '';
  for (let i = 0, j = inputString.length; i < j; i++) {
    const char = inputString.charAt(i);
    const idx = unicodeFrom.indexOf(char);
    if (idx > 0) {
      trans += unicodeTo[idx];
    } else {
      trans += char;
    }
  }
  return trans;
}

function transformText(input, { format = 'unicode' } = {}) {
  const tokens = splitText(input);
  const string = [];
  const swaps = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const token of tokens) {
    if (token.type === 'text') {
      string.push(format === 'unicode' ? unicode(token.value) : mirror(token.value));
    } else {
      // Store tokens that have named placeholders that are prefixed with 'start' or 'end'.
      if (format === 'mirror' && token.type === 'placeholder' && token.name) {
        if (token.name.startsWith('start') && token.name.length > 5) {
          swaps[token.name.replace(/^start/, '')] = { start: token };
        }
        if (token.name.startsWith('end') && token.name.length > 3) {
          const endSuffix = token.name.replace(/^end/, '');
          swaps[endSuffix] = Object.assign({}, swaps[endSuffix] || {}, { end: token });
        }
      }
      string.push(token.value);
    }
  }

  if (format === 'mirror') {
    string.reverse();
    // Reverse start/end prefixed placholders to maintain order.
    Object.keys(swaps).forEach((key) => {
      const swap = swaps[key];
      if (swap.start && swap.end) {
        const startIdx = string.indexOf(swap.start.value);
        const endIdx = string.indexOf(swap.end.value);
        const oldStart = string[startIdx];
        string[startIdx] = string[endIdx];
        string[endIdx] = oldStart;
      }
    });
  }
  return string.join('');
}

function wrapper(node) {
  return {
    name: 'wrapper',
    data: 'wrapper',
    type: 'wrapper',
    children: node,
    next: null,
    prev: null,
    parent: null,
  };
}

function walkAst(node, callback, finish, { reverse = false, wrap = true } = {}) {
  // Based on https://github.com/jordancalder/walkers with additional
  // reverse walk feature.
  if (wrap) {
    // eslint-disable-next-line no-param-reassign
    node = wrapper(node);
  }
  callback(node);
  // eslint-disable-next-line no-prototype-builtins
  if (node.hasOwnProperty('children')) {
    if (reverse) {
      const hasTextNodeChildren = node.children.some((child) => {
        // Only return true if text node and not just whitespace.
        return child.type === 'text' && whitespaceRx.test(child.data) === false;
      });
      if (hasTextNodeChildren) {
        node.children.reverse();
        // eslint-disable-next-line  array-callback-return
        node.children.map((child) => {
          // eslint-disable-next-line no-param-reassign
          child.poToolsReverse = true;
        });
      }
    }
    // eslint-disable-next-line no-param-reassign, prefer-destructuring
    node = node.children[0];
  } else {
    // eslint-disable-next-line no-param-reassign
    node = null;
  }
  while (node) {
    walkAst(node, callback, false, { wrap: false, reverse });
    // eslint-disable-next-line no-param-reassign
    node = reverse && node.poToolsReverse === true ? node.prev : node.next;
  }
  if (typeof finish === 'function') {
    finish();
  }
}

function transform(input, { format = 'unicode' } = {}) {
  let data;
  const reverse = format === 'mirror';
  const handler = new htmlparser.DomHandler((error, dom) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } else {
      walkAst(dom, (node) => {
        if (node.type === 'text') {
          // Don't reverse pure whitespace.
          // eslint-disable-next-line no-param-reassign
          node.data = whitespaceRx.test(node.data) === false
            ? transformText(node.data, { format }) : node.data;
        }
      }, () => {
        // eslint-disable-next-line no-param-reassign
        data = dom;
      }, { reverse });
    }
  });
  const parser = new htmlparser.Parser(handler);
  parser.write(input);
  parser.done();
  return render(data);
}

function mirrorTransform(input) {
  return transform(input, { format: 'mirror' });
}

function unicodeTransform(input) {
  return transform(input, { format: 'unicode' });
}

function debugCommand(config, { _chalk = chalk, _process = process, _console = console } = {}) {
  const { format } = config;
  const isStdOut = config.output === 'stdout';
  let bar;
  return poLoad(config.potfile)
    // eslint-disable-next-line consistent-return
    .then((po) => {
      if (!isStdOut) {
        bar = new prog.Bar({
          fps: 40,
          stopOnComplete: true,
          format: '[{bar}] {percentage}% | {value}/{total}',
        }, prog.Presets.shades_grey);
        bar.start(po.items.length, 0);
      }
      po.items.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.msgstr[0] = transform(item.msgid, { format });
        if (item.msgid_plural) {
          // eslint-disable-next-line no-param-reassign
          item.msgstr[1] = transform(item.msgid_plural, { format });
        }
        if (bar && !isStdOut) {
          bar.increment(1);
        }
      });

      // Make sure we are setting proper plural forms. This fixes various
      // issues with gnu gettext. See
      // https://github.com/mozilla/potools/issues/7 for more details.
      if (po.headers && !po.headers['Plural-Forms']) {
        // eslint-disable-next-line no-param-reassign
        po.headers['Plural-Forms'] = 'nplurals=2; plural=(n != 1);';
      }

      if (isStdOut) {
        _process.stdout.write(po.toString());
      } else {
        promisify(po);
        return po.save(config.output);
      }
    })
    .catch((err) => {
      _console.log(_chalk.red(err.message));
      return _process.exit(1);
    });
}

module.exports = {
  debugCommand,
  splitText,
  unicode,
  mirror,
  unicodeTransform,
  mirrorTransform,
};
