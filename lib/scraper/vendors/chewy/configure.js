module.exports = async function (prompts, config) {
  // if they're already set, let the user escape
  if (config.has('chewy_username') && config.has('chewy_password')) {
    const resetCredentials = await prompts({
      type: 'confirm',
      name: 'value',
      message: `You've already set your chewy credentials, do you want to re-set them?`,
      initial: false
    })
    if (!resetCredentials.value) {
      return
    }
  }

  const username = await prompts({
    type: 'text',
    name: 'value',
    message: `What is your chewy login email?`,
    min: 1,
    validate: value => value.length
  })
  config.set(`chewy_username`, username.value)

  const password = await prompts({
    type: 'password',
    name: 'value',
    message: `What is your chewy password?`,
    min: 1,
    validate: value => value.length
  })
  config.set(`chewy_password`, password.value)
}