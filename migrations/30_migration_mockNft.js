const fs = require('fs');
const verifyContract = require('./verify_contract.js');

const MockNFT = artifacts.require("MockNFT");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
    // await deployer.deploy(MockNFT, 'BoredApeYachtClub', 'BAYC', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/');
    // let mockNFT = await MockNFT.deployed();
    // await sleep(20000);
    await verifyContract(
      deployData,
      config,
      'MockNFT',
      '0xe275a4C7A9b6f9164ae8813138aa03A715787374',
      '',
    )
  }
};