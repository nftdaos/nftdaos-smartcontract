const TestERC721 = artifacts.require("TestERC721");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("MintNft", function (accounts) {
  it("should assert true", async function () {
    let testERC721 = await TestERC721.at('0x5cd784FE0256adfCCaA7Bf918d0c6C24f695A8b0');
    for (let i = 9; i <= 20; i++) {
      await testERC721.mint(accounts[0], `${i}`, `ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/${i}`);
    }
    return assert.isTrue(true);
  });
});
