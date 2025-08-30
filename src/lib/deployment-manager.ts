import { type WalletClient, type PublicClient, type Address } from 'viem';
import { Node, Edge } from 'reactflow';
import { deployToken, deployGovernor, deployTimelock, deployTreasury } from './deployment';

type DeployedContracts = Map<string, Address>; // Map from node ID to contract address
type StatusCallback = (message: string) => void;

const getDeploymentOrder = (nodes: Node[]): Node[] => {
    const order: { [key: string]: number } = { token: 0, governor: 1, timelock: 2, treasury: 3, ai: 4 };
    const deployableNodes = nodes.filter(node => node.type && order[node.type] !== undefined);
    return deployableNodes.sort((a, b) => (order[a.type!] || 99) - (order[b.type!] || 99));
};

const findDependencyAddress = (node: Node, edges: Edge[], dependencyType: string, nodeMap: Map<string, Node>, deployedContracts: DeployedContracts): Address | undefined => {
    const edge = edges.find(e => e.target === node.id && nodeMap.get(e.source)?.type === dependencyType);
    return edge ? deployedContracts.get(edge.source) : undefined;
};

export const deployDAO = async (
  nodes: Node[],
  edges: Edge[],
  walletClient: WalletClient,
  publicClient: PublicClient,
  updateStatus: StatusCallback
): Promise<{ deployedContracts: DeployedContracts, daoAddress: Address }> => {
  const deployedContracts: DeployedContracts = new Map();
  const deploymentOrder = getDeploymentOrder(nodes);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  let daoAddress: Address | null = null;

  for (const node of deploymentOrder) {
    let contractAddress: Address | undefined;
    updateStatus(`Deploying ${node.data.label || node.type}...`);

    try {
        switch (node.type) {
            case 'token':
                contractAddress = await deployToken(walletClient, publicClient, node);
                break;
            case 'governor':
                const tokenAddress = findDependencyAddress(node, edges, 'token', nodeMap, deployedContracts);
                if (!tokenAddress) throw new Error("Governor requires a connection from a Token node.");
                contractAddress = await deployGovernor(walletClient, publicClient, node, tokenAddress);
                daoAddress = contractAddress; // Governor is the main DAO address
                break;
            case 'timelock':
                const governorAddressForTimelock = findDependencyAddress(node, edges, 'governor', nodeMap, deployedContracts);
                if (!governorAddressForTimelock) throw new Error("Timelock requires a connection from a Governor node.");
                contractAddress = await deployTimelock(walletClient, publicClient, node, governorAddressForTimelock);
                break;
            case 'treasury':
                const timelockAddress = findDependencyAddress(node, edges, 'timelock', nodeMap, deployedContracts);
                const governorAddressForTreasury = findDependencyAddress(node, edges, 'governor', nodeMap, deployedContracts);
                const ownerAddress = timelockAddress || governorAddressForTreasury;
                if (!ownerAddress) throw new Error("Treasury requires a connection from a Timelock or Governor node.");
                contractAddress = await deployTreasury(walletClient, publicClient, node, ownerAddress);
                break;
            default:
                updateStatus(`Skipping deployment for ${node.type} (not implemented).`);
                continue;
        }

        if (contractAddress) {
            deployedContracts.set(node.id, contractAddress);
            updateStatus(`✅ ${node.data.label || node.type} deployed at: ${contractAddress}`);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        updateStatus(`❌ Error deploying ${node.data.label || node.type}: ${errorMessage}`);
        throw error; // Stop deployment on first error
    }
  }

  if (!daoAddress) {
    const governorNode = nodes.find(n => n.type === 'governor');
    if (governorNode) {
        daoAddress = deployedContracts.get(governorNode.id) || null;
    }
    if (!daoAddress) {
        throw new Error("DAO deployment failed: Could not determine main DAO address (Governor). Ensure a Governor node is present.");
    }
  }

  return { deployedContracts, daoAddress };
};