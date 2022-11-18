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
    await verifyContract(
      deployData,
      config,
      'ProxyAdmin',
      deployData['ProxyAdmin'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'Settings',
      deployData['Settings'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'Settings',
      deployData['SettingsProxy'],
      'TransparentUpgradeableProxy',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultLogic',
      deployData['TokenVaultLogic'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultTreasuryLogic',
      deployData['TokenVaultTreasuryLogic'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultStakingLogic',
      deployData['TokenVaultStakingLogic'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultGovernorLogic',
      deployData['TokenVaultGovernorLogic'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultExchangeLogic',
      deployData['TokenVaultExchangeLogic'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'VaultFactory',
      deployData['VaultFactory'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'VaultFactory',
      deployData['VaultFactoryProxy'],
      'TransparentUpgradeableProxy',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVault',
      deployData['TokenVault'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultTreasury',
      deployData['TokenVaultTreasury'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultStaking',
      deployData['TokenVaultStaking'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultGovernor',
      deployData['TokenVaultGovernor'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultExchange',
      deployData['TokenVaultExchange'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultBnft',
      deployData['TokenVaultBnft'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultProxy',
      deployData['TokenVaultProxy'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultTreasuryProxy',
      deployData['TokenVaultTreasuryProxy'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultStakingProxy',
      deployData['TokenVaultStakingProxy'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultGovernorProxy',
      deployData['TokenVaultGovernorProxy'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultExchangeProxy',
      deployData['TokenVaultExchangeProxy'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultBnftProxy',
      deployData['TokenVaultBnftProxy'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultPresale',
      deployData['TokenVaultPresale'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenVaultPresale',
      deployData['TokenVaultPresaleProxy'],
      'TransparentUpgradeableProxy',
    )
    await verifyContract(
      deployData,
      config,
      'TokenBatchTransfer',
      deployData['TokenBatchTransfer'],
      '',
    )
    await verifyContract(
      deployData,
      config,
      'TokenBatchTransfer',
      deployData['TokenBatchTransferProxy'],
      'TransparentUpgradeableProxy',
    )
  }
};