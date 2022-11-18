const fs = require('fs');

const Settings = artifacts.require("Settings");
const TokenVaultExchange = artifacts.require("TokenVaultExchange");
const TokenVaultExchangeProxy = artifacts.require("TokenVaultExchangeProxy");

module.exports = async function (deployer, network) {
  let options = deployer.options.networks[network]
  if (options.migration) {
    // 
    // 
    let fileName = process.cwd() + '/migrations/deployed_' + network + '.json';
    let deployData = {}
    if (await fs.existsSync(fileName)) {
      let dataText = await fs.readFileSync(fileName)
      deployData = JSON.parse(dataText.toString())
    } else {
      await fs.writeFileSync(fileName, JSON.stringify(deployData))
    }
    // 
    let settingsProxy = await Settings.at(deployData['SettingsProxy']);
    // 
    let tokenVaultExchange;
    {
      if (deployData['TokenVaultExchange'] == undefined || deployData['TokenVaultExchange'] == '') {
        await deployer.deploy(TokenVaultExchange, settingsProxy.address);
        tokenVaultExchange = await TokenVaultExchange.deployed();
        {
          deployData['TokenVaultExchange'] = tokenVaultExchange.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultExchange = await TokenVaultExchange.at(deployData['TokenVaultExchange']);
    }
    // 
    let tokenVaultExchangeProxy;
    {
      if (deployData['TokenVaultExchangeProxy'] == undefined || deployData['TokenVaultExchangeProxy'] == '') {
        await deployer.deploy(TokenVaultExchangeProxy, settingsProxy.address);
        tokenVaultExchangeProxy = await TokenVaultExchangeProxy.deployed();
        {
          deployData['TokenVaultExchangeProxy'] = tokenVaultExchangeProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultExchangeProxy = await TokenVaultExchangeProxy.at(deployData['TokenVaultExchangeProxy']);
    }
  }
};