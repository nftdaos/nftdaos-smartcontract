const fs = require('fs');
const verifyContract = require('./verify_contract.js');

const Settings = artifacts.require("Settings");
const TokenVaultStaking = artifacts.require("TokenVaultStaking");
const TokenVaultStakingProxy = artifacts.require("TokenVaultStakingProxy");
const TokenVaultStakingLogic = artifacts.require("TokenVaultStakingLogic");

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
    // 
    let tokenVaultStakingLogic = await TokenVaultStakingLogic.at(deployData['TokenVaultStakingLogic']);
    await deployer.link(tokenVaultStakingLogic, TokenVaultStaking);
    // 
    let tokenVaultStaking;
    {
      if (deployData['TokenVaultStaking'] == undefined || deployData['TokenVaultStaking'] == '') {
        await deployer.deploy(TokenVaultStaking, settingsProxy.address);
        tokenVaultStaking = await TokenVaultStaking.deployed();
        {
          deployData['TokenVaultStaking'] = tokenVaultStaking.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultStaking = await TokenVaultStaking.at(deployData['TokenVaultStaking']);
    }
    // 
    let tokenVaultStakingProxy;
    {
      if (deployData['TokenVaultStakingProxy'] == undefined || deployData['TokenVaultStakingProxy'] == '') {
        await deployer.deploy(TokenVaultStakingProxy, settingsProxy.address);
        tokenVaultStakingProxy = await TokenVaultStakingProxy.deployed();
        {
          deployData['TokenVaultStakingProxy'] = tokenVaultStakingProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultStakingProxy = await TokenVaultStakingProxy.at(deployData['TokenVaultStakingProxy']);
    }
    // 
    await verifyContract(
      deployData,
      config,
      'TokenVaultStaking',
      deployData['TokenVaultStaking'],
      '',
    )
  }
};