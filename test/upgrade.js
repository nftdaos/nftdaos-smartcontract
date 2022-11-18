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
    let settings = await Settings.at('0x295F924911c0B83912eC7fbB053708fE6D99DE0f');
    // let settings = await Settings.new('0x295F924911c0B83912eC7fbB053708fE6D99DE0f');
    console.log(settings.address)//0x295F924911c0B83912eC7fbB053708fE6D99DE0f
    
    let tokenVault = await TokenVault.new(settings.address);
    await settings.setVaultImpl(tokenVault.address);
    
    let tokenVaultTreasury = await TokenVaultTreasury.new(settings.address);
    await settings.setTreasuryImpl(tokenVaultTreasury.address);

    let tokenVaultStaking = await TokenVaultStaking.new(settings.address);
    await settings.setStakingImpl(tokenVaultStaking.address);

    let tokenVaultGovernor = await TokenVaultGovernor.new(settings.address);
    await settings.setGovernmentImpl(tokenVaultGovernor.address);

    let vaultFactory = await VaultFactory.new(settings.address);
    console.log('vaultFactory', vaultFactory.address);//0xf71c36fADFa2c5cE31F5d2CA27F726ecf9e0501f

    // let settings = await Settings.at('0x443e56e01386DDFEe84d14C9cDEF90F5e783537F');
    // let tokenVault = await TokenVault.at('0x87a207CB22234A3188FeFAF36adAc9843F9ea33b');
    // rs = await tokenVault.staking();
    // tokenVaultStaking = await TokenVaultStaking.at(rs);
    // await tokenVault.approve(tokenVaultStaking.address, web3.utils.toWei('1000000', 'ether'));
    // await tokenVaultStaking.deposit('1000', '1');

    // let testERC721 = await TestERC721.new('nftDaos BoredApeYachtClub', 'FBAYC');
    // let testERC721 = await TestERC721.at('0xD37e7f26FfB5930DCe234C701908Ab582D1C74e6'); //goerli
    // let testERC721 = await TestERC721.at('0xef8a55230a0AA9AA228F2B2Bf681661975B048A9'); //fuji
    // let vaultFactory = await VaultFactory.at('0x0D9E16E9a7122E70FB3Beb507889CA235eDBAA32'); //goerli
    // let vaultFactory = await VaultFactory.at('0x780714d6157EE42C86De73A03157ED98203472e8'); //fuji
    // let vaultFactory = await VaultFactory.at('0x042B18584cFB302dEd1177938dde47e99A0E6592'); //local
    // await testERC721.setApprovalForAll(vaultFactory.address, true);
    // await vaultFactory.mint('BoredApeYachtClub #2', 'BAYC1', testERC721.address, '2', web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('1', 'ether'), 0);
    await vaultFactory.mint.estimateGas('BoredApeYachtClub #55', 'BAYC55', [testERC721.address], ['55'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('0.1', 'ether'), 0);
    await vaultFactory.mint('BoredApeYachtClub #55', 'BAYC55', [testERC721.address], ['55'], web3.utils.toWei('1000000', 'ether'), web3.utils.toWei('100000', 'ether'), web3.utils.toWei('0.1', 'ether'), 0);
    // let tokenVault = await TokenVault.at('0x31601a1a1C55AFE1D8415c063A4Cf8ea5aCF24a7');
    // await tokenVault.stakingInitialize();
    // rs = await tokenVault.staking();
    // tokenVaultStaking = await TokenVaultStaking.at(rs);
    // await tokenVault.approve(tokenVaultStaking.address, web3.utils.toWei('1000000', 'ether'));
    // rs = await tokenVaultStaking.deposit('1000', '1');
    // rs = await tokenVaultStaking.deposit('1000', '2');

    await testERC721.mint(accounts[0], '1', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1');
    await testERC721.mint(accounts[0], '2', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2');
    await testERC721.mint(accounts[0], '3', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/3');
    await testERC721.mint(accounts[0], '4', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/4');
    await testERC721.mint(accounts[0], '5', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/5');

    await testERC721.mint(accounts[0], '55', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/55');
    // await testERC721.mint(accounts[0], '15', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/15');
    // await testERC721.mint(accounts[0], '16', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/16');
    // await testERC721.mint(accounts[0], '17', 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/17');
    await testERC721.mint('0xAF8d103B3aad6D1c855f5783ebDE46AD6003B020', '2', 'https://cdn-api.niftykit.com/reveal/wVQvej4W690X76SXUfUv/1740');

    return assert.isTrue(true);
  });
});
