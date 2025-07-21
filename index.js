#!/usr/bin/env node

if (process.argv.length === 2) {
  const { basename } = await import('node:path');
  process.stdout.write(`
To use this utility, write a config
that conforms to the NodeJS parseArgs library.
Pass the options you want parsed as other arguments.

Use jq to parse further on the command line

Example: 

> config=$(jq -n '{"options": {"test": {"type": "string"}}, "strict": false}')
> ${basename(process.argv[1])} --config "$config" --test "what a lovely day" | jq .

Example:
> config=$(jq -n '{"options": {"test": {"type": "string"}}, "strict": false}')
> args=$(${basename(process.argv[1])} --config "$config" "$@")
> jq .values.test <<<"$args"

Config Reference:
https://nodejs.org/api/util.html#utilparseargsconfig

`);
  process.exit(0)
}

const { parseArgs } = await import('node:util')

// parse config out of the arguments
const { values, tokens } = parseArgs({
  allowPositionals: true,
  allowNegatives: true,
  strict: false,
  options: {
    'config': {
      "short": 'c',
      "type": "string",
    }
  },
  tokens: true
});

// if no config was provided, use a default relaxed one
let config;
try {
  config = values.config && JSON.parse(values.config);
} catch {
  process.stderr.write("Unable to parse your config\n")
  process.exit(1)
}
config = config || {
  allowPositionals: true,
  allowNegatives: true,
  strict: false
}

const slicedInput = process.argv.slice(2);
const args = tokens
  .filter(token => token.name !== 'config')
  .reduce((acc, cur) => {
    acc[cur.index] = slicedInput[cur.index]
    return acc;
  }, [])
  // filter out empty slots, I know we'll have at least the config slot empty
  .filter(token => typeof token === 'string')

try {
  const output = parseArgs({ ...config, args })
  process.stdout.write(JSON.stringify(output))
} catch {
  process.stderr.write("unable to parse your arguments.  Check your config\n")
  process.exit(1)
}
