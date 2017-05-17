[![Build Status](https://travis-ci.org/mozilla/potools.svg?branch=master)](https://travis-ci.org/mozilla/potools)

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
