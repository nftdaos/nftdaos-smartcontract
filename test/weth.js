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

    await weth.deposit({
      value: web3.utils.toWei('0.005', 'ether'),
      from: accounts[0],
    })

    await weth.withdraw(
      web3.utils.toWei('0.005', 'ether'),
      {
        from: accounts[0],
      })

    return assert.isTrue(true);
  });
});
