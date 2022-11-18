
const ProxyAdmin = artifacts.require('ProxyAdmin');
const TransparentUpgradeableProxy = artifacts.require('TransparentUpgradeableProxy');
const TestERC20 = artifacts.require("TestERC20");
const TestERC721 = artifacts.require("TestERC721");
const TestERC1155 = artifacts.require("TestERC1155");
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
   let testERC7211;

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
    await settings.setVotingDelayBlock(5);
    await settings.setVotingPeriodBlock(5);
    await settings.setTerm1Duration(6);
    await settings.setTerm2Duration(12);
    await settings.setEpochDuration(2);
     testERC721 = await TestERC721.new('XXX', 'XXX');
     testERC7211 = await TestERC721.new('YYY', 'YYY');
      mockGovernor = await MockGovernor.new();
      testERC721.mint(accounts[0], '1', '');
    testERC721.mint(accounts[0], '2', '');
    testERC721.mint(accounts[0], '3', '');
    testERC721.mint(accounts[0], '4', '');

     await testERC721.setApprovalForAll(vaultFactory.address, true);
    await testERC7211.setApprovalForAll(vaultFactory.address, true);
    await testERC721.setApprovalForAll(vaultFactory.address, true);




  });




  it("Attack ERC721", async function () {
    //

      await vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['2'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 7);
     // await vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['2'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 7);

     let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    rs = await tokenVault.treasury();
    let tokenVaultTreasury = await TokenVaultTreasury.at(rs);

    rs = await tokenVault.staking();
    let tokenVaultStaking = await TokenVaultStaking.at(rs);

    rs = await tokenVault.government();

    let tokenVaultGovernor = await TokenVaultGovernor.at(rs);


    let testERC721New = await TestERC721.new('XXX', 'XXX');
    await testERC721New.mint(tokenVault.address, '1', '');

    console.log(
      'before',
      tokenVault.address,
      accounts[0],
      (await testERC721New.ownerOf('1')).toString(),
    )

    let callData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'approve',
        type: 'function',
        inputs: [{
          type: 'address',
          name: 'to'
        }, {
          type: 'uint256',
          name: 'tokenId'
        }
        ]
      },
      [
        accounts[1],
        '2'
      ]
    );


   let pscalldata = web3.eth.abi.encodeFunctionCall(
      {
        name: 'proposalTargetCall',
        type: 'function',
        inputs: [{
          type: 'address',
          name: 'target'
        }, {
          type: 'uint256',
          name: 'value'
        }, {
          type: 'bytes',
          name: 'data'
        }
        ]
      },
      [
        testERC721.address,
        0,
       callData
      ]
    );

   console.log("await tokenVaultStaking.getVotes(accounts[0]) 1" + (await tokenVaultStaking.getVotes(accounts[0])).toString());
    console.log(" tokenVaultStaking.address 1"+tokenVaultStaking.address.toString());
    console.log(" tokenVault.address 1"+tokenVault.address.toString());
    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('0.8', 'ether'));
    await tokenVaultStaking.delegate(accounts[0]);

   rs = await tokenVaultGovernor.propose(
      [tokenVault.address],
      [0],
      [pscalldata],
      "test120"
    );

     let proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args;



    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    rs = await tokenVaultGovernor.castVote(proposalEvent.proposalId, 1);

    for (i = 0; i < 6; i++) {
      await evmMine();
    }

    let sh3data = web3.utils.soliditySha3(proposalEvent.description);
    assert.equal(await tokenVault.stakingPoolEnabled(), false);


    rs = await tokenVaultGovernor.execute(
      proposalEvent.targets,
      proposalEvent.values,
      proposalEvent.calldatas,
      sh3data
    );

    console.log('await testERC721.getApproved(2)'+ (await testERC721.getApproved(2)).toString());
    console.log( "accounts[1].toString()" +  accounts[1].toString());

    assert.equal((await testERC721.getApproved(2)).toString(),  accounts[1].toString());






     //assert.equal((await testERC721.ownerOf('2')).toString(),  accounts[0].toString());

    /*

     await testERC721.approve(accounts[1], "1");
     await testERC721.transferFrom(accounts[0],accounts[1],'1',{from: accounts[1]});
     assert.equal((await testERC721.ownerOf('1')).toString(),  accounts[1].toString());

     */


    return assert.isTrue(true);
  });






});