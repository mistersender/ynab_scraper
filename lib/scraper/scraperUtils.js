
const fs = require("fs")
const path = require("path")
const logger = require('../logger')

const scraperBasePath = path.join(__dirname, "../", "../", "scraper")

module.exports = {
  scraperBasePath,
  saveDebugData(name, data){
    if(logger.get() == 'debug'){
      logger.debug(`Writing file ${name} to disk for debugging purposes.`)
      // for debugging purposes, write a file out to disk to review
      fs.writeFileSync(path.join(scraperBasePath, "temp", `${name}.json`), JSON.stringify(data, null, 2))
    }
  }
}