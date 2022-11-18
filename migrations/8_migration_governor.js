const fs = require('fs');

const Settings = artifacts.require("Settings");
const TokenVaultGovernor = artifacts.require("TokenVaultGovernor");
const TokenVaultGovernorProxy = artifacts.require("TokenVaultGovernorProxy");
const TokenVaultLogic = artifacts.require("TokenVaultLogic");
const TokenVaultGovernorLogic = artifacts.require("TokenVaultGovernorLogic");

module.exports = async function (deployer, network) {
  let options = deployer.options.networks[network]
  if (options.migration) {
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

    let tokenVaultLogic = await TokenVaultLogic.at(deployData['TokenVaultLogic']);
    await deployer.link(tokenVaultLogic, TokenVaultGovernor);
    let tokenVaultGovernorLogic = await TokenVaultGovernorLogic.at(deployData['TokenVaultGovernorLogic']);
    await deployer.link(tokenVaultGovernorLogic, TokenVaultGovernor);
    // 
    let tokenVaultGovernor;
    {
      if (deployData['TokenVaultGovernor'] == undefined || deployData['TokenVaultGovernor'] == '') {
        await deployer.deploy(TokenVaultGovernor, settingsProxy.address);
        tokenVaultGovernor = await TokenVaultGovernor.deployed();
        {
          deployData['TokenVaultGovernor'] = tokenVaultGovernor.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultGovernor = await TokenVaultGovernor.at(deployData['TokenVaultGovernor']);
    }
    // 
    let tokenVaultGovernorProxy;
    {
      if (deployData['TokenVaultGovernorProxy'] == undefined || deployData['TokenVaultGovernorProxy'] == '') {
        await deployer.deploy(TokenVaultGovernorProxy, settingsProxy.address);
        tokenVaultGovernorProxy = await TokenVaultGovernorProxy.deployed();
        {
          deployData['TokenVaultGovernorProxy'] = tokenVaultGovernorProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultGovernorProxy = await TokenVaultGovernorProxy.at(deployData['TokenVaultGovernorProxy']);
    }
  }
};