
const ynab = require('ynab')
const config = require('./config')
let cachedAPI = null


module.exports = {
  ourBudgetId: () => config.get('ynab_budgetId'),
  ourUncategorizedCategoryId: () => config.get('ynab_uncategorizedId'),
  getYnabAPI: async function(){
    if(cachedAPI){
      return cachedAPI
    }
    let ynabPat = await config.get('ynab_pat')
    cachedAPI = new ynab.API(ynabPat)

    return cachedAPI
  },
}