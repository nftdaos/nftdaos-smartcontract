
const TestERC20 = artifacts.require("TestERC20");
const TestERC721 = artifacts.require("TestERC721");
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

const VaultFactoryProxy = artifacts.require("VaultFactoryProxy");

const config = require('./config');


/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("Staking", function (accounts) {

  let vaultFactory;
  let settings;
  let weth;

  beforeEach('setup contract', async () => {
    weth = await IWETH.at(config.WETH_ADDRESS);

    settings = await Settings.new(weth.address);

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
    await settings.setFactoryImpl(vaultFactory.address);

    let vaultFactoryProxy = await VaultFactoryProxy.new(
      settings.address
    );

    vaultFactory = await VaultFactory.at(vaultFactoryProxy.address)
  })

  it("mint vault sucessful", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');

    testERC721.mint(accounts[0], '1', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    tokenVault = await TokenVault.at(rs);

    rs = await tokenVault.exchange();
    let tokenVaultExchange = await TokenVaultExchange.at(rs);

    rs = await tokenVault.treasury();
    let tokenVaultTreasury = await TokenVaultTreasury.at(rs);

    await weth.mint(tokenVaultExchange.address, web3.utils.toWei('1', 'ether'));

    // await tokenVaultExchange.shareExchangeFeeRewardToken();

    console.log(
      'balanceOf',
      (await weth.balanceOf(tokenVaultExchange.address)).toString(),
      (await weth.balanceOf(tokenVaultTreasury.address)).toString(),
      (await weth.balanceOf(accounts[0])).toString(),
    )

    rs = await tokenVaultTreasury.getNewSharedToken(weth.address)
    console.log(
      'getNewSharedToken',
      rs[0].toString(),
      rs[1].toString(),
      rs[2].toString(),
    )

    await tokenVaultTreasury.shareTreasuryRewardToken();

    console.log(
      'balanceOf',
      (await weth.balanceOf(tokenVaultExchange.address)).toString(),
      (await weth.balanceOf(tokenVaultTreasury.address)).toString(),
      (await weth.balanceOf(accounts[0])).toString(),
    )

    rs = await tokenVaultTreasury.getNewSharedToken(weth.address)
    console.log(
      'getNewSharedToken',
      rs[0].toString(),
      rs[1].toString(),
      rs[2].toString(),
    )

    console.log(
      'poolBalances',
      (await tokenVaultTreasury.poolBalances(weth.address)).toString(),
    )

    await tokenVault.stakingInitialize(0);

    rs = await tokenVault.staking();
    let tokenVaultStaking = await TokenVaultStaking.at(rs);

    console.log(
      'poolBalances',
      (await tokenVaultTreasury.poolBalances(weth.address)).toString(),
    )

    rs = await tokenVaultTreasury.getNewSharedToken(weth.address)
    console.log(
      'getNewSharedToken',
      rs[0].toString(),
      rs[1].toString(),
      rs[2].toString(),
    )

    console.log(
      'balanceOf',
      (await weth.balanceOf(tokenVaultExchange.address)).toString(),
      (await weth.balanceOf(tokenVaultTreasury.address)).toString(),
      (await weth.balanceOf(tokenVaultStaking.address)).toString(),
      (await weth.balanceOf(accounts[0])).toString(),
    )

    await weth.mint(tokenVaultExchange.address, web3.utils.toWei('1', 'ether'));

    // rs = await tokenVaultTreasury.getNewSharedToken(weth.address)
    // console.log(
    //   'getNewSharedToken',
    //   rs[0].toString(),
    //   rs[1].toString(),
    //   rs[2].toString(),
    // )

    // await tokenVault.approve(tokenVaultStaking.address, web3.utils.toWei('1000000', 'ether'));

    // rs = await tokenVaultStaking.deposit('1000', '1');
    // console.log(rs);

    // await weth.mint(tokenVaultExchange.address, web3.utils.toWei('1', 'ether'));

    // rs = await tokenVaultStaking.deposit('1000', '2');
    // console.log(rs);

    // console.log(
    //   'balanceOf',
    //   (await weth.balanceOf(tokenVaultExchange.address)).toString(),
    //   (await weth.balanceOf(tokenVaultStaking.address)).toString(),
    //   (await weth.balanceOf(accounts[0])).toString(),
    // )

    return assert.isTrue(true);
  });
});
