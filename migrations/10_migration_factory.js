const fs = require('fs');

const ProxyAdmin = artifacts.require('ProxyAdmin');
const TransparentUpgradeableProxy = artifacts.require('TransparentUpgradeableProxy');
const Settings = artifacts.require("Settings");
const VaultFactory = artifacts.require("VaultFactory");

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
    let proxyAdmin = await ProxyAdmin.at(deployData['ProxyAdmin']);
    let settingsProxy = await Settings.at(deployData['SettingsProxy']);
    // 
    let vaultFactory;
    let vaultFactoryUpdated = false;
    {
      if (deployData['VaultFactory'] == undefined || deployData['VaultFactory'] == '') {
        await deployer.deploy(VaultFactory, settingsProxy.address);
        vaultFactory = await VaultFactory.deployed();
        {
          deployData['VaultFactory'] = vaultFactory.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          vaultFactoryUpdated = true;
        }
      }
      vaultFactory = await VaultFactory.at(deployData['VaultFactory']);
    }
    // 
    let vaultFactoryProxy;
    {
      if (deployData['VaultFactoryProxy'] == undefined || deployData['VaultFactoryProxy'] == '') {
        let initializeData = vaultFactory.contract.methods.initialize().encodeABI();
        await deployer.deploy(
          TransparentUpgradeableProxy,
          vaultFactory.address,
          proxyAdmin.address,
          initializeData
        );
        vaultFactoryProxy = await TransparentUpgradeableProxy.deployed();
        {
          deployData['VaultFactoryProxy'] = vaultFactoryProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          vaultFactoryUpdated = false;
        }
      }
      vaultFactoryProxy = await VaultFactory.at(deployData['VaultFactoryProxy']);
      if (vaultFactoryUpdated) {
        await proxyAdmin.upgrade(vaultFactoryProxy.address, vaultFactory.address)
        console.log('vaultFactory proxyAdmin.upgrade()', vaultFactoryProxy.address, vaultFactory.address)
      }
    }
  }
};