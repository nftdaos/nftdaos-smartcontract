const fs = require('fs');

const ProxyAdmin = artifacts.require('ProxyAdmin');

const MockWETH = artifacts.require("MockWETH");

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
    if (deployData['WETH'] == undefined || deployData['WETH'] == '') {
      if (network == 'local') {
        await deployer.deploy(MockWETH);
        let mockWETH = await MockWETH.deployed();
        deployData['WETH'] = mockWETH.address
        await fs.writeFileSync(fileName, JSON.stringify(deployData))
      }
    }
    // 
    let proxyAdmin;
    {
      if (deployData['ProxyAdmin'] == undefined || deployData['ProxyAdmin'] == '') {
        await deployer.deploy(ProxyAdmin);
        proxyAdmin = await ProxyAdmin.deployed();
        {
          deployData['ProxyAdmin'] = proxyAdmin.address;
          await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
      } else {
        proxyAdmin = await ProxyAdmin.at(deployData['ProxyAdmin']);
      }
    }
  }
};