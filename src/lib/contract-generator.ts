import { Node, Edge } from 'reactflow';

const generateTokenContract = (node: Node): string => {
  const name = node.data.name || 'MyToken';
  const symbol = node.data.symbol || 'TKN';
  const supply = node.data.supply || 1000000;

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ${name}
 * @dev A simple ERC20-like token for governance.
 */
contract ${name.replace(/\s+/g, '')} {
    string public name = "${name}";
    string public symbol = "${symbol}";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor() {
        totalSupply = ${supply} * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
    }
}
`;
};

const generateVotingContract = (node: Node, tokenContractName: string): string => {
  const quorum = node.data.quorum || 51;
  const votingPeriod = node.data.period || 7;

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./${tokenContractName}.sol";

/**
 * @title Governor
 * @dev A simple governance contract.
 */
contract Governor {
    ${tokenContractName} public token;
    uint256 public quorumPercentage = ${quorum};
    uint256 public votingPeriodDays = ${votingPeriod};

    constructor(address _tokenAddress) {
        token = ${tokenContractName}(_tokenAddress);
    }

    // Note: This is a simplified placeholder for demonstration.
    // A full implementation would include proposal creation, voting logic, and execution.
}
`;
};

const generateTreasuryContract = (): string => {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Treasury
 * @dev Manages the DAO's funds. Can only be controlled by its owner (the Governor contract).
 */
contract Treasury {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    receive() external payable {}

    function withdraw(uint amount, address payable to) external {
        require(msg.sender == owner, "Only the owner can withdraw");
        to.transfer(amount);
    }
}
`;
};

export const generateDaoContracts = (nodes: Node[], edges: Edge[]): { filename: string, code: string }[] => {
  const contracts: { filename: string, code: string }[] = [];
  const tokenNode = nodes.find(n => n.type === 'token');
  const votingNode = nodes.find(n => n.type === 'voting');
  const treasuryNode = nodes.find(n => n.type === 'treasury');

  let tokenContractName = '';

  if (tokenNode) {
    tokenContractName = (tokenNode.data.name || 'MyToken').replace(/\s+/g, '');
    contracts.push({
      filename: `${tokenContractName}.sol`,
      code: generateTokenContract(tokenNode),
    });
  }

  if (votingNode) {
    const isConnectedToToken = edges.some(edge => 
      (edge.source === tokenNode?.id && edge.target === votingNode.id) ||
      (edge.target === tokenNode?.id && edge.source === votingNode.id)
    );

    if (isConnectedToToken && tokenContractName) {
      contracts.push({
        filename: 'Governor.sol',
        code: generateVotingContract(votingNode, tokenContractName),
      });
    } else {
       contracts.push({
        filename: 'Governor.sol',
        code: `// Note: The Voting contract is not connected to a Token contract.\n// Please connect it to a Token node to define voting power.\n`
      });
    }
  }

  if (treasuryNode) {
    contracts.push({
      filename: 'Treasury.sol',
      code: generateTreasuryContract(),
    });
  }

  return contracts;
};