const fs = require('fs');

const ProxyAdmin = artifacts.require('ProxyAdmin');
const TransparentUpgradeableProxy = artifacts.require('TransparentUpgradeableProxy');
const Settings = artifacts.require("Settings");
const TokenVaultPresale = artifacts.require("TokenVaultPresale");

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
    let proxyAdmin = await ProxyAdmin.at(deployData['ProxyAdmin']);
    let settingsProxy = await Settings.at(deployData['SettingsProxy']);
    // 
    let tokenVaultPresale;
    let tokenVaultPresaleUpdated = false;
    {
      if (deployData['TokenVaultPresale'] == undefined || deployData['TokenVaultPresale'] == '') {
        await deployer.deploy(TokenVaultPresale, settingsProxy.address);
        tokenVaultPresale = await TokenVaultPresale.deployed();
        {
          deployData['TokenVaultPresale'] = tokenVaultPresale.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          tokenVaultPresaleUpdated = true;
        }
      }
      tokenVaultPresale = await TokenVaultPresale.at(deployData['TokenVaultPresale']);
    }
    // 
    let tokenVaultPresaleProxy;
    {
      if (deployData['TokenVaultPresaleProxy'] == undefined || deployData['TokenVaultPresaleProxy'] == '') {
        let initializeData = tokenVaultPresale.contract.methods.initialize().encodeABI();
        await deployer.deploy(
          TransparentUpgradeableProxy,
          tokenVaultPresale.address,
          proxyAdmin.address,
          initializeData
        );
        tokenVaultPresaleProxy = await TransparentUpgradeableProxy.deployed();
        {
          deployData['TokenVaultPresaleProxy'] = tokenVaultPresaleProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          tokenVaultPresaleUpdated = false;
        }
      }
      tokenVaultPresaleProxy = await TokenVaultPresale.at(deployData['TokenVaultPresaleProxy']);
      if (tokenVaultPresaleUpdated) {
        await proxyAdmin.upgrade(tokenVaultPresaleProxy.address, tokenVaultPresale.address)
        console.log('tokenVaultPresale proxyAdmin.upgrade()', tokenVaultPresaleProxy.address, tokenVaultPresale.address)
      }
    }
  }
};