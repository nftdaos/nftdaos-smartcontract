pragma solidity >=0.4.22 <0.9.0;

import {ERC1155} from "../libraries/openzeppelin/token/ERC1155/ERC1155.sol";

contract TestERC1155 is ERC1155 {
    constructor() ERC1155("") {}

    function mint(
        address user,
        uint256 id,
        uint256 amount
    ) public virtual {
        _mint(user, id, amount, "");
    }
}
