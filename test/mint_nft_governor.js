const ProxyAdmin = artifacts.require('ProxyAdmin');
const TransparentUpgradeableProxy = artifacts.require('TransparentUpgradeableProxy');
const TestERC20 = artifacts.require("TestERC20");
const TestERC721 = artifacts.require("TestERC721");
const IWETH = artifacts.require("IWETH");
const Settings = artifacts.require("Settings");
const TokenVaultLogic = artifacts.require("TokenVaultLogic");
const TokenVaultTreasuryLogic = artifacts.require("TokenVaultTreasuryLogic");
const TokenVaultStakingLogic = artifacts.require("TokenVaultStakingLogic");
const TokenVaultGovernorLogic = artifacts.require("TokenVaultGovernorLogic");
const TokenVaultExchangeLogic = artifacts.require("TokenVaultExchangeLogic");
const VaultFactory = artifacts.require("VaultFactory");
const TokenVault = artifacts.require("TokenVault");
const TokenVaultProxy = artifacts.require("TokenVaultProxy");
const TokenVaultTreasury = artifacts.require("TokenVaultTreasury");
const TokenVaultStaking = artifacts.require("TokenVaultStaking");
const TokenVaultGovernor = artifacts.require("TokenVaultGovernor");
const TokenVaultExchange = artifacts.require("TokenVaultExchange");

const MockGovernor = artifacts.require("MockGovernor");
const MockWETH = artifacts.require("MockWETH");



const config = require('./config');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("Mint", function (accounts) {

  let vaultFactory;
  let settings;
  let weth;

  beforeEach('setup contract', async () => {
    // console.log(ProxyAdmin.decodeLogs)
    let proxyAdmin = await ProxyAdmin.new({ from: accounts[0] });

    weth = await MockWETH.new();

    settings = await Settings.new();
    let initializeData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'initialize',
        type: 'function',
        inputs: [{
          type: 'address',
          name: '_weth'
        }
        ]
      },
      [weth.address]
    );

    settings = await TransparentUpgradeableProxy.new(
      settings.address,
      proxyAdmin.address,
      initializeData,
    );

    settings = await Settings.at(settings.address);

    const tokenVaultLogic = await TokenVaultLogic.new();
    await TokenVault.link("TokenVaultLogic", tokenVaultLogic.address);
    await TokenVaultGovernor.link("TokenVaultLogic", tokenVaultLogic.address);

    const tokenVaultTreasuryLogic = await TokenVaultTreasuryLogic.new();
    await TokenVault.link("TokenVaultTreasuryLogic", tokenVaultTreasuryLogic.address);

    const tokenVaultStakingLogic = await TokenVaultStakingLogic.new();
    await TokenVault.link("TokenVaultStakingLogic", tokenVaultStakingLogic.address);

    const tokenVaultGovermentLogic = await TokenVaultGovernorLogic.new();
    await TokenVault.link("TokenVaultGovernorLogic", tokenVaultGovermentLogic.address);
    await TokenVaultGovernor.link("TokenVaultGovernorLogic", tokenVaultGovermentLogic.address);

    const tokenVaultExchangeLogic = await TokenVaultExchangeLogic.new();
    await TokenVault.link("TokenVaultExchangeLogic", tokenVaultExchangeLogic.address);

    let tokenVault = await TokenVault.new(settings.address);
    await settings.setVaultImpl(tokenVault.address);

    let tokenVaultTreasury = await TokenVaultTreasury.new(settings.address);
    await settings.setTreasuryImpl(tokenVaultTreasury.address);

    await TokenVaultStaking.link("TokenVaultStakingLogic", tokenVaultStakingLogic.address);
    let tokenVaultStaking = await TokenVaultStaking.new(settings.address);
    await settings.setStakingImpl(tokenVaultStaking.address);

    let tokenVaultGovernor = await TokenVaultGovernor.new(settings.address);
    await settings.setGovernmentImpl(tokenVaultGovernor.address);

    let tokenVaultExchange = await TokenVaultExchange.new(settings.address);
    await settings.setExchangeImpl(tokenVaultExchange.address);

    vaultFactory = await VaultFactory.new(settings.address);
    initializeData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'initialize',
        type: 'function',
        inputs: []
      },
      []
    );
    vaultFactory = await TransparentUpgradeableProxy.new(
      vaultFactory.address,
      proxyAdmin.address,
      initializeData,
    );
    vaultFactory = await VaultFactory.at(vaultFactory.address);
  })

  it("mint vault sucessful", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');
    let mockGovernor = await MockGovernor.new();

    testERC721.mint(accounts[0], '1', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    settings.setGovernorSetting(testERC721.address, mockGovernor.address, 5, 5);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    rs = await tokenVault.treasury();
    let tokenVaultTreasury = await TokenVaultTreasury.at(rs);

    rs = await tokenVault.staking();
    let tokenVaultStaking = await TokenVaultStaking.at(rs);

    rs = await tokenVault.government();
    let tokenVaultGovernor = await TokenVaultGovernor.at(rs);

    // console.log('tokenVaultGovernor.votingDelay', (await tokenVaultGovernor.votingDelay()).toString())
    // console.log('tokenVaultGovernor.votingPeriod', (await tokenVaultGovernor.votingPeriod()).toString())

    await tokenVault.approve(tokenVaultStaking.address, web3.utils.toWei('900000', 'ether'));

    console.log('tokenVaultStaking.balanceOf-account0', (await tokenVaultStaking.balanceOf(accounts[0])).toString())

    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('900000', 'ether'));

    await tokenVaultStaking.delegate(accounts[0])

    console.log('tokenVault.nftGovernor', (await tokenVault.nftGovernor()).toString())

    console.log('tokenVaultStaking.balanceOf-tokenVaultTreasury', (await tokenVaultStaking.balanceOf(tokenVaultTreasury.address)).toString())
    console.log('tokenVaultStaking.balanceOf-tokenVaultStaking', (await tokenVaultStaking.balanceOf(tokenVaultStaking.address)).toString())
    console.log('tokenVaultStaking.balanceOf-account0', (await tokenVaultStaking.balanceOf(accounts[0])).toString())

    // await tokenVault.redeem({ from: accounts[0] });

    // console.log('tokenVault.balanceOf-tokenVaultTreasury', (await tokenVault.balanceOf(tokenVaultTreasury.address)).toString())
    // console.log('tokenVaultStaking.balanceOf-tokenVaultTreasury', (await tokenVaultStaking.balanceOf(tokenVaultTreasury.address)).toString())

    rs = await tokenVaultTreasury.createNftGovernorVoteFor('1', { from: accounts[0] });
    // console.log(rs);

    let proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args
    console.log(proposalEvent);

    // sleep(5000);
    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    rs = await tokenVaultGovernor.castVote(proposalEvent.proposalId, 0)

    for (i = 0; i < 6; i++) {
      await evmMine();
    }
    // // 
    rs = await tokenVault.proposalExecuteWhenDefeated(
      proposalEvent.targets,
      proposalEvent.values,
      proposalEvent.calldatas,
      proposalEvent.description
    );

    console.log('mockGovernor.castVotes', (await mockGovernor.castVotes('1')).toString())
    console.log('mockGovernor.castVoteChecks', (await mockGovernor.castVoteChecks('1')).toString())

    return assert.isTrue(true);
  });
});


function evmMine() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_mine",
      id: new Date().getTime()
    }, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
};