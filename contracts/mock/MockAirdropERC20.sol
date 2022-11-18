//SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../libraries/openzeppelin/token/ERC20/ERC20.sol";
import "../libraries/openzeppelin/token/ERC20/ERC20Burnable.sol";
import "../libraries/openzeppelin/GSN/Context.sol";

contract MockAirdropERC20 is ERC20, ERC20Burnable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function claimTokens() external {
        _mint(msg.sender, 1234 * (10**decimals()));
    }
}
