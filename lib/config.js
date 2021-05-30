const fs = require('fs')
const path = require('path')
const config_path = path.join(require('os').homedir(), `.ynabcli`)
let config = {}

const getItem = from => {
  if (from) {
    let item = config
    let nodes = from.split('.')
    nodes.forEach(node => item = item[node])
    return item
  }
  return undefined
}

const save = () => {
  // todo- consider adding a timer
  fs.writeFile(config_path, JSON.stringify(config, null, 2), 'utf-8', function (err) {
    if (err) {
      process.exit(1)
    }
  });
}

const exportable = {
  path: String(config_path),
  set(to, data) {
    config[to] = data
    save()
  },
  get(from) {
    let val = from ? getItem(from) : config
    if(!val){
      console.log(`You need to set up "${from}" to run this command. You may need to run "ynab setup".`)
      process.exit(1)
    }
    return val ? JSON.parse(JSON.stringify(val)) : undefined
  }
}


// set up
try {
  config = JSON.parse(fs.readFileSync(config_path, 'utf-8'))
}
catch (e) {
  config = {}
  save()
}

module.exports = exportable