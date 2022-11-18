
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
const TokenVaultTreasury = artifacts.require("TokenVaultTreasury");
const TokenVaultStaking = artifacts.require("TokenVaultStaking");
const TokenVaultGovernor = artifacts.require("TokenVaultGovernor");
const TokenVaultExchange = artifacts.require("TokenVaultExchange");
const TokenVaultPresale = artifacts.require("TokenVaultPresale");
const TokenVaultBnft = artifacts.require("TokenVaultBnft");


const TokenVaultProxy = artifacts.require("TokenVaultProxy");
const TokenVaultTreasuryProxy = artifacts.require("TokenVaultTreasuryProxy");
const TokenVaultStakingProxy = artifacts.require("TokenVaultStakingProxy");
const TokenVaultGovernorProxy = artifacts.require("TokenVaultGovernorProxy");
const TokenVaultExchangeProxy = artifacts.require("TokenVaultExchangeProxy");
const TokenVaultBnftProxy = artifacts.require("TokenVaultBnftProxy");
const MockGovernor = artifacts.require("MockGovernor");
const truffleAssert = require('truffle-assertions');
const MockAirdropERC20 = artifacts.require("MockAirdropERC20");
const MockWETH = artifacts.require("MockWETH");
var BN = web3.utils.BN;


/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */


contract("Mint", function (accounts) {


  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function waitAndEvmMine(ms) {
    await sleep(ms)
    await evmMine();
  }

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

  let vaultFactory;
  let settings;
  let weth;
  let tokenVaultPresale;
  let mockGovernor;
  let testERC721;
  let testERC721A;
  let testERC721B;

  beforeEach('setup contract', async () => {
    let proxyAdmin = await ProxyAdmin.new({ from: accounts[0] });

    weth = await MockWETH.new();

    settings = await Settings.new();
    settings = await TransparentUpgradeableProxy.new(
      settings.address,
      proxyAdmin.address,
      settings.contract.methods.initialize(weth.address).encodeABI()
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

    let tokenVaultBnft = await TokenVaultBnft.new(settings.address);
    await settings.setBnftImpl(tokenVaultBnft.address);

    // for proxy
    let tokenVaultProxy = await TokenVaultProxy.new(settings.address);
    await settings.setVaultTpl(tokenVaultProxy.address);

    let tokenVaultTreasuryProxy = await TokenVaultTreasuryProxy.new(settings.address);
    await settings.setTreasuryTpl(tokenVaultTreasuryProxy.address);

    let tokenVaultStakingProxy = await TokenVaultStakingProxy.new(settings.address);
    await settings.setStakingTpl(tokenVaultStakingProxy.address);

    let tokenVaultGovernorProxy = await TokenVaultGovernorProxy.new(settings.address);
    await settings.setGovernmentTpl(tokenVaultGovernorProxy.address);

    let tokenVaultExchangeProxy = await TokenVaultExchangeProxy.new(settings.address);
    await settings.setExchangeTpl(tokenVaultExchangeProxy.address);

    let tokenVaultBnftProxy = await TokenVaultBnftProxy.new(settings.address);
    await settings.setBnftTpl(tokenVaultBnftProxy.address);

    vaultFactory = await VaultFactory.new(settings.address);
    vaultFactory = await TransparentUpgradeableProxy.new(
      vaultFactory.address,
      proxyAdmin.address,
      vaultFactory.contract.methods.initialize().encodeABI(),
    );
    vaultFactory = await VaultFactory.at(vaultFactory.address);

    tokenVaultPresale = await TokenVaultPresale.new(settings.address);
    tokenVaultPresale = await TransparentUpgradeableProxy.new(
      tokenVaultPresale.address,
      proxyAdmin.address,
      tokenVaultPresale.contract.methods.initialize().encodeABI(),
    );
    tokenVaultPresale = await TokenVaultPresale.at(tokenVaultPresale.address);

    await settings.setAuctionLength(1800);
    await settings.setAuctionExtendLength(600);
    await settings.setVotingDelayBlock(10);
    await settings.setVotingPeriodBlock(25);
    await settings.setTerm1Duration(6);
    await settings.setTerm2Duration(12);
    await settings.setEpochDuration(2);
    testERC721 = await TestERC721.new('XXX', 'XXX');
    testERC721A = await TestERC721.new('YYY', 'YYY');
    testERC721B = await TestERC721.new('ZZZ', 'ZZ');
    mockGovernor = await MockGovernor.new();
    testERC721.mint(accounts[0], '1', '');
    testERC721.mint(accounts[0], '2', '');

    testERC721A.mint(accounts[0], '1', '');
    testERC721A.mint(accounts[0], '2', '');



    await testERC721.setApprovalForAll(vaultFactory.address, true);
    await testERC721A.setApprovalForAll(vaultFactory.address, true);
    settings.setGovernorSetting(testERC721.address, mockGovernor.address, 5, 5);
    await testERC721.setApprovalForAll(vaultFactory.address, true);

  });



  it(" min staking vetoken nft govern ", async function () {

    // mint contract has 1 or many has same Governor sucess
    await vaultFactory.mint('XXX', 'XXX', [testERC721.address, testERC721.address], ['1', '2'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0.2', 'ether'), web3.utils.toWei('0.3', 'ether'), 0);

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    rs = await tokenVault.treasury();
    let tokenVaultTreasury = await TokenVaultTreasury.at(rs);

    rs = await tokenVault.staking();
    let tokenVaultStaking = await TokenVaultStaking.at(rs);

    rs = await tokenVault.government();

    let tokenVaultGovernor = await TokenVaultGovernor.at(rs);

    // check vault information
    assert.equal(await tokenVault.balanceOf(accounts[0]), web3.utils.toWei('0.8', 'ether'));
    assert.equal(await tokenVault.balanceOf(tokenVaultTreasury.address), web3.utils.toWei('0.19', 'ether'));
    assert.equal(await tokenVaultStaking.balanceOf(tokenVaultTreasury.address), web3.utils.toWei('0.01', 'ether'));
    assert.equal(await tokenVault.nftGovernor(), mockGovernor.address);
    assert.equal(await tokenVault.listTokens(0), testERC721.address);
    assert.equal(await tokenVault.listIds(0), 1);
    assert.equal(await tokenVault.listTokens(1), testERC721.address);
    assert.equal(await tokenVault.listIds(1), 2);
    assert.equal(await tokenVault.votingTokens(), web3.utils.toWei('0.8', 'ether'));
    assert.equal(await tokenVault.exitPrice(), web3.utils.toWei('0.3', 'ether'));
    assert.equal(tokenVault.address, await testERC721.ownerOf(1));
    assert.equal(tokenVault.address, await testERC721.ownerOf(2));

    await truffleAssert.reverts(
      tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('0.15', 'ether'), { from: accounts[1] }),
    );

    assert.equal(await tokenVaultStaking.balanceOf(accounts[0]), web3.utils.toWei('0', 'ether'));

    console.log('tokenVaultStaking.balanceOf-account0', (await tokenVaultStaking.balanceOf(accounts[0])).toString());

    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('0.15', 'ether'));
    assert.equal(await tokenVaultStaking.balanceOf(accounts[0]), web3.utils.toWei('0.15', 'ether'));

    console.log('tokenVaultStaking.balanceOf-account0', (await tokenVaultStaking.balanceOf(accounts[0])).toString());

    await truffleAssert.reverts(
      tokenVaultStaking.redeemFToken(web3.utils.toWei('0.5', 'ether')),
    );

    await truffleAssert.reverts(
      tokenVaultStaking.transfer(accounts[1], web3.utils.toWei('0.1', 'ether'), { from: accounts[0] }),
    );

    await tokenVaultStaking.redeemFToken(web3.utils.toWei('0.001', 'ether'));
    assert.equal(await tokenVaultStaking.balanceOf(accounts[0]), web3.utils.toWei('0.149', 'ether'));
    console.log('tokenVaultStaking.balanceOf-account0', (await tokenVaultStaking.balanceOf(accounts[0])).toString());


    let callData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'stakingInitialize',
        type: 'function',
        inputs: [{
          type: 'uint256',
          name: '_stakingLength'
        }]
      },
      [
        365 * 24 * 60 * 60
      ]
    );

    // not delegate cannot create proposal
    await truffleAssert.reverts(
      tokenVaultGovernor.propose(
        [tokenVault.address],
        [0],
        [callData],
        "test"
      ),
    );
    console.log("Not delegate  not has threadshold to create proposal");
    await tokenVaultStaking.delegate(accounts[0]);

    rs = await tokenVaultGovernor.propose(
      [tokenVault.address],
      [0],
      [callData],
      "test"
    );

    let proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args;
    console.log(" delegate has threadshold to create proposal" + proposalEvent.proposalId.toString());


    // console.log("proposalEvent.proposalId"+proposalEvent.proposalId.toString());

    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    rs = await tokenVaultGovernor.castVote(proposalEvent.proposalId, 1);

    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    //staking not enable
    await truffleAssert.reverts(
      tokenVaultStaking.deposit('1000', '1'),
    );

    let sh3data = web3.utils.soliditySha3(proposalEvent.description);
    assert.equal(await tokenVault.stakingPoolEnabled(), false);


    rs = await tokenVaultGovernor.execute(
      proposalEvent.targets,
      proposalEvent.values,
      proposalEvent.calldatas,
      sh3data
    );


    assert.equal(await tokenVault.stakingPoolEnabled(), true);

    rs = await tokenVaultStaking.deposit('1000', '1');
    assert.equal(await tokenVaultStaking.poolBalances(1), 1000);
    rs = await tokenVaultStaking.deposit('1500', '2');
    assert.equal(await tokenVaultStaking.poolBalances(2), 1500);
    // deposit invalid pool
    await truffleAssert.reverts(
      tokenVaultStaking.deposit('1000', '3'),
    );

    rs = await tokenVaultGovernor.propose(
      [tokenVault.address],
      [0],
      [callData],
      "test1"
    );

    proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args;


    // console.log("proposalEvent.proposalId"+proposalEvent.proposalId.toString());

    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    rs = await tokenVaultGovernor.castVote(proposalEvent.proposalId, 0);

    for (i = 0; i < 6; i++) {
      await evmMine();
    }


    sh3data = web3.utils.soliditySha3(proposalEvent.description);

    //revert excute proposal not sucess
    await truffleAssert.reverts(
      tokenVaultGovernor.execute(
        proposalEvent.targets,
        proposalEvent.values,
        proposalEvent.calldatas,
        sh3data
      ),
    );


    // await tokenVault.redeem({ from: accounts[0] });

    // console.log('tokenVault.balanceOf-tokenVaultTreasury', (await tokenVault.balanceOf(tokenVaultTreasury.address)).toString())
    // console.log('tokenVaultStaking.balanceOf-tokenVaultTreasury', (await tokenVaultStaking.balanceOf(tokenVaultTreasury.address)).toString())

    rs = await tokenVaultTreasury.createNftGovernorVoteFor('2', { from: accounts[0] });
    // console.log(rs);

    proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args;

    // sleep(5000);
    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    rs = await tokenVaultGovernor.castVote(proposalEvent.proposalId, 0);

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



    assert.equal(await mockGovernor.castVotes("2"), 0);
    assert.equal(await mockGovernor.castVoteChecks("2"), true);


    rs = await tokenVaultTreasury.createNftGovernorVoteFor('3', { from: accounts[0] });
    // console.log(rs);

    proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args;

    // sleep(5000);
    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    rs = await tokenVaultGovernor.castVote(proposalEvent.proposalId, 1);

    for (i = 0; i < 6; i++) {
      await evmMine();
    }


    sh3data = web3.utils.soliditySha3(proposalEvent.description);
    rs = await tokenVaultGovernor.execute(
      proposalEvent.targets,
      proposalEvent.values,
      proposalEvent.calldatas,
      sh3data
    );


    assert.equal(await mockGovernor.castVotes("3"), 1);
    assert.equal(await mockGovernor.castVoteChecks("3"), true);


    rs = await tokenVaultTreasury.createNftGovernorVoteFor('1', { from: accounts[0] });
    // console.log(rs);

    proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args
    //console.log(proposalEvent);

    sleep(5000);

    rs = await tokenVaultGovernor.cancelNftProposal(
      proposalEvent.targets,
      proposalEvent.values,
      proposalEvent.calldatas,
      proposalEvent.description
    );

    assert.equal(await tokenVaultGovernor.state(proposalEvent.proposalId), 2);

  });


});