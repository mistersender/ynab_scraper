# YNAB CLI

This CLI is intended to simplify some of the tedious bits of YNAB categorization, specifically around importing amazon orders (and hopefully other vendors soon). It allows the user to scrape amazon and match their orders with the categories in YNAB, then add a memo in YNAB in order to categorize them more simply.

## Quick Start

You will Need to have a [YNAB PAT](https://app.youneedabudget.com/settings/developer) in order to set up initially.

```bash
npm i

npm link

ynab setup
```

You should now be able to run `ynab <command>` from anywhere.

## Commands

* `ynab scrape [site]` - scrapes a site and syncs to ynab. (Default site: `amazon`). Optionally pass in `-a` to get all transactions that are uncategorized, even if they already have a memo filled in.
* `ynab set-logging [level]` - sets the logging level for the CLI
* `ynab debug` - debugging the cli info

## Scraping

### Amazon Scraping
* Install the plugin ["Amazon Order History Reporter"](https://chrome.google.com/webstore/detail/amazon-order-history-repo/mgkilgclilajckgnedgjgnfdokkgnibi)
* Run a scrape using the Amazon Order History Reporter. Once complete:
  1. select to view "All"
  2. right click the table, and "save as". Save into the `scraper/amazon` folder wherever this cli lives. It does not need a specific name.
* You should now be able to run `ynab scrape amazon` and iterate through the results successfully.