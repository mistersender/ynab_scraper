const config = require('./config')
const log = require('./logger')
const prompts = require('prompts')
const ynab = require('ynab')
const scraperConfig = require('../.scraper.json')

const setUncategorizedCategory = async function(budgetId) {
  let ynabPat = config.get('ynab_pat')
  let ynabAPI = new ynab.API(ynabPat)
  const allCategories = await ynabAPI.categories.getCategories(budgetId)
  let masterCategories = allCategories.data.category_groups.filter(groups => groups.name == "Internal Master Category")[0]
  let uncategorizedCategory = masterCategories.categories.filter(cat => cat.name == "Uncategorized")[0]
  config.set(`ynab_uncategorizedId`, uncategorizedCategory.id)
  return uncategorizedCategory.id
}

let exportable = {
  all: () => {
    log.title("Answer the questions below to get your environment set up")
    return Promise.resolve()
      .then(() => exportable.ynab())
      .then(() => exportable.budgetId())
      .then(() => exportable.amazon())
      .then(() => log.success("Finished setup"))
  },
  ynab: async function() {
    log.info(`
Create a PAT for the YNAB CLI:
1. Go to https://app.youneedabudget.com/settings/developer
2. Copy the PAT to your clipboard
3. paste the PAT into the field below to save it
`)
    let pat = await prompts({
      type: 'text',
      name: 'value',
      message: `What is your YNAB PAT? ('s' to skip)`,
      min: 1,
      validate: value => value.length
    })

    if (pat.value == 's' || pat.value == 'skip') {
      return
    }
    config.set(`ynab_pat`, pat.value)
  },
  budgetId: async function () {
    let ynabPat = config.get('ynab_pat')
    let ynabAPI = new ynab.API(ynabPat)
    const budgets = await ynabAPI.budgets.getBudgets()

    const budgetQuestion = await prompts({
      type: 'select',
      name: 'budgetId',
      message: 'Which Budget ID do you want to use to interact with YNAB?',
      choices: budgets.data.budgets.map(budget => ({
        title: budget.name,
        value: budget.id
      }))
    });

    config.set(`ynab_budgetId`, budgetQuestion.budgetId)
    await setUncategorizedCategory(budgetQuestion.budgetId)
  },
}

// import the configs of each site
scraperConfig.toScrape.forEach(site => {
  exportable[site] = () => require(`./scraper/vendors/${site}/configure.js`)(prompts, config)
})

module.exports = exportable