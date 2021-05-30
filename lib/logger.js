const config = require('./config')
const levels = ['success', 'error', 'warn', 'info', 'debug']

const Logger = {
  set: (level = 'debug') => {
    if (levels.indexOf(level) != -1) {
      config.set('logLevel', level)
    }
    Logger.info(`Updated log level to: "${level}"`)
  },
  get: () => config.get('logLevel'),
  error: (message, namespace) => Logger.log('error', message, namespace),
  success: (message, namespace) => Logger.log('success', message, namespace),
  warn: (message, namespace) => Logger.log('warn', message, namespace),
  info: (message, namespace) => Logger.log('info', message, namespace),
  debug: (message, namespace) => Logger.log('debug', message, namespace),
  title: (message, namespace) => {
    console.log(`
---------------------------------------------------------
| ${message}
---------------------------------------------------------`)
  },
  log: function (level, message, namespace) {
    let logLevel = config.get('logLevel')
    // initialize if it doesn't exist for some reason
    if (!logLevel) {
      Logger.set('debug')
      logLevel = 'debug'
    }
    const colors = {
      error: 'red',
      success: 'green',
      warn: 'yellow',
      info: 'blue',
      debug: 'gray'
    }
    if (levels.indexOf(level) <= levels.indexOf(logLevel)) {
      if (typeof message !== 'string') {
        message = JSON.stringify(message, null, 2)
      }
      message = message[colors[level]]
      if (namespace !== undefined) {
        message = (`[${namespace}]\t`).gray + message
      }

      if (level === 'error') {
        console.error(level[colors[level]] + ':\t' + message)
      }
      else if (level === 'info') {
        console.log('\n' + message + '\n')
      }
      else {
        console.log('\n' + level[colors[level]] + ':\t' + message + '\n')
      }
    }
  }
}
module.exports = Logger;