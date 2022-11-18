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

const config = require('./config');
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("Fraction", function (accounts) {

  let vaultFactory;
  let settings;
  let weth;

  beforeEach('setup contract', async () => {

    // let weth = await TestERC20.new('XXX', 'XXX');
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

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('0.1', 'ether'), 0);

    let rs = await vaultFactory.vaults('0');
    tokenVault = await TokenVault.at(rs);

    await settings.setAuctionLength(1);
    await settings.setAuctionExtendLength(1);

    console.log('tokenVault.exitReducePrice()', web3.utils.fromWei((await tokenVault.exitReducePrice()).toString(), 'ether'));

    await tokenVault.transfer(accounts[1], web3.utils.toWei('0.5', 'ether'), { from: accounts[0] })

    await weth.deposit({
      value: web3.utils.toWei('0.1', 'ether'),
      from: accounts[9],
    })

    console.log('weth.balanceOf-tokenVault', tokenVault.address, (await weth.balanceOf(tokenVault.address)).toString())
    await weth.transfer(tokenVault.address, web3.utils.toWei('0.1', 'ether'), { from: accounts[9] })
    console.log('weth.transfer-9')
    console.log('weth.balanceOf-tokenVault', tokenVault.address, (await weth.balanceOf(tokenVault.address)).toString())

    console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString())
    await tokenVault.start(web3.utils.toWei('0.1', 'ether'), { from: accounts[0], value: web3.utils.toWei('0.05125', 'ether') });
    console.log('tokenVault.start-0')
    console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString())

    await sleep(2000);

    console.log('web3.eth.getBalance-tokenVault', tokenVault.address, (await web3.eth.getBalance(tokenVault.address)).toString())

    await tokenVault.end({ from: accounts[0] });

    console.log('web3.eth.getBalance-tokenVault', tokenVault.address, (await web3.eth.getBalance(tokenVault.address)).toString())

    console.log('testERC721.ownerOf-1', accounts[0], (await testERC721.ownerOf(1)).toString())

    console.log('web3.eth.getBalance-tokenVault', tokenVault.address, (await web3.eth.getBalance(tokenVault.address)).toString())

    console.log('web3.eth.getBalance-1', accounts[1], (await web3.eth.getBalance(accounts[1])).toString())
    await tokenVault.cash({ from: accounts[1] });
    console.log('web3.eth.getBalance-1', accounts[1], (await web3.eth.getBalance(accounts[1])).toString())

    return assert.isTrue(true);
  });
});
