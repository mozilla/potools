[![Build Status](https://travis-ci.org/mozilla/potools.svg?branch=master)](https://travis-ci.org/mozilla/potools)
[![npm version](https://badge.fury.io/js/potools.svg)](https://badge.fury.io/js/potools)

# Potools

A simple CLI utility to provide assistance with po-file based translations

## Commands

### debug

This command helps write out debug versions of pofile contents. It is both HTML
and placeholder aware.

```
potools debug <potfile> [output] [format]

Options:
  --help    Show help                                                  [boolean]
  --format  The output format.
                             [choices: "unicode", "mirror"] [default: "unicode"]
  --output  Output path. If not provided outputs to stdout   [default: "stdout"]
```

There are two formats you can use:

* `unicode`: converts input to use unicode characters.
* `mirror`: converts input to use mirrored characters (recommended to be used via an RTL locale).

#### Debug Examples:

```
potools debug ../bar/locale/templates/LC_MESSAGES/messages.pot
```

Will output to stdout in unicode format.

```
potools debug ../bar/locale/templates/LC_MESSAGES/messages.pot --format mirror
```

Will output to stdout in mirror format.

```
potools debug ../bar/locale/templates/LC_MESSAGES/messages.pot --format mirror --output ../test.txt
```

Will write the ouptut to `../test.txt`.

### Caveats 

The RTL debug locale generation generally inverts input to emulates what an RTL translation will look like. 
It will also handle HTML by reversing parts of HTML AST during processing in order to keep a sane order of elements 
but reverse the order of text and HTML.

E.g: `foo <a href="#whatevs">bar <span>test</span></a>` becomes `<a href="#whatevs"><span>ʇsǝʇ</span> ɹɐq</a> ooɟ`.

When placeholders are used to substitute HTML, this will cause problems if the placeholders are inverted. To fix this placeholders that are prefixed with `start` or `end` and have a matching suffix will remain in their original placement 
order.

E.g: `foo %(startSpan)sbar%(endSpan)s` will become `%(startSpan)sɹɐq%(endSpan)s ooɟ` to preserve order.
