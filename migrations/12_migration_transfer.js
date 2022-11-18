const fs = require('fs');

const ProxyAdmin = artifacts.require('ProxyAdmin');
const TransparentUpgradeableProxy = artifacts.require('TransparentUpgradeableProxy');
const TokenBatchTransfer = artifacts.require("TokenBatchTransfer");

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
    // 
    let tokenBatchTransfer;
    let tokenBatchTransferUpdated = false;
    {
      if (deployData['TokenBatchTransfer'] == undefined || deployData['TokenBatchTransfer'] == '') {
        await deployer.deploy(TokenBatchTransfer,);
        tokenBatchTransfer = await TokenBatchTransfer.deployed();
        {
          deployData['TokenBatchTransfer'] = tokenBatchTransfer.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          tokenBatchTransferUpdated = true;
        }
      }
      tokenBatchTransfer = await TokenBatchTransfer.at(deployData['TokenBatchTransfer']);
    }
    // 
    let tokenBatchTransferProxy;
    {
      if (deployData['TokenBatchTransferProxy'] == undefined || deployData['TokenBatchTransferProxy'] == '') {
        let initializeData = tokenBatchTransfer.contract.methods.initialize().encodeABI();
        await deployer.deploy(
          TransparentUpgradeableProxy,
          tokenBatchTransfer.address,
          proxyAdmin.address,
          initializeData
        );
        tokenBatchTransferProxy = await TransparentUpgradeableProxy.deployed();
        {
          deployData['TokenBatchTransferProxy'] = tokenBatchTransferProxy.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
          tokenBatchTransferUpdated = false;
        }
      }
      tokenBatchTransferProxy = await TokenBatchTransfer.at(deployData['TokenBatchTransferProxy']);
      if (tokenBatchTransferUpdated) {
        await proxyAdmin.upgrade(tokenBatchTransferProxy.address, tokenBatchTransfer.address)
        console.log('tokenBatchTransfer proxyAdmin.upgrade()', tokenBatchTransferProxy.address, tokenBatchTransfer.address)
      }
    }
  }
};