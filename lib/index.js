require('colors') // add color coding to the logging
const program = require("commander")
const pkg = require('../package.json')
const setup = require('./setup')
const scrape = require('./scraper/scrape')
const exec = require('child-process-promise').exec
const Logger = require("./logger")
const config = require("./config")

program
  .version(pkg.version)
  // .option('-p, --prefix', "config key prefix to search for. Defaults to 'apps/consumer/raven/developer-configs/toggles/'")
  .usage(`

command_name [optional_argument] <required_argument>

Options (for some commands):
  -p --prefix        the prefix to use for the call, eg --prefix=apps/consumer/raven/developer-configs/
  -c --configtype    the config type to use. currently supports: "developer-configs", "text", "supported-features" (ch-sync only)
`)

// `ynab help`
// todo: either we can have a description, or it can be default. this is a known bug with commander
// i chose to make it default, so the description will be dumb in the output.
program.command('help', { isDefault: true })
  .description("Displays help text suspiciously similar to what you are looking at now")
  .action(() => program.help())

program
  .command('setup [type]')
  .description(`sets up stuff developers typically need to make this CLI run, or that are tedious. Defaults to all, can specify 'ynab'`)
  .action((type) => type ? setup[type]() : setup.all())

program
  .command('scrape [site]')
  .option('-a, --include-all', 'include all transactions whether they have a memo already or not')
  .description(`scrapes stuff from given site and adds notes to ynab`)
  .action((site, opts) => scrape(site, opts.includeAll))

program
  .command('set-logger [level]')
  .description("set logging level")
  .action(level => Logger.set(level))

program.command('debug')
  .description(`Output some debugging info, specifically for the CLI`)
  .action(() => {
    console.log(`${pkg.version} (from ${__filename})`)
    console.log(`Logging level: ${Logger.get()}`)
    exec('echo $AWS_PROFILE').then(result => console.log("$AWS_PROFILE=" + result.stdout))
    console.log("Setup Options:", JSON.stringify(config.get(), null, 2))
  })
// complete and parse the program
program.parse(process.argv)