module.exports = async function (prompts, config) {
  // if they're already set, let the user escape
  if (config.has("home_depot_username") && config.has("home_depot_password")) {
    const resetCredentials = await prompts({
      type: "confirm",
      name: "value",
      message: `You've already set your Home Depot credentials, do you want to re-set them?`,
      initial: false,
    })
    if (!resetCredentials.value) {
      return
    }
  }

  const username = await prompts({
    type: "text",
    name: "value",
    message: `What is your Home Depot login email?`,
    min: 1,
    validate: (value) => value.length,
  })
  config.set(`home_depot_username`, username.value)

  const password = await prompts({
    type: "password",
    name: "value",
    message: `What is your Home Depot password?`,
    min: 1,
    validate: (value) => value.length,
  })
  config.set(`home_depot_password`, password.value)
}
