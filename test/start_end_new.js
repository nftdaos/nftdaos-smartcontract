const IWETH = artifacts.require("IWETH");
const TestERC20 = artifacts.require("TestERC20");
const Settings = artifacts.require("Settings");
const VaultFactory = artifacts.require("VaultFactory");
const TokenVault = artifacts.require("TokenVault");
const TokenVaultTreasury = artifacts.require("TokenVaultTreasury");
const TokenVaultStaking = artifacts.require("TokenVaultStaking");
const TokenVaultGovernor = artifacts.require("TokenVaultGovernor");
const TestERC721 = artifacts.require("TestERC721");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("Fraction", function (accounts) {
  it("should assert true", async function () {
    let weth = await IWETH.at('0x13b6661449127D196EECBdC89297F694Db2652C3');

    let testERC721 = await TestERC721.new('XXX', 'XXX');
    await testERC721.mint(accounts[0], '1', '');
    
    let settings = await Settings.new(weth.address);
    
    let tokenVault = await TokenVault.new(settings.address);
    await settings.setVaultImpl(tokenVault.address);
    
    let tokenVaultTreasury = await TokenVaultTreasury.new(settings.address);
    await settings.setTreasuryImpl(tokenVaultTreasury.address);

    let tokenVaultStaking = await TokenVaultStaking.new(settings.address);
    await settings.setStakingImpl(tokenVaultStaking.address);

    let tokenVaultGovernor = await TokenVaultGovernor.new(settings.address);
    await settings.setGovernmentImpl(tokenVaultGovernor.address);

    let vaultFactory = await VaultFactory.new(settings.address);

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('0.01', 'ether'), 0);

    let rs = await vaultFactory.vaults('0');
    tokenVault = await TokenVault.at(rs);

    await settings.setAuctionLength(10);
    await settings.setAuctionExtendLength(10);

    console.log('tokenVault.exitReducePrice()', web3.utils.fromWei((await tokenVault.exitReducePrice()).toString(), 'ether'));

    await tokenVault.transfer(accounts[1], web3.utils.toWei('0.5', 'ether'), {from: accounts[0]})

    await weth.deposit({
      value: web3.utils.toWei('0.005', 'ether'),
      from: accounts[0],
    })
    await weth.approve(tokenVault.address, web3.utils.toWei('1', 'ether'), {from: accounts[0]})
    await tokenVault.start(web3.utils.toWei('0.01', 'ether'), web3.utils.toWei('0.005', 'ether'), {from: accounts[0]});
    console.log('tokenVault.start-0')

    await sleep(10000)

    await tokenVault.end({from: accounts[0]});

    console.log('testERC721.ownerOf-1', accounts[0], (await testERC721.ownerOf(1)).toString())

    return assert.isTrue(true);
  });
});
