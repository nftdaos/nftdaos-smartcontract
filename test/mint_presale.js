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
const MockWETH = artifacts.require("MockWETH");

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

    const tokenVaultTreasuryLogic = await TokenVaultTreasuryLogic.new();
    await TokenVault.link("TokenVaultTreasuryLogic", tokenVaultTreasuryLogic.address);
    await TokenVaultLogic.link("TokenVaultTreasuryLogic", tokenVaultTreasuryLogic.address);

    const tokenVaultLogic = await TokenVaultLogic.new();
    await TokenVault.link("TokenVaultLogic", tokenVaultLogic.address);
    await TokenVaultGovernor.link("TokenVaultLogic", tokenVaultLogic.address);

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

  })

  it("mint vault sucessful", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');

    testERC721.mint(accounts[0], '1', '');
    testERC721.mint(accounts[0], '2', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', [testERC721.address, testERC721.address], ['1', '2'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('0.01', 'ether'), 0);

    let rs = await vaultFactory.vaults('0');
    tokenVault = await TokenVault.at(rs);

    await tokenVault.approve(tokenVaultPresale.address,  web3.utils.toWei('1', 'ether'))

    await tokenVaultPresale.createPresale(tokenVault.address, web3.utils.toWei('1', 'ether'), web3.utils.toWei('1', 'ether'))

    console.log((await tokenVaultPresale.rates(tokenVault.address)).toString())

    await tokenVaultPresale.updatePresale(tokenVault.address, web3.utils.toWei('0.5', 'ether'), {from: accounts[1]})

    console.log((await tokenVaultPresale.rates(tokenVault.address)).toString())

    return assert.isTrue(true);
  });
});
