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

const VaultFactoryProxy = artifacts.require("VaultFactoryProxy");
const TokenVaultPresaleProxy = artifacts.require("TokenVaultPresaleProxy");
const TokenVaultPresale = artifacts.require("TokenVaultPresale");

const config = require('./config');
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("Presale", function (accounts) {

  let vaultFactory;
  let settings;
  let weth;
  let tokenVaultPresale;

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

    // presale

    tokenVaultPresale = await TokenVaultPresale.new(settings.address);
    await settings.setPresaleImpl(tokenVaultPresale.address);

    let tokenVaultPresaleProxy = await TokenVaultPresaleProxy.new(
      settings.address
    );

    tokenVaultPresale = await TokenVaultPresale.at(tokenVaultPresaleProxy.address)

  })

  it("presale OK", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');

    testERC721.mint(accounts[0], '1', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    tokenVault = await TokenVault.at(rs);

    await tokenVault.approve(tokenVaultPresale.address, web3.utils.toWei('1000000', 'ether'));

    await tokenVaultPresale.createPresale(tokenVault.address, web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('0.000001', 'ether'))

    await tokenVaultPresale.buyTokens(tokenVault.address, { from: accounts[1], value: web3.utils.toWei('0.1009', 'ether') })

    console.log('tokenVault.balanceOf-1', (await tokenVault.balanceOf(accounts[1])).toString())

    return assert.isTrue(true);
  });
});
