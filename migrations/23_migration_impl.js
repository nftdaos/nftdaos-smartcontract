const fs = require('fs');

const Settings = artifacts.require("Settings");
const VaultFactory = artifacts.require("VaultFactory");
const TokenVault = artifacts.require("TokenVault");
const TokenVaultTreasury = artifacts.require("TokenVaultTreasury");
const TokenVaultStaking = artifacts.require("TokenVaultStaking");
const TokenVaultGovernor = artifacts.require("TokenVaultGovernor");
const TokenVaultExchange = artifacts.require("TokenVaultExchange");
const TokenVaultBnft = artifacts.require("TokenVaultBnft");
const TokenVaultProxy = artifacts.require("TokenVaultProxy");
const TokenVaultTreasuryProxy = artifacts.require("TokenVaultTreasuryProxy");
const TokenVaultStakingProxy = artifacts.require("TokenVaultStakingProxy");
const TokenVaultGovernorProxy = artifacts.require("TokenVaultGovernorProxy");
const TokenVaultExchangeProxy = artifacts.require("TokenVaultExchangeProxy");
const TokenVaultBnftProxy = artifacts.require("TokenVaultBnftProxy");

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
    settingsProxy = await Settings.at(deployData['SettingsProxy']);
    let vaultFactory;
    vaultFactory = await VaultFactory.at(deployData['VaultFactory']);
    let vaultFactoryProxy;
    vaultFactoryProxy = await VaultFactory.at(deployData['VaultFactoryProxy']);
    let tokenVault;
    tokenVault = await TokenVault.at(deployData['TokenVault']);
    let tokenVaultTreasury;
    tokenVaultTreasury = await TokenVaultTreasury.at(deployData['TokenVaultTreasury']);
    let tokenVaultStaking;
    tokenVaultStaking = await TokenVaultStaking.at(deployData['TokenVaultStaking']);
    let tokenVaultGovernor;
    tokenVaultGovernor = await TokenVaultGovernor.at(deployData['TokenVaultGovernor']);
    let tokenVaultExchange;
    tokenVaultExchange = await TokenVaultExchange.at(deployData['TokenVaultExchange']);
    let tokenVaultBnft;
    tokenVaultBnft = await TokenVaultBnft.at(deployData['TokenVaultBnft']);
    let tokenVaultProxy;
    tokenVaultProxy = await TokenVaultProxy.at(deployData['TokenVaultProxy']);
    let tokenVaultTreasuryProxy;
    tokenVaultTreasuryProxy = await TokenVaultTreasuryProxy.at(deployData['TokenVaultTreasuryProxy']);
    let tokenVaultStakingProxy;
    tokenVaultStakingProxy = await TokenVaultStakingProxy.at(deployData['TokenVaultStakingProxy']);
    let tokenVaultGovernorProxy;
    tokenVaultGovernorProxy = await TokenVaultGovernorProxy.at(deployData['TokenVaultGovernorProxy']);
    let tokenVaultExchangeProxy;
    tokenVaultExchangeProxy = await TokenVaultExchangeProxy.at(deployData['TokenVaultExchangeProxy']);
    let tokenVaultBnftProxy;
    tokenVaultBnftProxy = await TokenVaultBnftProxy.at(deployData['TokenVaultBnftProxy']);

    // for Impl
    if ((await settingsProxy.stakingImpl() != tokenVaultStaking.address)) {
      await settingsProxy.setStakingImpl(tokenVaultStaking.address);
      console.log('settingsProxy.setStakingImpl')
    }
    if ((await settingsProxy.governmentImpl() != tokenVaultGovernor.address)) {
      await settingsProxy.setGovernmentImpl(tokenVaultGovernor.address);
      console.log('settingsProxy.setGovernmentImpl')
    }
    if ((await settingsProxy.exchangeImpl() != tokenVaultExchange.address)) {
      await settingsProxy.setExchangeImpl(tokenVaultExchange.address);
      console.log('settingsProxy.setExchangeImpl')
    }
    if ((await settingsProxy.vaultImpl() != tokenVault.address)) {
      await settingsProxy.setVaultImpl(tokenVault.address);
      console.log('settingsProxy.setVaultImpl')
    }
    if ((await settingsProxy.treasuryImpl() != tokenVaultTreasury.address)) {
      await settingsProxy.setTreasuryImpl(tokenVaultTreasury.address);
      console.log('settingsProxy.setTreasuryImpl')
    }
    if ((await settingsProxy.bnftImpl() != tokenVaultBnft.address)) {
      await settingsProxy.setBnftImpl(tokenVaultBnft.address);
      console.log('settingsProxy.setBnftImpl')
    }
    // for Tpl
    if ((await settingsProxy.vaultTpl() != tokenVaultProxy.address)) {
      await settingsProxy.setVaultTpl(tokenVaultProxy.address);
      console.log('settingsProxy.setVaultTpl')
    }
    if ((await settingsProxy.stakingTpl() != tokenVaultStakingProxy.address)) {
      await settingsProxy.setStakingTpl(tokenVaultStakingProxy.address);
      console.log('settingsProxy.setStakingTpl')
    }
    if ((await settingsProxy.governmentTpl() != tokenVaultGovernorProxy.address)) {
      await settingsProxy.setGovernmentTpl(tokenVaultGovernorProxy.address);
      console.log('settingsProxy.setGovernmentTpl')
    }
    if ((await settingsProxy.exchangeTpl() != tokenVaultExchangeProxy.address)) {
      await settingsProxy.setExchangeTpl(tokenVaultExchangeProxy.address);
      console.log('settingsProxy.setExchangeTpl')
    }
    if ((await settingsProxy.treasuryTpl() != tokenVaultTreasuryProxy.address)) {
      await settingsProxy.setTreasuryTpl(tokenVaultTreasuryProxy.address);
      console.log('settingsProxy.setTreasuryTpl')
    }
    if ((await settingsProxy.bnftTpl() != tokenVaultBnftProxy.address)) {
      await settingsProxy.setBnftTpl(tokenVaultBnftProxy.address);
      console.log('settingsProxy.setBnftTpl')
    }
  }
}