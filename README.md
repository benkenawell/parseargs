# parseargs

This is a utility script to aid with parsing command line arguments in other scripts.

## Installation

`npm install --global @benkenawell/parseargs`

You could also clone the repo and run `npm link` which should make it available anywhere you have that version of node as "parseargs"

You could also just copy index.js and link to it somewhere on your PATH.  I recommend giving it the name "parseargs", but that's up to you.  I would **not** call it getopt or getopts, those are already executable names.

## Usage

This package is meant to be used as a script/executable, primarily in your shell.  There is nothing to import.

```bash
#!/usr/bin/env bash
# An example script calling parseargs.
# Takes the --test, -t flag and is not strict

config="$(jq -n '
  {
    "options": {
      "test": {"type": "string", "short": "t"}
    },
    "strict": false
  }
')"

# parses the args to this script. Pretty prints with jq
parseargs --config "$config" -- "$@" | jq .
```

```bash
parseargs --option test=string,t --no-strict -- "$@" | jq .
```

```bash
parseargs --config "$(parseargs --option test=string,t --no-strict)" -- "$@" | jq .
```

## Requirements

Node, of course. `parseArgs` was made stable in v20.16 and v22.4, so any version newer than that should work.  In v16 and v18 it was still experimental, so it might work sometimes but I'm not supporting it.  If you need to manage your node versions, I recommend [mise](https://mise.jdx.dev/lang/node.html)

Bun or Deno might work.  If you try it, let me know how it goes in an Issue.

## Background

I know Node well. Node has a solid utility function, [parseArgs](https://nodejs.org/api/util.html#utilparseargsconfig) for parsing arguments from the command line.  I often write bash scripts where I want to have some of that parsing power.

Node is also very good at the JSON format.  [jq](https://jqlang.org/) is a command line utility that is _also_ very good at parsing json.  If we combine these JSON parsing functions, we can use JSON as an interchange format in the terminal.

Is it a great idea? I'm not sure!  JSON is still text in the strict sense of the word, but does it fit the Unix philosophy?  I'm not sure!  But with jq I can parse through the returned arguments now a lot faster than I can remember awk. Is that faster than

## Who is this for?

Me, primarily.  But if you want to use it too, please go ahead.  I would love to learn that other people have this same problem.  

Have an issue with my script? Please open an issue.

I doubt my little script is going to be the fastest way to parse arguments like this, I'm really after the returned json so I can parse further with jq.
