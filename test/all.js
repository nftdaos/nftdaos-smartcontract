
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
    await settings.setVotingDelayBlock(10);
    await settings.setVotingPeriodBlock(25);
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
    testERC721.mint(accounts[0], '5', '');
     testERC721.mint(accounts[0], '6', '');
      testERC721.mint(accounts[0], '7', '');
      testERC721.mint(accounts[0], '8', '');
       testERC721.mint(accounts[0], '9', '');

    testERC7211.mint(accounts[0], '1', '');
    testERC7211.mint(accounts[0], '2', '');
    testERC7211.mint(accounts[0], '3', '');
    testERC7211.mint(accounts[0], '4', '');
    testERC7211.mint(accounts[0], '5', '');
    testERC7211.mint(accounts[0], '6', '');
     testERC7211.mint(accounts[0], '7', '');

     await testERC721.setApprovalForAll(vaultFactory.address, true);
    await testERC7211.setApprovalForAll(vaultFactory.address, true);
    settings.setGovernorSetting(testERC721.address, mockGovernor.address, 5, 5);

  });

  it("mint vault amount params.listprice = 0 fail", async function () {
    await truffleAssert.reverts(
       vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['3'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), 0, 20),
  );


    });


   it("mint vault amount params.supply = 0 fail", async function () {

    await truffleAssert.reverts(
       vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['3'],0, 0, web3.utils.toWei('100000', 'ether'), 20),
  );

    });

     it("mint vault treasury balance(params.supply * 50) / 100 >= params.treasuryBalance) fail", async function () {

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await truffleAssert.reverts(
       vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['3'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('2', 'ether'), web3.utils.toWei('1', 'ether'), web3.utils.toWei('2', 'ether'))
,
  );
      });


       it("check noun treasury = 0 fail", async function () {
       await settings.setGovernorSetting(testERC721.address, testERC721.address, 5, 5);
       await testERC721.setApprovalForAll(vaultFactory.address, true);

      await truffleAssert.reverts(
     vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['3'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 1)
,
  );
      });


        it("check reduce price", async function () {
     await testERC721.setApprovalForAll(vaultFactory.address, true);

     await vaultFactory.mint('XXX', 'XXX', [testERC7211.address], ['4'], web3.utils.toWei('1', 'ether'), 0,web3.utils.toWei('0.3', 'ether'), 1);
     let rs = await vaultFactory.vaults('0');
     tokenVault = await TokenVault.at(rs);
     let reduce =  await tokenVault.exitReducePrice();
     await settings.setAuctionLength(1);
     await settings.setAuctionExtendLength(1);
      await sleep(3000);
      let new_reduce =  await tokenVault.exitReducePrice();
      if(new_reduce>=reduce){
         assert.fail("reduce price not working");
     }
      });




  it("mint mutiple  sucessful have settings govern", async function () {

    //

    await vaultFactory.mint('XXX', 'XXX', [testERC721.address,testERC721.address], ['1','2'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 20)

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    rs = await tokenVault.treasury();
    let tokenVaultTreasury = await TokenVaultTreasury.at(rs);

    rs = await tokenVault.bnft();
    let tokenVaultBnft = await TokenVaultBnft.at(rs);

    rs = await tokenVault.staking();
    let tokenVaultStaking = await TokenVaultStaking.at(rs);

    await tokenVault.approve(tokenVaultPresale.address, web3.utils.toWei('1000000', 'ether'));
    // await tokenVault.approve(tokenVaultStaking.address, web3.utils.toWei('1000000', 'ether'));

    await tokenVaultPresale.createPresale(tokenVault.address, web3.utils.toWei('900000', 'ether'), web3.utils.toWei('0.000001', 'ether'))

    await tokenVaultPresale.buyTokens(tokenVault.address, { from: accounts[1], value: web3.utils.toWei('0.001009', 'ether') });

    // console.log(

    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('200000', 'ether'));
    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('200000', 'ether'));
    await tokenVaultStaking.redeemFToken(web3.utils.toWei('200000', 'ether'));

    //console.log("tokenVault.listTokens(1).toString() "+ (await tokenVault.listTokens(1)).toString());

    let bnftId = await tokenVaultBnft.tokenIdOf(accounts[0]);
    // console.log("bnftId.toString() "+ bnftId.toString());
    let bnftURI = await tokenVaultBnft.tokenURI(bnftId);
   // console.log("bnftURI.toString() "+ bnftURI.toString());


    await tokenVaultStaking.redeemFToken(web3.utils.toWei('200000', 'ether'));

    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('200000', 'ether'));

    bnftURI = await tokenVaultBnft.tokenURI(bnftId);

       return assert.isTrue(true);
  });





  it("mint mutiple  not have settings govern", async function () {

    await vaultFactory.mint('XXX', 'XXX', [testERC7211.address,testERC7211.address], ['1','2'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 20)

     rs = await vaultFactory.vaults('0');


    return assert.isTrue(true);


});

   it("revert min govern invalid setting", async function () {

       await truffleAssert.reverts(
       vaultFactory.mint('XXX', 'XXX', [testERC721.address,testERC7211.address], ['3','3'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 20),
  );

    return assert.isTrue(true);
  });


   it(" claim airdrop", async function () {


    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', [testERC7211.address], ['6'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);


    await web3.eth.accounts.wallet.create(1);
    flashLoanAdmin = web3.eth.accounts.wallet[0];
    await settings.setFlashLoanAdmin(flashLoanAdmin.address);

    /** Bind the new wallet to the personal accounts */
    await web3.eth.personal.importRawKey(flashLoanAdmin.privateKey, '') // password is empty
    await web3.eth.personal.unlockAccount(flashLoanAdmin.address, '', 10000);

    let mockAirdropERC20 = await MockAirdropERC20.new('XXX', 'XXX')

    let timestamp = new BN(Math.floor(new Date().getTime() / 1000));
    let claimTokensData = mockAirdropERC20.contract.methods.claimTokens().encodeABI();
    let sh3data = web3.utils.soliditySha3(accounts[0], tokenVault.address, mockAirdropERC20.address, claimTokensData, timestamp)
    let sig = flashLoanAdmin.sign(sh3data)

    await tokenVault.adminTargetCall(mockAirdropERC20.address, claimTokensData, timestamp, sig.signature);

    console.log(web3.utils.fromWei((await mockAirdropERC20.balanceOf(tokenVault.address)), 'ether'));


    return assert.isTrue(true);
  });



    it("check voting token", async function () {
     await testERC721.setApprovalForAll(vaultFactory.address, true);

     await vaultFactory.mint('XXX', 'XXX', [testERC7211.address], ['5'], web3.utils.toWei('1', 'ether'), 0,web3.utils.toWei('0.3', 'ether'), 1);
     let rs = await vaultFactory.vaults('0');
     tokenVault = await TokenVault.at(rs);
     let voting_token =  await tokenVault.votingTokens();
       await tokenVault.transfer(accounts[1], web3.utils.toWei('0.6', 'ether'), {from: accounts[0]});
      let new_voting_token =  await tokenVault.votingTokens();

      });

    it("auction flow", async function () {
    //
   // let testERC721 = await TestERC721.new('XXX', 'XXX');

    //testERC721.mint(accounts[0], '1', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

   // await vaultFactory.mint('XXX', 'XXX', [testERC7211.address], ['6'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    await vaultFactory.mint('XXX', 'XXX',[testERC7211.address], ['7'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('0.01', 'ether'), 0);

    let rs = await vaultFactory.vaults('0');
    tokenVault = await TokenVault.at(rs);

    await settings.setAuctionLength(5);
    await settings.setAuctionExtendLength(2);

    console.log('tokenVault.exitReducePrice()', web3.utils.fromWei((await tokenVault.exitReducePrice()).toString(), 'ether'));

    await tokenVault.transfer(accounts[1], web3.utils.toWei('0.5', 'ether'), { from: accounts[0] })

    console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString())
    await tokenVault.start(web3.utils.toWei('1', 'ether'), { from: accounts[0], value: web3.utils.toWei('0.5125', 'ether') });
    console.log('tokenVault.start-0')
    console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString());

    await tokenVault.bid(web3.utils.toWei('1.1', 'ether'), { from: accounts[1], value: web3.utils.toWei('0.56375', 'ether') });
    console.log('tokenVault.bid-1')

    console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString())

    await sleep(2000);

    await tokenVault.end({ from: accounts[1] });

    console.log('testERC721.ownerOf-1', accounts[1], (await testERC721.ownerOf(1)).toString())

    console.log('web3.eth.getBalance-tokenVault', tokenVault.address, (await web3.eth.getBalance(tokenVault.address)).toString())

    console.log('web3.eth.getBalance-1', accounts[0], (await web3.eth.getBalance(accounts[0])).toString())
    await tokenVault.cash({ from: accounts[0] });
    console.log('web3.eth.getBalance-1', accounts[0], (await web3.eth.getBalance(accounts[0])).toString())

    return assert.isTrue(true);
  });

    it("cancel proposal sucessful", async function () {
    //
   // let testERC721 = await TestERC721.new('XXX', 'XXX');

    //testERC721.mint(accounts[0], '1', '');

    //await testERC721.setApprovalForAll(vaultFactory.address, true);

    //await vaultFactory.mint('XXX', 'XXX', [testERC7211.address], ['6'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

      await vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['7'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 0)

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

    // await tokenVault.redeem({ from: accounts[0] });

    // console.log('tokenVault.balanceOf-tokenVaultTreasury', (await tokenVault.balanceOf(tokenVaultTreasury.address)).toString())
    // console.log('tokenVaultStaking.balanceOf-tokenVaultTreasury', (await tokenVaultStaking.balanceOf(tokenVaultTreasury.address)).toString())

    rs = await tokenVaultTreasury.createNftGovernorVoteFor('1', { from: accounts[0] });
    // console.log(rs);

    let proposalEvent = TokenVaultGovernor.decodeLogs(rs.receipt.rawLogs)[0].args
    //console.log(proposalEvent);

     sleep(5000);
    /*for (i = 0; i < 6; i++) {
      await evmMine();
    }*/

    //rs = await tokenVaultGovernor.castVote(proposalEvent.proposalId, 0);

    // //
    rs = await tokenVaultGovernor.cancelNftProposal(
      proposalEvent.targets,
      proposalEvent.values,
      proposalEvent.calldatas,
      proposalEvent.description
    );



    return assert.isTrue(true);
  });



it("nft governent", async function () {


    await vaultFactory.mint('XXX', 'XXX', [testERC721.address], ['8'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 0)

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

    console.log('mockGovernor.castVotes', (await mockGovernor.castVotes('1')).toString());
    console.log('mockGovernor.castVoteChecks', (await mockGovernor.castVoteChecks('1')).toString());

    return assert.isTrue(true);
  });
});