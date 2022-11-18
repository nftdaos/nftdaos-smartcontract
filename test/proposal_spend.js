const ProxyAdmin = artifacts.require('ProxyAdmin');
const TransparentUpgradeableProxy = artifacts.require('TransparentUpgradeableProxy');
const TestERC20 = artifacts.require("TestERC20");
const TestERC721 = artifacts.require("TestERC721");
const TestERC1155 = artifacts.require("TestERC1155");
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

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract("ProposalERC20Spend", function (accounts) {

  let vaultFactory;
  let settings;
  let weth;

  beforeEach('setup contract', async () => {
    let proxyAdmin = await ProxyAdmin.new({ from: accounts[0] });

    weth = await IWETH.at(config.WETH_ADDRESS);

    settings = await Settings.new();
    let initializeData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'initialize',
        type: 'function',
        inputs: [{
          type: 'address',
          name: '_weth'
        }
        ]
      },
      [weth.address]
    );

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
    initializeData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'initialize',
        type: 'function',
        inputs: []
      },
      []
    );
    vaultFactory = await TransparentUpgradeableProxy.new(
      vaultFactory.address,
      proxyAdmin.address,
      initializeData,
    );
    vaultFactory = await VaultFactory.at(vaultFactory.address);
  })

  it("proposalERC20Spend", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');
    testERC721.mint(accounts[0], '1', '');

    let testERC20 = await TestERC20.new('XXX', 'XXX');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    await testERC20.mint(tokenVault.address, web3.utils.toWei('1', 'ether'));

    console.log(
      'before',
      web3.utils.toWei('1', 'ether'),
      (await testERC20.balanceOf(tokenVault.address)).toString(),
      (await testERC20.balanceOf(accounts[0])).toString(),
    )

    let callData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'transfer',
        type: 'function',
        inputs: [{
          type: 'address',
          name: 'receiver'
        }, {
          type: 'uint256',
          name: 'amount'
        }
        ]
      },
      [
        accounts[0],
        web3.utils.toWei('1', 'ether')
      ]
    );
    await tokenVault.proposalTargetCall(testERC20.address, 0, callData);

    console.log(
      'after',
      web3.utils.toWei('1', 'ether'),
      (await testERC20.balanceOf(tokenVault.address)).toString(),
      (await testERC20.balanceOf(accounts[0])).toString(),
    )

    return assert.isTrue(true);
  });

  it("proposalERC721Spend", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');
    testERC721.mint(accounts[0], '1', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    let testERC721New = await TestERC721.new('XXX', 'XXX');
    await testERC721New.mint(tokenVault.address, '1', '');

    console.log(
      'before',
      tokenVault.address,
      accounts[0],
      (await testERC721New.ownerOf('1')).toString(),
    )

    let callData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'transferFrom',
        type: 'function',
        inputs: [{
          type: 'address',
          name: 'from'
        }, {
          type: 'address',
          name: 'to'
        }, {
          type: 'uint256',
          name: 'tokenId'
        }
        ]
      },
      [
        tokenVault.address,
        accounts[0],
        '1'
      ]
    );
    await tokenVault.proposalTargetCall(testERC721New.address, 0, callData);

    console.log(
      'after',
      tokenVault.address,
      accounts[0],
      (await testERC721New.ownerOf('1')).toString(),
    )

    return assert.isTrue(true);
  });

  it("proposalERC1155Spend", async function () {
    // 
    let testERC721 = await TestERC721.new('XXX', 'XXX');
    let testERC1155 = await TestERC1155.new();

    testERC721.mint(accounts[0], '1', '');

    await testERC721.setApprovalForAll(vaultFactory.address, true);

    await vaultFactory.mint('XXX', 'XXX', testERC721.address, '1', web3.utils.toWei('1', 'ether'), web3.utils.toWei('0', 'ether'), web3.utils.toWei('1', 'ether'), 0)

    let rs = await vaultFactory.vaults('0');
    let tokenVault = await TokenVault.at(rs);

    await testERC1155.mint(tokenVault.address, '1', '1000');

    console.log(
      'before',
      (await testERC1155.balanceOf(tokenVault.address, '1')).toString(),
      (await testERC1155.balanceOf(accounts[0], '1')).toString(),
    )

    let callData = web3.eth.abi.encodeFunctionCall(
      {
        name: 'safeTransferFrom',
        type: 'function',
        inputs: [{
          type: 'address',
          name: 'from'
        }, {
          type: 'address',
          name: 'to'
        }, {
          type: 'uint256',
          name: 'id'
        }, {
          type: 'uint256',
          name: 'amount'
        }, {
          type: 'bytes',
          name: 'data'
        }]
      },
      [
        tokenVault.address,
        accounts[0],
        '1',
        '1000',
        Buffer.from([])
      ]
    );
    await tokenVault.proposalTargetCall(testERC1155.address, 0, callData);

    console.log(
      'after',
      (await testERC1155.balanceOf(tokenVault.address, '1')).toString(),
      (await testERC1155.balanceOf(accounts[0], '1')).toString(),
    )

    return assert.isTrue(true);
  });

});
