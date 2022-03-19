module.exports = async function (prompts, config){
  // if they're already set, let the user escape
  if (config.has('amazon_username') && config.has('amazon_password')){
    const resetCredentials = await prompts({
      type: 'confirm',
      name: 'value',
      message: `You've already set your amazon credentials, do you want to re-set them?`,
      initial: false
    })
    if (!resetCredentials.value){
      return
    }
  }

  const username = await prompts({
    type: 'text',
    name: 'value',
    message: `What is your amazon login email?`,
    min: 1,
    validate: value => value.length
  })
  config.set(`amazon_username`, username.value)

  const password = await prompts({
    type: 'password',
    name: 'value',
    message: `What is your amazon password?`,
    min: 1,
    validate: value => value.length
  })
  config.set(`amazon_password`, password.value)
}