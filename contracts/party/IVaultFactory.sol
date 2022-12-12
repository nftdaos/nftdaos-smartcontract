//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVaultFactory {
    /// @notice the mapping of vault number to vault address
    function vaults(uint256) external returns (address);
    function mint(
        string memory _name,
        string memory _symbol,
        address[] memory _tokens,
        uint256[] memory _ids,
        uint256 _supply,
        uint256 _treasuryBalance,
        uint256 _listPrice,
        uint256 _exitLength
    ) external  returns (uint256);
}
