const fs = require('fs');

const Settings = artifacts.require("Settings");
const TokenVaultTreasury = artifacts.require("TokenVaultTreasury");
const TokenVaultTreasuryProxy = artifacts.require("TokenVaultTreasuryProxy");

module.exports = async function (deployer, network) {
  let options = deployer.options.networks[network]
  if (options.migration) {
    // 
    let sleepDuraion = 0
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
    let tokenVaultTreasury;
    {
      if (deployData['TokenVaultTreasury'] == undefined || deployData['TokenVaultTreasury'] == '') {
        await deployer.deploy(TokenVaultTreasury, settingsProxy.address);
        tokenVaultTreasury = await TokenVaultTreasury.deployed();
        {
          deployData['TokenVaultTreasury'] = tokenVaultTreasury.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultTreasury = await TokenVaultTreasury.at(deployData['TokenVaultTreasury']);
    }
    // 
    let tokenVaultTreasuryProxy;
    {
      if (deployData['TokenVaultTreasuryProxy'] == undefined || deployData['TokenVaultTreasuryProxy'] == '') {
        await deployer.deploy(TokenVaultTreasuryProxy, settingsProxy.address);
        tokenVaultTreasuryProxy = await TokenVaultTreasuryProxy.deployed();
        {
          deployData['TokenVaultTreasuryProxy'] = tokenVaultTreasuryProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultTreasuryProxy = await TokenVaultTreasuryProxy.at(deployData['TokenVaultTreasuryProxy']);
    }
  }
};