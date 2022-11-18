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


const MockWETH = artifacts.require("MockWETH");

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
  })

  it("mint vault sucessful", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');
    let testERC7211 = await TestERC721.new('YYY', 'YYY');
     let mockGovernor = await MockGovernor.new();

    testERC721.mint(accounts[0], '1', '');
    testERC721.mint(accounts[0], '2', '');
    testERC721.mint(accounts[0], '3', '');
    testERC7211.mint(accounts[0], '1', '');
    testERC7211.mint(accounts[0], '2', '');
    testERC7211.mint(accounts[0], '3', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);
    await testERC7211.setApprovalForAll(vaultFactory.address, true);
    settings.setGovernorSetting(testERC721.address, mockGovernor.address, 5, 5);

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

    await tokenVaultPresale.buyTokens(tokenVault.address, { from: accounts[1], value: web3.utils.toWei('0.001009', 'ether') })

    // console.log(
    //   'check',
    //   (await tokenVault.balanceOf(accounts[0])).toString(),
    //   (await tokenVault.balanceOf(accounts[1])).toString(),
    // )

    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('200000', 'ether'));
    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('200000', 'ether'));
    await tokenVaultStaking.redeemFToken(web3.utils.toWei('200000', 'ether'));

    console.log("tokenVault.listTokens(1).toString() "+ (await tokenVault.listTokens(1)).toString());

    let bnftId = await tokenVaultBnft.tokenIdOf(accounts[0]);
     console.log("bnftId.toString() "+ bnftId.toString());
    let bnftURI = await tokenVaultBnft.tokenURI(bnftId);
    console.log("bnftURI.toString() "+ bnftURI.toString());


    await tokenVaultStaking.redeemFToken(web3.utils.toWei('200000', 'ether'));

    await tokenVaultStaking.convertFTokenToVeToken(web3.utils.toWei('200000', 'ether'));

    bnftURI = await tokenVaultBnft.tokenURI(bnftId);

    console.log("pass min 1");


    await vaultFactory.mint('XXX', 'XXX', [testERC7211.address,testERC7211.address], ['1','2'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 20)

     rs = await vaultFactory.vaults('0');

     console.log("pass min 2");




          await truffleAssert.reverts(
    vaultFactory.mint('XXX', 'XXX', [testERC7211.address,testERC7211.address], ['1','2'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 20),
  );


      console.log("revert min 3 invalid settings");





    // await tokenVault.stakingInitialize(0)

    // await tokenVaultStaking.deposit(web3.utils.toWei('10000', 'ether'), '1')
    // await tokenVaultStaking.deposit(web3.utils.toWei('10000', 'ether'), '2')

    // await tokenVaultStaking.deposit(web3.utils.toWei('10000', 'ether'), '1')
    // await tokenVaultStaking.deposit(web3.utils.toWei('10000', 'ether'), '2')

    // await waitAndEvmMine(6000)
    // await tokenVaultStaking.withdraw('1', web3.utils.toWei('5000', 'ether'))
    // await tokenVaultStaking.withdraw('3', web3.utils.toWei('5000', 'ether'))

    // await waitAndEvmMine(6000)
    // await tokenVaultStaking.withdraw('2', web3.utils.toWei('5000', 'ether'))
    // await tokenVaultStaking.withdraw('4', web3.utils.toWei('5000', 'ether'))

    // await tokenVault.updateUserPrice(web3.utils.toWei('2', 'ether'))

    // await waitAndEvmMine(8000)

    // console.log(
    //   'after-1',
    //   (await tokenVault.exitReducePrice()).toString(),
    // )

    // await tokenVaultPresale.buyTokens(tokenVault.address, { from: accounts[1], value: web3.utils.toWei('0.001009', 'ether') })

    // // await waitAndEvmMine(7000)

    // console.log(
    //   'after-2',
    //   (await tokenVault.exitReducePrice()).toString(),
    // )

    return assert.isTrue(true);
  });
});
