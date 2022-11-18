const fs = require('fs');

const verifyContract = require('./verify_contract.js');

const MockNFT = artifacts.require('MockNFT');

module.exports = async function (deployer, network) {
  let options = deployer.options.networks[network]
  if (options.migration) {
    let fileName = process.cwd() + '/migrations/deployed_' + network + '.json';
    let deployData = {}
    if (await fs.existsSync(fileName)) {
      let dataText = await fs.readFileSync(fileName)
      deployData = JSON.parse(dataText.toString())
    } else {
      await fs.writeFileSync(fileName, JSON.stringify(deployData))
    }
    // await deployer.deploy(MockNFT, 'BAYC', 'BoredApeYachtClub', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/');
    // let mockNFT = await MockNFT.deployed();
    // let mockNFT = await MockNFT.at('0x69bE4C79e0F9b6F43067b8C0EECF92538c558080');
    await verifyContract(
      deployData,
      config,
      'MockNFT',
      mockNFT.address,
      '',
    )
  }
};