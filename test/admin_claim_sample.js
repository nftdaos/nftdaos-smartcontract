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

var BN = web3.utils.BN;

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
    let proxyAdmin = await ProxyAdmin.new({ from: accounts[0] });

    weth = await TestERC20.new('XXX', 'XXX')

    settings = await Settings.new();
    let initializeData = settings.contract.methods.initialize(weth.address).encodeABI();

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
    initializeData = vaultFactory.contract.methods.initialize().encodeABI();
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

    testERC721.mint(accounts[0], '1', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    // for flash call

    let usdc = await TestERC20.new('XXX', 'XXX')

    await usdc.mint(tokenVault.address, '1234')

    var privateKey = process.env.PRIVATE_KEY
    let flashLoanAdmin = web3.eth.accounts.privateKeyToAccount(privateKey)
    await settings.setFlashLoanAdmin(flashLoanAdmin.address)


    await tokenVault.adminTargetCall(
      '0xC8A794641d8994a50c538e231A213C3855Ea2acB',
      Buffer.from('a9059cbb000000000000000000000000af8d103b3aad6d1c855f5783ebde46ad6003b02000000000000000000000000000000000000000000000000000000000000004d2', 'hex'),
      '1665645275',
      Buffer.from('312e0b3289a5aca82cd5a8756dca57ba06fbe0511d8b6e0fd720a36dbc910d580bbce9e8341058a621e428bd974ba908835bc354f8d8aefb64ee72a507e346e91b', 'hex'),
    );

    return assert.isTrue(true);
  });
});
