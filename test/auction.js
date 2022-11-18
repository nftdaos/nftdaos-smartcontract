
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
const TokenVaultPresale = artifacts.require("TokenVaultPresale");
const TokenVaultBnft = artifacts.require("TokenVaultBnft");


const TokenVaultProxy = artifacts.require("TokenVaultProxy");
const TokenVaultTreasuryProxy = artifacts.require("TokenVaultTreasuryProxy");
const TokenVaultStakingProxy = artifacts.require("TokenVaultStakingProxy");
const TokenVaultGovernorProxy = artifacts.require("TokenVaultGovernorProxy");
const TokenVaultExchangeProxy = artifacts.require("TokenVaultExchangeProxy");
const TokenVaultBnftProxy = artifacts.require("TokenVaultBnftProxy");
const MockGovernor = artifacts.require("MockGovernor");
const truffleAssert = require('truffle-assertions');
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
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function waitAndEvmMine(ms) {
        await sleep(ms)
        await evmMine();
    }

    function evmMine() {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send({
                jsonrpc: "2.0",
                method: "evm_mine",
                id: new Date().getTime()
            }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    };

    let vaultFactory;
    let settings;
    let weth;
    let tokenVaultPresale;
    let mockGovernor;
    let testERC721;
    let testERC7211;

    beforeEach('setup contract', async () => {
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
        await TokenVault.link("TokenVaultTreasuryLogic", tokenVaultTreasuryLogic.address);
        await TokenVaultLogic.link("TokenVaultTreasuryLogic", tokenVaultTreasuryLogic.address);


        const tokenVaultLogic = await TokenVaultLogic.new();

        await TokenVault.link("TokenVaultLogic", tokenVaultLogic.address);
        await TokenVaultGovernor.link("TokenVaultLogic", tokenVaultLogic.address);


        const tokenVaultStakingLogic = await TokenVaultStakingLogic.new();
        await TokenVault.link("TokenVaultStakingLogic", tokenVaultStakingLogic.address);

        const tokenVaultGovermentLogic = await TokenVaultGovernorLogic.new();
        await TokenVault.link("TokenVaultGovernorLogic", tokenVaultGovermentLogic.address);
        await TokenVaultGovernor.link("TokenVaultGovernorLogic", tokenVaultGovermentLogic.address);

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

        let tokenVaultBnft = await TokenVaultBnft.new(settings.address);
        await settings.setBnftImpl(tokenVaultBnft.address);

        // for proxy
        let tokenVaultProxy = await TokenVaultProxy.new(settings.address);
        await settings.setVaultTpl(tokenVaultProxy.address);

        let tokenVaultTreasuryProxy = await TokenVaultTreasuryProxy.new(settings.address);
        await settings.setTreasuryTpl(tokenVaultTreasuryProxy.address);

        let tokenVaultStakingProxy = await TokenVaultStakingProxy.new(settings.address);
        await settings.setStakingTpl(tokenVaultStakingProxy.address);

        let tokenVaultGovernorProxy = await TokenVaultGovernorProxy.new(settings.address);
        await settings.setGovernmentTpl(tokenVaultGovernorProxy.address);

        let tokenVaultExchangeProxy = await TokenVaultExchangeProxy.new(settings.address);
        await settings.setExchangeTpl(tokenVaultExchangeProxy.address);

        let tokenVaultBnftProxy = await TokenVaultBnftProxy.new(settings.address);
        await settings.setBnftTpl(tokenVaultBnftProxy.address);

        vaultFactory = await VaultFactory.new(settings.address);
        vaultFactory = await TransparentUpgradeableProxy.new(
            vaultFactory.address,
            proxyAdmin.address,
            vaultFactory.contract.methods.initialize().encodeABI(),
        );
        vaultFactory = await VaultFactory.at(vaultFactory.address);

        tokenVaultPresale = await TokenVaultPresale.new(settings.address);
        tokenVaultPresale = await TransparentUpgradeableProxy.new(
            tokenVaultPresale.address,
            proxyAdmin.address,
            tokenVaultPresale.contract.methods.initialize().encodeABI(),
        );
        tokenVaultPresale = await TokenVaultPresale.at(tokenVaultPresale.address);

        await settings.setAuctionLength(1800);
        await settings.setAuctionExtendLength(600);
        await settings.setVotingDelayBlock(10);
        await settings.setVotingPeriodBlock(25);
        await settings.setTerm1Duration(6);
        await settings.setTerm2Duration(12);
        await settings.setEpochDuration(2);
        testERC721 = await TestERC721.new('XXX', 'XXX');
        testERC7211 = await TestERC721.new('YYY', 'YYY');
        mockGovernor = await MockGovernor.new();
        testERC721.mint(accounts[0], '1', '');
        testERC721.mint(accounts[0], '2', '');
        testERC721.mint(accounts[0], '3', '');
        testERC721.mint(accounts[0], '4', '');
        testERC721.mint(accounts[0], '5', '');
        testERC721.mint(accounts[0], '6', '');
        testERC721.mint(accounts[0], '7', '');
        testERC721.mint(accounts[0], '8', '');
        testERC721.mint(accounts[0], '9', '');

        testERC7211.mint(accounts[0], '1', '');
        testERC7211.mint(accounts[0], '2', '');
        testERC7211.mint(accounts[0], '3', '');
        testERC7211.mint(accounts[0], '4', '');
        testERC7211.mint(accounts[0], '5', '');
        testERC7211.mint(accounts[0], '6', '');
        testERC7211.mint(accounts[0], '7', '');

        await testERC721.setApprovalForAll(vaultFactory.address, true);
        await testERC7211.setApprovalForAll(vaultFactory.address, true);
        settings.setGovernorSetting(testERC721.address, mockGovernor.address, 5, 5);
        await testERC721.setApprovalForAll(vaultFactory.address, true);
    });


    it("redeem", async function () {
        await vaultFactory.mint('XXX', 'XXX', [testERC7211.address], ['3'], web3.utils.toWei('1', 'ether'), 0, web3.utils.toWei('0.01', 'ether'), 1000);

        let rs = await vaultFactory.vaults('0');
        let tokenVault = await TokenVault.at(rs);

        rs = await tokenVault.treasury();
        let tokenVaultTreasury = await TokenVaultTreasury.at(rs);

        rs = await tokenVault.staking();
        let tokenVaultStaking = await TokenVaultStaking.at(rs);
        await tokenVault.redeem();
        assert.equal(accounts[0], await testERC7211.ownerOf(3));
    });

    it("start-bid-end-cash", async function () {

        await vaultFactory.mint('XXX', 'XXX', [testERC7211.address], ['4'], web3.utils.toWei('1', 'ether'), web3.utils.toWei('0.2', 'ether'), web3.utils.toWei('0.01', 'ether'), 10);

        let rs = await vaultFactory.vaults('0');
        let tokenVault = await TokenVault.at(rs);

        rs = await tokenVault.treasury();
        let tokenVaultTreasury = await TokenVaultTreasury.at(rs);

        rs = await tokenVault.staking();
        let tokenVaultStaking = await TokenVaultStaking.at(rs);

        rs = await tokenVault.government();
        let tokenVaultGovernor = await TokenVaultGovernor.at(rs);

        console.log('tokenVault.nftGovernor()', (await tokenVault.nftGovernor()).toString());

        assert.equal(await tokenVault.balanceOf(tokenVaultTreasury.address), web3.utils.toWei('0.2', 'ether'));
        assert.equal(await tokenVaultStaking.balanceOf(tokenVaultTreasury.address), web3.utils.toWei('0', 'ether'));
        console.log('1 tokenVault.balanceOf(accounts[0]) ' + (await tokenVault.balanceOf(accounts[0])).toString());
        console.log('1 tokenVault.totalSupply() ' + (await tokenVault.totalSupply()));
        assert.equal(await tokenVault.listTokens(0), testERC7211.address);
        assert.equal(await tokenVault.listIds(0), 4);
        assert.equal(await tokenVault.exitLength(), 10);
        assert.equal(await tokenVault.votingTokens(), web3.utils.toWei('0.8', 'ether'));
        assert.equal(await tokenVault.exitPrice(), web3.utils.toWei('0.01', 'ether'));
        assert.equal(tokenVault.address, await testERC7211.ownerOf(4));
        assert.equal(await tokenVault.nftGovernor(), "0x0000000000000000000000000000000000000000");

        await truffleAssert.reverts(
            tokenVault.updateUserPrice(web3.utils.toWei('1.2', 'ether')),
        );
        await tokenVault.updateUserPrice(web3.utils.toWei('0.0105', 'ether'));

        assert.equal((await tokenVault.userPrices(accounts[0])).toString(), web3.utils.toWei('0.0105', 'ether').toString());



        await truffleAssert.reverts(
            tokenVault.redeem({ from: accounts[1] }),
        );

        let voting_token = await tokenVault.votingTokens();
        console.log('tokenVault.voting_token() ' + voting_token.toString());
        console.log('2 tokenVault.balanceOf(accounts[0]) ' + (await tokenVault.balanceOf(accounts[0])).toString());
        await tokenVault.transfer(accounts[1], web3.utils.toWei('0.55', 'ether'), { from: accounts[0] });
        let new_voting_token = await tokenVault.votingTokens();
        console.log('new tokenVault.voting_token() ' + new_voting_token.toString());
        assert.isTrue(new_voting_token < voting_token);

        await truffleAssert.reverts(
            tokenVault.start(web3.utils.toWei('0.1', 'ether'), { from: accounts[0], value: web3.utils.toWei('0.0146875', 'ether') }),
        );
        await truffleAssert.reverts(
            tokenVault.start(web3.utils.toWei('0.001', 'ether'), { from: accounts[0], value: web3.utils.toWei('0.0000146875', 'ether') }),
        );
        await truffleAssert.reverts(
            tokenVault.bid(web3.utils.toWei('0.12', 'ether'), { from: accounts[1], value: web3.utils.toWei('0.105375', 'ether') }),
        );

        await tokenVault.transfer(accounts[0], web3.utils.toWei('0.5', 'ether'), { from: accounts[1] });

        let exit_reducePrice = await tokenVault.exitReducePrice();
        console.log('1await tokenVault.exitReducePrice()', exit_reducePrice.toString());
        await settings.setAuctionLength(5);
        await settings.setAuctionExtendLength(2);
        await sleep(10000);
        let new_exit_reducePrice = await tokenVault.exitReducePrice();
        console.log('1new tokenVault.exitReducePrice()', new_exit_reducePrice.toString());
        assert.isTrue(parseInt(new_exit_reducePrice.toString()) < parseInt(exit_reducePrice.toString()));


        await tokenVault.transfer(accounts[1], web3.utils.toWei('0.05', 'ether'), { from: accounts[0] });

        console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString());

        await tokenVault.start(web3.utils.toWei('0.1', 'ether'), { from: accounts[0], value: web3.utils.toWei('0.0146875', 'ether') });
        await truffleAssert.reverts(
            tokenVault.end({ from: accounts[1] }),
        );
        console.log('tokenVault.start-0');
        console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString());
        assert.equal(await tokenVault.livePrice(), web3.utils.toWei('0.1', 'ether'));
        assert.equal(await tokenVault.winning(), accounts[0]);
        await truffleAssert.reverts(
            tokenVault.bid(web3.utils.toWei('0.02', 'ether'), { from: accounts[1], value: web3.utils.toWei('0.0105375', 'ether') }),
        );

        await tokenVault.bid(web3.utils.toWei('0.12', 'ether'), { from: accounts[1], value: web3.utils.toWei('0.105375', 'ether') });
        assert.equal(await tokenVault.livePrice(), web3.utils.toWei('0.12', 'ether'));
        assert.equal(await tokenVault.winning(), accounts[1]);

        console.log('tokenVault.bid-1');

        console.log('web3.eth.getBalance-0', accounts[0], (await web3.eth.getBalance(accounts[0])).toString());

        await sleep(4000);

        await tokenVault.end({ from: accounts[1] });
        assert.equal(accounts[1], await testERC7211.ownerOf(4));

        await truffleAssert.reverts(
            tokenVault.bid(web3.utils.toWei('0.13', 'ether'), { from: accounts[0], value: web3.utils.toWei('0.107', 'ether') }),
        );

        await truffleAssert.reverts(
            tokenVault.end({ from: accounts[0] }),
        );

        console.log('testERC721.ownerOf-1', accounts[1], (await testERC721.ownerOf(1)).toString())

        console.log('web3.eth.getBalance-tokenVault', tokenVault.address, (await web3.eth.getBalance(tokenVault.address)).toString());

        console.log('web3.eth.getBalance-1', accounts[0], (await web3.eth.getBalance(accounts[0])).toString());
        console.log('totalSupply() ', (await tokenVault.totalSupply().toString()));
        await tokenVault.cash({ from: accounts[0] });
        console.log('new totalSupply() ', (await tokenVault.totalSupply().toString()));
        await truffleAssert.reverts(
            tokenVault.cash({ from: accounts[0] }),
        );
        console.log('web3.eth.getBalance-1', accounts[0], (await web3.eth.getBalance(accounts[0])).toString());
        /* if(new_reduce>=reduce){
            assert.fail("reduce price not working");
        }
         */
        assert.equal((await tokenVault.balanceOf(accounts[0])), 0);
    });
});


