const fs = require('fs');
const verifyContract = require('./verify_contract.js');

const Settings = artifacts.require("Settings");
const TokenVault = artifacts.require("TokenVault");
const TokenVaultGovernor = artifacts.require("TokenVaultGovernor");
const TokenVaultProxy = artifacts.require("TokenVaultProxy");
const TokenVaultLogic = artifacts.require("TokenVaultLogic");
const TokenVaultTreasuryLogic = artifacts.require("TokenVaultTreasuryLogic");
const TokenVaultStakingLogic = artifacts.require("TokenVaultStakingLogic");
const TokenVaultGovernorLogic = artifacts.require("TokenVaultGovernorLogic");
const TokenVaultExchangeLogic = artifacts.require("TokenVaultExchangeLogic");

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
    // 
    let settingsProxy = await Settings.at(deployData['SettingsProxy']);
    // 
    let tokenVaultLogic = await TokenVaultLogic.at(deployData['TokenVaultLogic']);
    await deployer.link(tokenVaultLogic, TokenVault);
    await deployer.link(tokenVaultLogic, TokenVaultGovernor);
    let tokenVaultTreasuryLogic = await TokenVaultTreasuryLogic.at(deployData['TokenVaultTreasuryLogic']);
    await deployer.link(tokenVaultTreasuryLogic, TokenVault);
    let tokenVaultStakingLogic = await TokenVaultStakingLogic.at(deployData['TokenVaultStakingLogic']);
    await deployer.link(tokenVaultStakingLogic, TokenVault);
    let tokenVaultGovernorLogic = await TokenVaultGovernorLogic.at(deployData['TokenVaultGovernorLogic']);
    await deployer.link(tokenVaultGovernorLogic, TokenVault);
    let tokenVaultExchangeLogic = await TokenVaultExchangeLogic.at(deployData['TokenVaultExchangeLogic']);
    await deployer.link(tokenVaultExchangeLogic, TokenVault);
    // 
    let tokenVault;
    {
      if (deployData['TokenVault'] == undefined || deployData['TokenVault'] == '') {
        await deployer.deploy(TokenVault, settingsProxy.address);
        tokenVault = await TokenVault.deployed();
        {
          deployData['TokenVault'] = tokenVault.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVault = await TokenVault.at(deployData['TokenVault']);
    }
    // for proxy
    let tokenVaultProxy;
    {
      if (deployData['TokenVaultProxy'] == undefined || deployData['TokenVaultProxy'] == '') {
        await deployer.deploy(TokenVaultProxy, settingsProxy.address);
        tokenVaultProxy = await TokenVaultProxy.deployed();
        {
          deployData['TokenVaultProxy'] = tokenVaultProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultProxy = await TokenVaultProxy.at(deployData['TokenVaultProxy']);
    }
    // 
    await verifyContract(
      deployData,
      config,
      'TokenVault',
      deployData['TokenVault'],
      '',
    )
  }
};