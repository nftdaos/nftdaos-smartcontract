const AllowList = artifacts.require("AllowList");
const PartyBuyFactory = artifacts.require("PartyBuyFactory");
const PartyBuy = artifacts.require("PartyBuy");
const Seller = artifacts.require("Seller");

const ProxyAdmin = artifacts.require("ProxyAdmin");
const TransparentUpgradeableProxy = artifacts.require(
  "TransparentUpgradeableProxy"
);
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
const MockGovernor = artifacts.require("MockGovernor");
const truffleAssert = require("truffle-assertions");
const MockAirdropERC20 = artifacts.require("MockAirdropERC20");
const MockWETH = artifacts.require("MockWETH");
var BN = web3.utils.BN;

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

contract("Mint", function (accounts) {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitAndEvmMine(ms) {
    await sleep(ms);
    await evmMine();
  }

  function evmMine() {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          method: "evm_mine",
          id: new Date().getTime(),
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      );
    });
  }

  let vaultFactory;
  let settings;
  let weth;
  let tokenVaultPresale;
  let mockGovernor;
  let testERC721;
  let testERC7211;
  let allowList;
  let partyBuyFactory;
  let partyBuy;
  let seller;

  beforeEach("setup contract", async () => {
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
    await TokenVault.link(
      "TokenVaultTreasuryLogic",
      tokenVaultTreasuryLogic.address
    );
    await TokenVaultLogic.link(
      "TokenVaultTreasuryLogic",
      tokenVaultTreasuryLogic.address
    );

    const tokenVaultLogic = await TokenVaultLogic.new();

    await TokenVault.link("TokenVaultLogic", tokenVaultLogic.address);
    await TokenVaultGovernor.link("TokenVaultLogic", tokenVaultLogic.address);

    const tokenVaultStakingLogic = await TokenVaultStakingLogic.new();
    await TokenVault.link(
      "TokenVaultStakingLogic",
      tokenVaultStakingLogic.address
    );

    const tokenVaultGovermentLogic = await TokenVaultGovernorLogic.new();
    await TokenVault.link(
      "TokenVaultGovernorLogic",
      tokenVaultGovermentLogic.address
    );
    await TokenVaultGovernor.link(
      "TokenVaultGovernorLogic",
      tokenVaultGovermentLogic.address
    );

    const tokenVaultExchangeLogic = await TokenVaultExchangeLogic.new();
    await TokenVault.link(
      "TokenVaultExchangeLogic",
      tokenVaultExchangeLogic.address
    );

    let tokenVault = await TokenVault.new(settings.address);
    await settings.setVaultImpl(tokenVault.address);

    let tokenVaultTreasury = await TokenVaultTreasury.new(settings.address);
    await settings.setTreasuryImpl(tokenVaultTreasury.address);

    await TokenVaultStaking.link(
      "TokenVaultStakingLogic",
      tokenVaultStakingLogic.address
    );
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

    let tokenVaultTreasuryProxy = await TokenVaultTreasuryProxy.new(
      settings.address
    );
    await settings.setTreasuryTpl(tokenVaultTreasuryProxy.address);

    let tokenVaultStakingProxy = await TokenVaultStakingProxy.new(
      settings.address
    );
    await settings.setStakingTpl(tokenVaultStakingProxy.address);

    let tokenVaultGovernorProxy = await TokenVaultGovernorProxy.new(
      settings.address
    );
    await settings.setGovernmentTpl(tokenVaultGovernorProxy.address);

    let tokenVaultExchangeProxy = await TokenVaultExchangeProxy.new(
      settings.address
    );
    await settings.setExchangeTpl(tokenVaultExchangeProxy.address);

    let tokenVaultBnftProxy = await TokenVaultBnftProxy.new(settings.address);
    await settings.setBnftTpl(tokenVaultBnftProxy.address);

    vaultFactory = await VaultFactory.new(settings.address);
    vaultFactory = await TransparentUpgradeableProxy.new(
      vaultFactory.address,
      proxyAdmin.address,
      vaultFactory.contract.methods.initialize().encodeABI()
    );
    vaultFactory = await VaultFactory.at(vaultFactory.address);

    tokenVaultPresale = await TokenVaultPresale.new(settings.address);
    tokenVaultPresale = await TransparentUpgradeableProxy.new(
      tokenVaultPresale.address,
      proxyAdmin.address,
      tokenVaultPresale.contract.methods.initialize().encodeABI()
    );
    tokenVaultPresale = await TokenVaultPresale.at(tokenVaultPresale.address);

    await settings.setAuctionLength(1800);
    await settings.setAuctionExtendLength(600);
    await settings.setVotingDelayBlock(10);
    await settings.setVotingPeriodBlock(25);
    await settings.setTerm1Duration(6);
    await settings.setTerm2Duration(12);
    await settings.setEpochDuration(2);
    testERC721 = await TestERC721.new("XXX", "XXX");
    testERC7211 = await TestERC721.new("YYY", "YYY");
    mockGovernor = await MockGovernor.new();

    allowList = await AllowList.new({ from: accounts[0] });
    seller = await Seller.new({ from: accounts[0] });

    testERC721.mint(accounts[0], "1", "");
    testERC721.mint(accounts[0], "2", "");
    testERC721.mint(accounts[0], "3", "");
    testERC721.mint(accounts[0], "4", "");
    testERC721.mint(accounts[0], "5", "");
    testERC721.mint(accounts[0], "6", "");
    testERC721.mint(accounts[0], "7", "");
    testERC721.mint(accounts[0], "8", "");
    testERC721.mint(accounts[0], "9", "");

    testERC7211.mint(accounts[0], "1", "");
    testERC7211.mint(accounts[0], "2", "");
    testERC7211.mint(accounts[0], "3", "");
    testERC7211.mint(accounts[0], "4", "");
    testERC7211.mint(accounts[0], "5", "");
    testERC7211.mint(accounts[0], "6", "");
    testERC7211.mint(accounts[0], "7", "");
    testERC7211.mint(accounts[0], "8", "");

    await testERC7211.transferFrom(accounts[0], seller.address, 8);
  });

  it("party fdao", async function () {
    await allowList.setAllowed(seller.address, true);
    partyBuyFactory = await PartyBuyFactory.new(
      settings.address,
      vaultFactory.address,
      weth.address,
      allowList.address
    );

    const splitRecipient = "0x0000000000000000000000000000000000000000";
    const splitBasisPoints = 0;
    const gatedToken = "0x0000000000000000000000000000000000000000";
    const gatedTokenAmount = 0;
    const secondsToTimeout = 1000;
    const maxPrice = 10;
    const tokenId = 8;

    let rs = await partyBuyFactory.startParty(
      testERC7211.address,
      tokenId,
      web3.utils.toWei("1", "ether"),
      secondsToTimeout,
      [splitRecipient, splitBasisPoints],
      [gatedToken, gatedTokenAmount],
      "party fdao",
      "Partyfdao",
      1000,
      0
    );

    // console.log('rs.receipt.rawLogs ' + rs.receipt.rawLogs[0].toString());
    let startPartyEvent = PartyBuyFactory.decodeLogs(rs.receipt.rawLogs)[0]
      .args;

    // Get PartyBid ethers contract
    partyBuy = await PartyBuy.at(startPartyEvent.partyProxy);

    await partyBuy.contribute({
      from: accounts[0],
      value: web3.utils.toWei("1", "ether"),
    });

    console.log(
      "partyBuytotalContributedToParty" +
        (await partyBuy.totalContributedToParty()).toString()
    );

    let callData = web3.eth.abi.encodeFunctionCall(
      {
        name: "sell",
        type: "function",
        inputs: [
          {
            type: "uint256",
            name: "offer",
          },
          {
            type: "uint256",
            name: "tokenId",
          },
          {
            type: "address",
            name: "nftContract",
          },
        ],
      },
      [web3.utils.toWei("0.5", "ether"), tokenId, testERC7211.address]
    );

    await partyBuy.buy(
      web3.utils.toWei("0.5", "ether"),
      seller.address,
      callData
    );

    console.log(
      "partyBuy.tokenVault.address  " + (await partyBuy.tokenVault()).toString()
    );
    console.log(
      " await testERC7211.ownerOf(tokenId) " +
        (await testERC7211.ownerOf(tokenId)).toString()
    );

    assert.equal(
      (await partyBuy.tokenVault()).toString(),
      (await testERC7211.ownerOf(tokenId)).toString()
    );
    let tokenVault = await TokenVault.at((await partyBuy.tokenVault()));

      assert.equal(
      await tokenVault.exitReducePrice(),
      1000
    );
      assert.equal(
      await tokenVault.name(),
      "party fdao"
    );
       assert.equal(
      await tokenVault.symbol(),
      "Partyfdao"
    );
        console.log(
      " await tokenVault.totalSupply() " +
        (await tokenVault.totalSupply()).toString()
    );

  });
});
