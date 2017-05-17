const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const htmlparser = require('htmlparser2');
const prog = require('cli-progress');
const PO = require('pofile');
const render = require('dom-serializer');

const unicodeFrom = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const unicodeTo = 'ȦƁƇḒḖƑƓĦĪĴĶĿḾȠǾƤɊŘŞŦŬṼẆẊẎẐȧƀƈḓḗƒɠħīĵķŀḿƞǿƥɋřşŧŭṽẇẋẏẑ';
const mirrorFrom = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+\\|`~[{]};:'\",<.>/?";
const mirrorTo = "ɐqɔpǝɟƃɥıɾʞʅɯuodbɹsʇnʌʍxʎz∀ԐↃᗡƎℲ⅁HIſӼ⅂WNOԀÒᴚS⊥∩ɅＭX⅄Z0123456789¡@#$%ᵥ⅋⁎)(-_=+\\|,~]}[{;:,„´>.</¿";

// Currently matches:
// %(placeholder)s
// %(placeholder)d
// %s %d
// {foo}
const placeholderRx = /%\([\s\S]+?\)[sd]|%[sd]|\{\w+\}/g;

function splitText(input) {
  const parts = [];
  let pos = 0;
  let match;
  while ((match = placeholderRx.exec(input)) != null) {
    if (pos < match.index) {
      // Push the non-matching string into the list.
      parts.push({value: input.substr(pos, match.index - pos), type: 'text'});
    }
    // push the matching parts piece on the parts array.
    parts.push({value: match[0], type: 'placeholder'});
    pos = match.index + match[0].length;
  }
  if (pos < input.length) {
    parts.push({value: input.substr(pos, input.length - pos), type: 'text'});
  }
  return parts;
}

function mirror(inputString) {
  let trans = '';
  for (var i = inputString.length - 1; i >= 0; i--) {
    let idx = mirrorFrom.indexOf(inputString.charAt(i));
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
  for (var i = 0, j = inputString.length; i < j; i++) {
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
  let string = [];
  for (token of tokens) {
    if (token.type == 'text') {
      string.push(format === 'unicode' ? unicode(token.value) : mirror(token.value));
    } else {
      string.push(token.value);
    }
  }
  if (format === 'mirror') {
    string.reverse();
  }
  return string.join('');
}

function wrapper(node){
  return {
    name: 'wrapper',
    data: 'wrapper',
    type: 'wrapper',
    children: node,
    next: null,
    prev: null,
    parent: null
  };
}

function walkAst(node, callback, finish, { reverse = false, wrap = true }) {
  // Based on https://github.com/jordancalder/walkers with additional
  // reverse walk feature.
  if (wrap) {
    node = wrapper(node);
  }
  callback(node);
  if (node.hasOwnProperty('children')) {
    if (reverse) {
      node.children.reverse();
    }
    node = node.children[0];
  } else {
    node = null;
  }
  while (node) {
    walkAst(node, callback, false, { wrap: false, reverse });
    node = reverse ? node.prev : node.next;
  }
  if (typeof finish === 'function') {
    finish();
  }
};

function transform(input, { format = 'unicode' } = {}) {
  let data;
  const reverse = format === 'mirror';
  var handler = new htmlparser.DomHandler((error, dom) => {
    if (error) {
      console.error(error);
    } else {
       walkAst(dom, (node) => {
        if (node.type == 'text') {
          node.data = transformText(node.data, { format });
        }
      }, () => {
        data = dom;
      }, { reverse });
    }
  });
  var parser = new htmlparser.Parser(handler);
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

function potools(config) {
  const po = new PO();
  const format = config.format;
  PO.load(config.potfile, (err, po) => {
    if (err) {
      console.log(chalk.red(err.message));
      process.exit(1);
    }
    const bar = new prog.Bar({
      fps: 20,
      stopOnComplete: true,
      format: '[{bar}] {percentage}% | {value}/{total}',
    }, prog.Presets.shades_grey)
    bar.start(po.items.length, 0);
    po.items.forEach((item, idx) => {
      item.msgstr[0] = transform(item.msgid, { format });
      if (item.msgid_plural) {
        item.msgstr[1] = transform(item.msgid_plural, { format });
      }
      bar.increment(1);
    })
    if (config.output === 'stdout') {
      process.stdout.write(po.toString());
    } else {
      po.save(config.output, (err) => {
        if (err) {
          console.log(chalk.red(err.message));
          process.exit(1);
        }
      });
    }
  });
}

module.exports = {
  potools: potools,
  splitText: splitText,
  unicode: unicode,
  mirror: mirror,
  unicodeTransform: unicodeTransform,
  mirrorTransform: mirrorTransform,
};
