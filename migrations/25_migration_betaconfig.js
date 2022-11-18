const fs = require('fs');
const Settings = artifacts.require("Settings");

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
    settingsProxy = await Settings.at(deployData['SettingsProxy']);

    if ((await settingsProxy.auctionLength()).toString() != '1800') {
      await settingsProxy.setAuctionLength(1800);
      console.log('settingsProxy.setAuctionLength(1800)')
    }
    if ((await settingsProxy.auctionExtendLength()).toString() != '600') {
      await settingsProxy.setAuctionExtendLength(600);
      console.log('settingsProxy.setAuctionExtendLength(600)')
    }
    if ((await settingsProxy.votingDelayBlock()).toString() != '10') {
      await settingsProxy.setVotingDelayBlock(10);
      console.log('settingsProxy.setVotingDelayBlock(10)')
    }
    if ((await settingsProxy.votingPeriodBlock()).toString() != '25') {
      await settingsProxy.setVotingPeriodBlock(25);
      console.log('settingsProxy.setVotingPeriodBlock(25)')
    }
    if ((await settingsProxy.term1Duration()).toString() != '600') {
      await settingsProxy.setTerm1Duration(600);
      console.log('settingsProxy.setTerm1Duration(600)')
    }
    if ((await settingsProxy.term2Duration()).toString() != '1200') {
      await settingsProxy.setTerm2Duration(1200);
      console.log('settingsProxy.setTerm2Duration(1200)')
    }
    if ((await settingsProxy.epochDuration()).toString() != '300') {
      await settingsProxy.setEpochDuration(300);
      console.log('settingsProxy.setEpochDuration(300)')
    }
    if ((await settingsProxy.feePercentage()).toString() != '8000') {
      await settingsProxy.setFeePercentage(8000);
      console.log('settingsProxy.setFeePercentage(8000)')
    }
    if ((await settingsProxy.minExitFactor()).toString() != '2000') {
      await settingsProxy.setMinExitFactor(2000);
      console.log('settingsProxy.setMinExitFactor(2000)')
    }
    if ((await settingsProxy.maxExitFactor()).toString() != '50000') {
      await settingsProxy.setMaxExitFactor(50000);
      console.log('settingsProxy.setMaxExitFactor(50000)')
    }
    if ((await settingsProxy.minBidIncrease()).toString() != '100') {
      await settingsProxy.setMinBidIncrease(100);
      console.log('settingsProxy.setMinBidIncrease(100)')
    }
    if ((await settingsProxy.minVotePercentage()).toString() != '2500') {
      await settingsProxy.setMinVotePercentage(2500);
      console.log('settingsProxy.setMinVotePercentage(2500)')
    }
    if ((await settingsProxy.reduceStep()).toString() != '500') {
      await settingsProxy.setReduceStep(500);
      console.log('settingsProxy.setReduceStep(500)')
    }
  }
}