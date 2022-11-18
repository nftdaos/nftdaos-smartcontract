const fs = require('fs');

const ProxyAdmin = artifacts.require('ProxyAdmin');
const TransparentUpgradeableProxy = artifacts.require('TransparentUpgradeableProxy');
const Settings = artifacts.require("Settings");
const IWETH = artifacts.require("IWETH");

const MockWETH = artifacts.require("MockWETH");

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
    if (deployData['WETH'] == undefined || deployData['WETH'] == '') {
      if (network == 'local') {
        await deployer.deploy(MockWETH);
        let mockWETH = await MockWETH.deployed();
        deployData['WETH'] = mockWETH.address
        await fs.writeFileSync(fileName, JSON.stringify(deployData))
      }
    }
    let weth = await IWETH.at(deployData['WETH'])
    // 
    let proxyAdmin = await ProxyAdmin.at(deployData['ProxyAdmin']);
    // 
    let settings;
    let settingsUpdated = false;
    {
      if (deployData['Settings'] == undefined || deployData['Settings'] == '') {
        await deployer.deploy(Settings);
        settings = await Settings.deployed();
        {
          deployData['Settings'] = settings.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          settingsUpdated = true;
        }
      }
      settings = await Settings.at(deployData['Settings']);
    }
    // 
    let settingsProxy;
    {
      if (deployData['SettingsProxy'] == undefined || deployData['SettingsProxy'] == '') {
        let initializeData = settings.contract.methods.initialize(weth.address).encodeABI();
        await deployer.deploy(
          TransparentUpgradeableProxy,
          settings.address,
          proxyAdmin.address,
          initializeData
        );
        settingsProxy = await TransparentUpgradeableProxy.deployed();
        {
          deployData['SettingsProxy'] = settingsProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          settingsUpdated = false;
        }
      }
      settingsProxy = await Settings.at(deployData['SettingsProxy']);
      if (settingsUpdated) {
        await proxyAdmin.upgrade(settingsProxy.address, settings.address)
        console.log('settings proxyAdmin.upgrade()', settingsProxy.address, settings.address)
      }
    }
  }
};