const fs = require('fs');
const verifyContract = require('./verify_contract.js');

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
    // console
    console.log('truffle run verify ProxyAdmin@' + deployData['ProxyAdmin'] + ' --network ' + network)
    console.log('truffle run verify Settings@' + deployData['Settings'] + ' --network ' + network)
    console.log('truffle run verify Settings@' + deployData['SettingsProxy'] + ' --custom-proxy TransparentUpgradeableProxy --network ' + network)
    console.log('truffle run verify TokenVaultTreasuryLogic@' + deployData['TokenVaultTreasuryLogic'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultStakingLogic@' + deployData['TokenVaultStakingLogic'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultGovernorLogic@' + deployData['TokenVaultGovernorLogic'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultExchangeLogic@' + deployData['TokenVaultExchangeLogic'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultLogic@' + deployData['TokenVaultLogic'] + ' --network ' + network)
    console.log('truffle run verify TokenVault@' + deployData['TokenVault'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultStaking@' + deployData['TokenVaultStaking'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultTreasury@' + deployData['TokenVaultTreasury'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultGovernor@' + deployData['TokenVaultGovernor'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultExchange@' + deployData['TokenVaultExchange'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultBnft@' + deployData['TokenVaultBnft'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultProxy@' + deployData['TokenVaultProxy'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultStakingProxy@' + deployData['TokenVaultStakingProxy'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultTreasuryProxy@' + deployData['TokenVaultTreasuryProxy'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultGovernorProxy@' + deployData['TokenVaultGovernorProxy'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultExchangeProxy@' + deployData['TokenVaultExchangeProxy'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultBnftProxy@' + deployData['TokenVaultBnftProxy'] + ' --network ' + network)
    console.log('truffle run verify VaultFactory@' + deployData['VaultFactory'] + ' --network ' + network)
    console.log('truffle run verify VaultFactory@' + deployData['VaultFactoryProxy'] + ' --custom-proxy TransparentUpgradeableProxy --network ' + network)
    console.log('truffle run verify TokenVaultPresale@' + deployData['TokenVaultPresale'] + ' --network ' + network)
    console.log('truffle run verify TokenVaultPresale@' + deployData['TokenVaultPresaleProxy'] + ' --custom-proxy TransparentUpgradeableProxy --network ' + network)
    console.log('truffle run verify TokenBatchTransfer@' + deployData['TokenBatchTransfer'] + ' --network ' + network)
    console.log('truffle run verify TokenBatchTransfer@' + deployData['TokenBatchTransferProxy'] + ' --custom-proxy TransparentUpgradeableProxy --network ' + network)
  }
};