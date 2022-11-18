const truffleAssert = require('truffle-assertions');
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

const config = require('./config');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("All", function (accounts) {

  let vaultFactory;
  let settings;
  let weth;
    let testERC721;

  beforeEach('setup contract', async () => {
    let proxyAdmin = await ProxyAdmin.new({ from: accounts[0] });

    weth = await IWETH.at(config.WETH_ADDRESS);

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

    const tokenVaultTreasuryLogic = await TokenVaultTreasuryLogic.new();
    await TokenVault.link("TokenVaultTreasuryLogic", tokenVaultTreasuryLogic.address);

    const tokenVaultStakingLogic = await TokenVaultStakingLogic.new();
    await TokenVault.link("TokenVaultStakingLogic", tokenVaultStakingLogic.address);

    const tokenVaultGovermentLogic = await TokenVaultGovernorLogic.new();
    await TokenVault.link("TokenVaultGovernorLogic", tokenVaultGovermentLogic.address);

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
     testERC721 = await TestERC721.new('XXX', 'XXX');

    testERC721.mint(accounts[0], '1', '');
  });

  /*


   it("mint vault amount params.listprice = 0 fail", async function () {

    await testERC721.setApprovalForAll(vaultFactory.address, true);



    await truffleAssert.reverts(
     vaultFactory.mint('XXX', 'XXX', testERC721.address, '1',web3.utils.toWei('1', 'ether'),0, 0, web3.utils.toWei('2', 'ether'))
,
  );
    });


  it("mint vault amount params.supply = 0 fail", async function () {

    await testERC721.setApprovalForAll(vaultFactory.address, true);



    await truffleAssert.reverts(
     vaultFactory.mint('XXX', 'XXX', testERC721.address, '1',0, 0, web3.utils.toWei('1', 'ether'), web3.utils.toWei('2', 'ether'))
,
  );
    });

  it("mint vault treasury balance(params.supply * 50) / 100 >= params.treasuryBalance) fail", async function () {

    await testERC721.setApprovalForAll(vaultFactory.address, true);

   // treasurybalance for mint
    //treasurybalance for noun
    //exitleng
    //reduce price not working
    //auction can not start
    //redeem fail
    // bid fail
    // cash
    // create staking
    //staking
    //unstaking
    //voting
    //nft721
    // sharing fee exchange


    await truffleAssert.reverts(
     vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('2', 'ether'), web3.utils.toWei('1', 'ether'), web3.utils.toWei('2', 'ether'))
,
  );
      });





   it("check noun treasury = 0 fail", async function () {
       await settings.setGovernorSetting(testERC721.address, testERC721.address, 5, 5);
       await testERC721.setApprovalForAll(vaultFactory.address, true);

      await truffleAssert.reverts(
     vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 1)
,
  );
      });




   it("check valid vault", async function () {
       await testERC721.setApprovalForAll(vaultFactory.address, true);

       await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'),  web3.utils.toWei('0.2', 'ether'), web3.utils.toWei('0.3', 'ether'), 1);
       let rs = await vaultFactory.vaults('0');
       tokenVault = await TokenVault.at(rs);
        //console.log('curator.balanceOf', (await tokenVault.balanceOf(await tokenVault.curator())).toString());
        curator_balance = await tokenVault.balanceOf(await tokenVault.curator());
         treasury_balance = await tokenVault.balanceOf(await tokenVault.treasury());
         if(curator_balance!=800000000000000000 || treasury_balance!=200000000000000000)
         {
              assert.fail("mint amount not valid");
         }
          console.log(treasury_balance.toString());
       //console.log('treausury.balanceOf', (await tokenVault.balanceOf(await tokenVault.treasury())).toString());
    });



   it("check reduce price", async function () {
     await testERC721.setApprovalForAll(vaultFactory.address, true);

     await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), 0,web3.utils.toWei('0.3', 'ether'), 1);
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

   */

  it("check voting token", async function () {
     await testERC721.setApprovalForAll(vaultFactory.address, true);

     await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), 0,web3.utils.toWei('0.3', 'ether'), 1);
     let rs = await vaultFactory.vaults('0');
     tokenVault = await TokenVault.at(rs);
     let voting_token =  await tokenVault.votingTokens();
       await tokenVault.transfer(accounts[1], web3.utils.toWei('0.6', 'ether'), {from: accounts[0]});
      let new_voting_token =  await tokenVault.votingTokens();
       console.log(new_voting_token.toString());
       console.log(voting_token.toString());
      if(new_voting_token>=voting_token){
         assert.fail("voting rule not working");
     }
      });

/*

 it("check reduce price", async function () {
     await testERC721.setApprovalForAll(vaultFactory.address, true);

     await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), 0,web3.utils.toWei('0.3', 'ether'), 1);
     let rs = await vaultFactory.vaults('0');
     tokenVault = await TokenVault.at(rs);
     let reduce =  await tokenVault.exitReducePrice();
     await settings.setAuctionLength(1);
     await settings.setAuctionExtendLength(1);
     //console.log('tokenVault.showTime()',(await tokenVault.showTime()).toString());

    // console.log('tokenVault.exitReducePrice()', web3.utils.fromWei((await tokenVault.exitReducePrice()).toString(), 'ether'));
    //console.log('tokenVault.votingTokens()',(await tokenVault.votingTokens()).toString());
      //console.log('tokenVault.exitLength()',(await tokenVault.exitLength()).toString());
       //console.log('tokenVault.fractionStart()',(await tokenVault.fractionStart()).toString());
      // console.log('tokenVault.auctionState()',(await tokenVault.auctionState()).toString());
        console.log('curator.balanceOf', (await tokenVault.balanceOf(await tokenVault.curator())).toString());
       console.log('treausury.balanceOf', (await tokenVault.balanceOf(await tokenVault.treasury())).toString());



     await sleep(3000);
      //console.log('tokenVault.showTime()',(await tokenVault.showTime()).toString());
     console.log('tokenVault.exitPrice()', web3.utils.fromWei((await tokenVault.exitPrice()).toString(), 'ether'));
     let new_reduce =  await tokenVault.exitReducePrice();
     //return assert.isTrue(new_reduce>=reduce);
     if(new_reduce>=reduce){
         assert.fail("reduce price not working");
     }
 */

     /*
     console.log('curator.balanceOf', (await tokenVault.balanceOf(await tokenVault.curator())).toString());
      await tokenVault.transfer(accounts[1], web3.utils.toWei('0.8', 'ether'), {from: accounts[0]});
       console.log('curator.balanceOf', (await tokenVault.balanceOf(await tokenVault.curator())).toString());
        console.log('tokenVault.exitPrice()', web3.utils.fromWei((await tokenVault.exitPrice()).toString(), 'ether'));

      */

  //});


    //await
   // let rs = await vaultFactory.vaults('0');
   // tokenVault = await TokenVault.at(rs);

    // await tokenVault.updateUserPrice(web3.utils.toWei('1.1', 'ether'));

    //rs = await tokenVault.staking();
    //let tokenVaultStaking = await TokenVaultStaking.at(rs);
   /* console.log('tokenVaultaddress',  tokenVault.address);
     console.log('tokenVaultcurator', (await tokenVault.curator()).toString());
     console.log('curator.balanceOf', (await tokenVault.balanceOf(await tokenVault.curator())).toString());

    console.log('tokenVaultStaking.balanceOf', (await tokenVaultStaking.balanceOf(tokenVaultStaking.address)).toString());
    */
    //console.log('treausury.balanceOf', (await tokenVault.balanceOf(await tokenVault.treasury())).toString());

    //return assert.isTrue(true);




});