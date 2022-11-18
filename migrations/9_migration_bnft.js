const fs = require('fs');

const Settings = artifacts.require("Settings");
const TokenVaultBnft = artifacts.require("TokenVaultBnft");
const TokenVaultBnftProxy = artifacts.require("TokenVaultBnftProxy");

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
    let tokenVaultBnft;
    {
      if (deployData['TokenVaultBnft'] == undefined || deployData['TokenVaultBnft'] == '') {
        await deployer.deploy(TokenVaultBnft, settingsProxy.address);
        tokenVaultBnft = await TokenVaultBnft.deployed();
        {
          deployData['TokenVaultBnft'] = tokenVaultBnft.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultBnft = await TokenVaultBnft.at(deployData['TokenVaultBnft']);
    }
    let tokenVaultBnftProxy;
    {
      if (deployData['TokenVaultBnftProxy'] == undefined || deployData['TokenVaultBnftProxy'] == '') {
        await deployer.deploy(TokenVaultBnftProxy, settingsProxy.address);
        tokenVaultBnftProxy = await TokenVaultBnftProxy.deployed();
        {
          deployData['TokenVaultBnftProxy'] = tokenVaultBnftProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultBnftProxy = await TokenVaultBnftProxy.at(deployData['TokenVaultBnftProxy']);
    }
  }
};