# constant-fdao-program

This program create a dao from NFT, staking and auction ..

# Setting.sol 
This is a generic settings contract to be owned by fdao.
It allows for Fdao admin to set parameters for all dao. It also allow update logic contract upgradeable. 
# VaultFactory.sol 
## mint 
Function allow user to mint a new dao from NFT
> 1. `[_name]` desired name of the dao
> 2. `[_symbol]` desired symbol of the dao
> 3. `[token]` The loan info account, it will hold all necessary info about the trade.
> 4. `[_id]` The uint256 ID of the token
> 5. `[supply]` Total dao supply
> 6. `[__treasuryBalance]` Amount from supply to treasury balance
> 7. `[__exitLength]` Time exit to dao start auction
> 8. `` return the ID of the vault

# TokenVault.sol 
Price and function for auctions contract 
## UpdateUserPrice 
Allow user can update expected price for NFT 
> 1. `[__new]` price want to set
## exitPrice() 
Average price expected from all users
## exitReducePrice() 
Expected reduce by time after exitLength
## Start
The function called to kick off an auction.
> 1. `[bidPrice]` price nft want to bid WETH
> 2. `[reqValue]` price subtract balance token user hold
##Bid
The function called for all subsequent auction bids.
> 1. `[bidPrice]` price nft want to bid WETH
> 2. `[reqValue]` price subtract balance token user hold
## End
The function called when the auction timer is up and ended.
bidPrice
## Cash
The function called for token owners to cash out their share of the WETH used to purchase the underlying NFT.
## initialize
Function init dao from VaultFactory.sol mint function call
## initializeMint
Function init treasury and govern for dao
# TokenVaultTreasury.sol
## initialize
Init treasury from a dao
> 1. `[_sToken]` address token to init
> 2. `[reqValue]` volume token init to treasury
## stakingInitialize
Init staking for a dao
> 1. `[_stakeAddr]` address staking to init
> 2. `[_epochTotal]`time to staking
## addRewardToken
Add token for treasury
> 1. `[__addr]` address token to add
## shareReward
Share treasury reward
## terminated
Terminated treasury
# TokenVaultStaking.sol
## initialize
Init dao staking
> 1. `[_sToken]` address token to init
> 2. `[__uri]` token uri
> 3. `[__treasury]` address treasury to init
> 4. `[__p1Duration]`time of pool1
> 5. `[__p2Duration]`time of pool2
## addRewardToken
Add token for staking
> 1. `[__addr]` address token to add
## removeRewardToken
Remove a reward token
> 1. `[_rewardToken]` address token to remove
## updateSharedPerToken
update share reward all reward token
## deposit
> 1. `[amount]` amount token to staking
> 2. `[poolId]` pool Id(2 pool 6 month and 12 month)
Allow user staking
## withdraw
> 1. `[sId]` staking Id
> 2. `[amount]` amount to withdraw
Allow user unstaking
# TokenVaultGovernor.sol
Online proposal function base on dao holder token delegate
## propose
Create proposal
> 1. `targets[]` interact with Token contract ["token"]
> 2. `values[]` is the amount of native tokens (ETH) to send
> 3. `calldata[]` is what to call on token contract( call stakingInitialize)
> 4. `description` description
> 5.``` return uint256 proposalId
## castVote
Allow dao holder can voting with token delegate power
> 1. `proposalId`  proposalId
> 2. `support` 0 Against, 1 For, 2 Abstain
## execute
Excute proposal after proposal end, sucess voting, call token contract function(e.g stakingInitialize)
> 1. `targets[]` interact with Token contract ["token"]
> 2. `values[]` is the amount of native tokens (ETH) to send
> 3. `calldata[]` is what to call on token contract(now call stakingInitialize)
> 4. `descriptionHash` generate from description
