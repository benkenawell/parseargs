#!/usr/bin/env node

if (process.argv.length === 2) {
  const { basename } = await import('node:path');
  process.stdout.write(`
USAGE

  Use "--" to separate arguments to this command from arguments you want to parse.
  
  --config <string>             JSON config to pass to nodejs parseArgs. Overridden by other options.
  --option <key>=<type>         easy way to set an option key for parsing. type can be "string" or "boolean"
  --option <key>=<type>,<short> easy way to set an option key for parsing.
                                type can be "string" or "boolean". 
                                short must be a single letter
  --[no-]positional             whether to allow positionals or not
  --[no-]negative               whether to allow negatives or not
  --[no-]strict                 whether to set the config to strict or not.

Config Reference

  If you'd like, you can write a json config
  that conforms to the NodeJS parseArgs library. The other command line options take precedence over --config
  Pass the options you want parsed as other arguments, after a "--".
  
  Use jq to parse further on the command line

EXAMPLES

Example:
> ${basename(process.argv[1])} --option one=boolean,o --no-strict -- -otwo --three=four

Example:
> ${basename(process.argv[1])} --option one=string --no-strict -- --one two --three=four

Example: 
> config=$(jq -n '{"options": {"test": {"type": "string"}}, "strict": false}')
> ${basename(process.argv[1])} --config "$config" -- --test "what a lovely day" | jq .

Example:
> config=$(jq -n '{"options": {"test": {"type": "string"}}, "strict": false}')
> args=$(${basename(process.argv[1])} --config "$config" -- "$@")
> jq .values.test <<<"$args"

Config Reference:
https://nodejs.org/api/util.html#utilparseargsconfig

`);
  process.exit(0)
}

const { parseArgs } = await import('node:util')

const splitIndex = process.argv.findIndex((val) => val === "--")
let configArgs;
if (splitIndex < 0) configArgs = process.argv.slice(2)
else configArgs = process.argv.slice(2, splitIndex)

// parse config out of the arguments
const { values } = parseArgs({
  allowNegative: true,
  options: {
    config: {
      short: 'c',
      type: "string",
    },
    option: {
      short: "o",
      type: "string",
      multiple: true,
    },
    positional: {
      type: 'boolean',
    },
    negative: {
      type: 'boolean',
    },
    strict: {
      type: 'boolean',
    },
    // TODO: add short option, to work like --option does
  },
  args: configArgs
});

let config;
try {
  if (values.config) config = JSON.parse(values.config)
  if (!config) config = {}
  if (!config.options) config.options = {}
  for (const option of (values.option ?? [])) {
    const [key, optionString] = option.split("=")
    const [type, short] = optionString.split(",");
    // check type is a real type
    if (!['string', 'boolean'].includes(type))
      throw new Error(`Type of ${key} is incorrect`)
    config.options[key] = { type }
    // parse short option into config
    if (!!short) {
      if (short.length > 1) throw new Error(`Short option ${short} for option ${key} must be one character`)
      config.options[key].short = short;
    }
  }
  if (values.positional) config.allowPositionals = values.positional;
  if (values.negative) config.allowNegative = values.negative;
  if (values.strict) config.strict = values.strict;

} catch (err) {
  process.stderr.write("Unable to parse your config\n")
  if (typeof err === 'object' && !!err && 'message' in err)
    process.stderr.write(`${err.message}\n`);
  process.exit(1)
}

// if -- wasn't found, print the config out
if (splitIndex < 0) {
  process.stdout.write(JSON.stringify(config))
  process.exit(0)
}

const args = process.argv.slice(splitIndex + 1);
if (args.length <= 0) {
  process.stderr.write('no arguments provided\n')
  process.exit(1)
}

try {
  const output = parseArgs({ ...config, args })
  process.stdout.write(JSON.stringify(output))
  // TODO: add format option, something like --format json or --format headers
  // Format headers should have values in header format and positionals separated by \n\n
  // Example:
  // <option>: <value>
  // <option>: <value>
  //   
  // positional one
  // positional two
} catch {
  process.stderr.write("unable to parse your arguments.  Check your config\n")
  process.exit(1)
}
