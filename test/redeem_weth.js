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
contract("Redeem", function (accounts) {
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

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0);

    let rs = await vaultFactory.vaults('0');
    tokenVault = await TokenVault.at(rs);

    rs = await tokenVault.treasury();
    tokenVaultTreasury = await TokenVaultTreasury.at(rs);

    await weth.deposit({
      value: web3.utils.toWei('0.001', 'ether'),
      from: accounts[9],
    })
    console.log('weth.balanceOf-9', (await weth.balanceOf(accounts[9])).toString())
    await weth.transfer(
      tokenVaultTreasury.address,
      web3.utils.toWei('0.001', 'ether'),
      {
        from: accounts[9],
      }
    )
    console.log('weth.balanceOf-tokenVaultTreasury', (await weth.balanceOf(tokenVaultTreasury.address)).toString())

    await 

    await tokenVault.redeem({ from: accounts[0] });

    console.log('weth.balanceOf-tokenVaultTreasury', (await weth.balanceOf(tokenVaultTreasury.address)).toString())

    console.log('getBalance-tokenVaultTreasury', web3.utils.fromWei(await web3.eth.getBalance(tokenVaultTreasury.address), 'ether').toString())

    console.log('testERC721.ownerOf-1', accounts[0], (await testERC721.ownerOf(1)).toString())

    return assert.isTrue(true);
  });
});
