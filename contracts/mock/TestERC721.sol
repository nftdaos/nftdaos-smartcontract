pragma solidity >=0.4.22 <0.9.0;

import {ERC721} from "../libraries/openzeppelin/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
    //
    mapping(uint256 => uint8) public castVotes;

    constructor(string memory name_, string memory symbol_)
        public
        ERC721(name_, symbol_)
    {}

    function mint(
        address _to,
        uint256 _tokenId,
        string memory _tokenURI
    ) public {
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
    }

    function delegate(address delegatee) external {}

    function castVote(uint256 proposalId, uint8 support)
        external
        returns (uint256)
    {
        castVotes[proposalId] = support;
        return 0;
    }
}
