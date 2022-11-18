const fs = require('fs');

const TokenVault = artifacts.require("TokenVault");
const TokenVaultStaking = artifacts.require("TokenVaultStaking");
const TokenVaultGovernor = artifacts.require("TokenVaultGovernor");
const TokenVaultLogic = artifacts.require("TokenVaultLogic");
const TokenVaultTreasuryLogic = artifacts.require("TokenVaultTreasuryLogic");
const TokenVaultStakingLogic = artifacts.require("TokenVaultStakingLogic");
const TokenVaultGovernorLogic = artifacts.require("TokenVaultGovernorLogic");
const TokenVaultExchangeLogic = artifacts.require("TokenVaultExchangeLogic");

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
    let tokenVaultTreasuryLogic;
    {
      if (deployData['TokenVaultTreasuryLogic'] == undefined || deployData['TokenVaultTreasuryLogic'] == '') {
        await deployer.deploy(TokenVaultTreasuryLogic);
        tokenVaultTreasuryLogic = await TokenVaultTreasuryLogic.deployed();
        {
          deployData['TokenVaultTreasuryLogic'] = tokenVaultTreasuryLogic.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultTreasuryLogic = await TokenVaultTreasuryLogic.at(deployData['TokenVaultTreasuryLogic']);
      await deployer.link(tokenVaultTreasuryLogic, TokenVault);
      await deployer.link(tokenVaultTreasuryLogic, TokenVaultLogic);
    }
    // 
    let tokenVaultLogic;
    {
      if (deployData['TokenVaultLogic'] == undefined || deployData['TokenVaultLogic'] == '') {
        await deployer.deploy(TokenVaultLogic);
        tokenVaultLogic = await TokenVaultLogic.deployed();
        {
          deployData['TokenVaultLogic'] = tokenVaultLogic.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultLogic = await TokenVaultLogic.at(deployData['TokenVaultLogic']);
      await deployer.link(tokenVaultLogic, TokenVault);
      await deployer.link(tokenVaultLogic, TokenVaultGovernor);
    }
    // 
    let tokenVaultStakingLogic;
    {
      if (deployData['TokenVaultStakingLogic'] == undefined || deployData['TokenVaultStakingLogic'] == '') {
        await deployer.deploy(TokenVaultStakingLogic);
        tokenVaultStakingLogic = await TokenVaultStakingLogic.deployed();
        {
          deployData['TokenVaultStakingLogic'] = tokenVaultStakingLogic.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultStakingLogic = await TokenVaultStakingLogic.at(deployData['TokenVaultStakingLogic']);
      await deployer.link(tokenVaultStakingLogic, TokenVault);
      await deployer.link(tokenVaultStakingLogic, TokenVaultStaking);
    }
    // 
    let tokenVaultGovernorLogic;
    {
      if (deployData['TokenVaultGovernorLogic'] == undefined || deployData['TokenVaultGovernorLogic'] == '') {
        await deployer.deploy(TokenVaultGovernorLogic);
        tokenVaultGovernorLogic = await TokenVaultGovernorLogic.deployed();
        {
          deployData['TokenVaultGovernorLogic'] = tokenVaultGovernorLogic.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultGovernorLogic = await TokenVaultGovernorLogic.at(deployData['TokenVaultGovernorLogic']);
      await deployer.link(tokenVaultGovernorLogic, TokenVault);
      await deployer.link(tokenVaultGovernorLogic, TokenVaultGovernor);
    }
    // 
    let tokenVaultExchangeLogic;
    {
      if (deployData['TokenVaultExchangeLogic'] == undefined || deployData['TokenVaultExchangeLogic'] == '') {
        await deployer.deploy(TokenVaultExchangeLogic);
        tokenVaultExchangeLogic = await TokenVaultExchangeLogic.deployed();
        {
          deployData['TokenVaultExchangeLogic'] = tokenVaultExchangeLogic.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      }
      tokenVaultExchangeLogic = await TokenVaultExchangeLogic.at(deployData['TokenVaultExchangeLogic']);
      await deployer.link(tokenVaultExchangeLogic, TokenVault);
    }
  }
};