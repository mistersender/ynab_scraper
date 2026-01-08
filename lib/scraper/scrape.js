const logger = require('../logger')
const { getYnabAPI, ourBudgetId } = require('../ynabAPI.js')
const scraperUtils = require("./scraperUtils")
const Logger = require('../logger')
const scraperConfig = require('../../.scraper.json')

let scrapeSites = {}
// import the configs of each site
scraperConfig.toScrape.forEach(site => {
  scrapeSites[site] = require(`./vendors/${site}/scrape.js`)
})

module.exports = async function(site = 'amazon', includeAll = false){
  if(!scrapeSites[site]){
    logger.warn(`Site "${site}" not set up. Valid options are: ${Object.keys(scrapeSites).join(", ")}`)
    return
  }
  
  const ynabAPI = await getYnabAPI()

  const transactionsResp = await ynabAPI.transactions.getTransactionsByType(ourBudgetId(), "unapproved")
  scraperUtils.saveDebugData("rawTransUnapproved", transactionsResp)

  let unapprovedTransactions = transactionsResp.data.transactions
  
  // only review transactions _without_ a memo, unless the user says to include all of them intentionally.
  if(!includeAll){
    unapprovedTransactions = unapprovedTransactions.filter(t => !t.memo)
  }
  
  // for debugging purposes, write a file out to disk to review in debug mode
  scraperUtils.saveDebugData("unapproved", unapprovedTransactions)

  await scrapeSites[site](unapprovedTransactions)
  
  Logger.success(`Finished ${site} Scrape for YNAB`)
}