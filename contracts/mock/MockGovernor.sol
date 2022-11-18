pragma solidity >=0.4.22 <0.9.0;

contract MockGovernor {
    //
    mapping(uint256 => uint8) public castVotes;
    mapping(uint256 => bool) public castVoteChecks;

    constructor() public {}

    event CastVote(uint256 proposalId, uint8 support);

    function castVote(uint256 proposalId, uint8 support)
        external
        returns (uint256)
    {
        castVotes[proposalId] = support;
        castVoteChecks[proposalId] = true;
        emit CastVote(proposalId, support);
        return 0;
    }

    function castVote(uint256 proposalId) external
        returns (uint256)
    {

    }
     enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

     function state(uint256 proposalId) public view virtual  returns (ProposalState) {
         if(proposalId==1){
          return ProposalState.Canceled;
         }
         else if(proposalId==2){
              return ProposalState.Pending;
         }
           return ProposalState.Pending;

     }

}
