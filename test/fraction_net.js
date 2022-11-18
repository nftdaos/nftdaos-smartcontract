// const NFTPawn = artifacts.require("NFTPawn");
const TestERC20 = artifacts.require("TestERC20");
const Settings = artifacts.require("Settings");
const VaultFactory = artifacts.require("VaultFactory");
const TokenVault = artifacts.require("TokenVault");
const TokenVaultNew = artifacts.require("TokenVaultNew");
const TokenVaultTreasury = artifacts.require("TokenVaultTreasury");
const TokenVaultStaking = artifacts.require("TokenVaultStaking");

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
    let testERC721 = await TestERC721.at('0x2dd5A263c1042830cF7B4680E5Dde9aE925a02D2');
    let vaultFactory = await VaultFactory.at('0x4BA0fc5D1750267D7C356e129083C80872745b48');
    await testERC721.setApprovalForAll(vaultFactory.address, true);
    await vaultFactory.mint('BoredApeYachtClub 5174', 'BAYC', testERC721.address, '5174', web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 94348800);
    let tokenVault = await TokenVault.at('xxx');
    await tokenVault.stakingInitialize();
    // 0x2EAe9B01b42098100d8e5Be3A1F6c90686db4F23
    return assert.isTrue(true);
  });
});
