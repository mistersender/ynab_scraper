const logger = require('../logger')
const { getYnabAPI, ourBudgetId } = require('../ynabAPI')
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

  const transactionsResp = await ynabAPI.transactions.getTransactionsByType(ourBudgetId(), "uncategorized")
  // only get transactions that aren't transfers (as transfers are also "uncategorized")
  let uncategorizedTransactions = transactionsResp.data.transactions.filter(t => !t.transfer_account_id)
  
  // only review transactions _without_ a memo, unless the user says to include all of them intentionally.
  if(!includeAll){
    uncategorizedTransactions = uncategorizedTransactions.filter(t => !t.memo)
  }
  
  // for debugging purposes, write a file out to disk to review in debug mode
  scraperUtils.saveDebugData("uncategorized", uncategorizedTransactions)

  await scrapeSites[site](uncategorizedTransactions)
  
  Logger.success(`Finished ${site} Scrape for YNAB`)
}