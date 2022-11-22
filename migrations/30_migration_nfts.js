const fs = require('fs');

const verifyContract = require('./verify_contract.js');

const MockNFT = artifacts.require('MockNFT');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

    //   {
    //     "Address": "0x6ea3dB82352C06c0904D62e5c483fdD6D51333D2",
    //     "Symbol": "MAYC",
    //     "Name": "MutantApeYachtClub",
    //     "Total": 0,
    //     "BaseURI": "https://boredapeyachtclub.com/api/mutants/",
    //     "Finished": true
    // },

    // await deployer.deploy(MockNFT, 'BAYC', 'BoredApeYachtClub', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/');
    // await deployer.deploy(MockNFT, 'MAYC', 'MutantApeYachtClub', 'https://boredapeyachtclub.com/api/mutants/');
    // let mockNFT = await MockNFT.deployed();
    let mockNFT = await MockNFT.at('0xa9a977715e46Ea4B0dA6A67509B76cC3EF42b2F8');
    await sleep(20000)
    await verifyContract(
      deployData,
      config,
      'MockNFT',
      mockNFT.address,
      '',
    )
  }
};