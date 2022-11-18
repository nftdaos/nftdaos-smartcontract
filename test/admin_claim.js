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

const MockAirdropERC20 = artifacts.require("MockAirdropERC20");


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

    // var privateKey = process.env.PRIVATE_KEY
    // let flashLoanAdmin = web3.eth.accounts.privateKeyToAccount(privateKey)
    // await settings.setFlashLoanAdmin(flashLoanAdmin.address)

    await web3.eth.accounts.wallet.create(1)
    flashLoanAdmin = web3.eth.accounts.wallet[0]
    await settings.setFlashLoanAdmin(flashLoanAdmin.address)

    /** Bind the new wallet to the personal accounts */
    await web3.eth.personal.importRawKey(flashLoanAdmin.privateKey, '') // password is empty
    await web3.eth.personal.unlockAccount(flashLoanAdmin.address, '', 10000)

    let mockAirdropERC20 = await MockAirdropERC20.new('XXX', 'XXX')

    let timestamp = new BN(Math.floor(new Date().getTime() / 1000));
    let claimTokensData = mockAirdropERC20.contract.methods.claimTokens().encodeABI();
    let sh3data = web3.utils.soliditySha3(accounts[0], tokenVault.address, mockAirdropERC20.address, claimTokensData, timestamp)
    let sig = flashLoanAdmin.sign(sh3data)

    await tokenVault.adminTargetCall(mockAirdropERC20.address, claimTokensData, timestamp, sig.signature);

    console.log(web3.utils.fromWei((await mockAirdropERC20.balanceOf(tokenVault.address)), 'ether'));

    // let mockAirdropERC20 = await MockAirdropERC20.at('0xCd4ad6771b2835d48ca400b259A1178dB312FC37')
    // let tokenVault = await TokenVault.at('0x2a23A3e5fCAB8f02E789F35A8E026b826E169095')
    // let calldata = '0x48c54b9d'
    // let signature = '0x9340fd0899d5a98ed2883b0d0911e53f49564045f51e5a5f2c2aa0e7724e2f8921b4bbba50a962c9110414e20b304283e370b442994ba965a5318d33de28ace11b'
    // await tokenVault.adminTargetCall('0xCd4ad6771b2835d48ca400b259A1178dB312FC37', calldata, '1665656081', signature);

    return assert.isTrue(true);
  });
});
