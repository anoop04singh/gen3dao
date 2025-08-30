import { type WalletClient, type PublicClient, type Address } from 'viem';
import { Node, Edge } from 'reactflow';
import { deployToken, deployGovernor, deployTimelock, deployTreasury, deployContract } from './deployment';
import { compileContracts } from './compiler';

type DeployedContracts = Map<string, Address>;
type StatusCallback = (message: string) => void;

const getDeploymentOrder = (nodes: Node[]): Node[] => {
    const order: { [key: string]: number } = { token: 0, governor: 1, timelock: 2, treasury: 3, ai: 4 };
    const deployableNodes = nodes.filter(node => node.type && order[node.type] !== undefined);
    return deployableNodes.sort((a, b) => (order[a.type!] || 99) - (order[b.type!] || 99));
};

const findDependencyAddress = (nodeId: string, edges: Edge[], dependencyType: string, nodeMap: Map<string, Node>, deployedContracts: DeployedContracts): Address | undefined => {
    const edge = edges.find(e => 
        (e.target === nodeId && nodeMap.get(e.source)?.type === dependencyType) ||
        (e.source === nodeId && nodeMap.get(e.target)?.type === dependencyType)
    );
    if (!edge) return undefined;
    const dependencyNodeId = nodeMap.get(edge.source)?.type === dependencyType ? edge.source : edge.target;
    return deployedContracts.get(dependencyNodeId);
};

const getContractNameFromNode = (node: Node): string => {
    switch(node.type) {
        case 'token': return (node.data.name || 'MyToken').replace(/\s+/g, '');
        case 'governor': return 'Governor';
        case 'timelock': return 'Timelock';
        case 'treasury': return 'Treasury';
        case 'ai': return (node.data.label || 'CustomModule').replace(/\s+/g, '');
        default: throw new Error(`Unknown node type for contract name: ${node.type}`);
    }
};

export const deployDAO = async (
  nodes: Node[],
  edges: Edge[],
  contracts: { filename: string, code: string }[],
  walletClient: WalletClient,
  publicClient: PublicClient,
  updateStatus: StatusCallback
): Promise<{ deployedContracts: DeployedContracts, daoAddress: Address }> => {
  updateStatus("Compiling smart contracts...");
  const compiledContracts = await compileContracts(contracts);
  updateStatus("✅ Contracts compiled successfully.");

  const deployedContracts: DeployedContracts = new Map();
  const deploymentOrder = getDeploymentOrder(nodes);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  let daoAddress: Address | null = null;

  for (const node of deploymentOrder) {
    let contractAddress: Address | undefined;
    const contractName = getContractNameFromNode(node);
    const artifact = compiledContracts[contractName];

    if (!artifact) {
        updateStatus(`⚠️ Could not find compiled artifact for ${contractName}. Skipping.`);
        continue;
    }

    updateStatus(`Deploying ${node.data.label || node.type}...`);

    try {
        switch (node.type) {
            case 'token':
                contractAddress = await deployToken(walletClient, publicClient, node, artifact);
                break;
            case 'governor':
                const tokenAddress = findDependencyAddress(node.id, edges, 'token', nodeMap, deployedContracts);
                if (!tokenAddress) throw new Error("Governor requires a connection to a Token node.");
                const timelockForGov = findDependencyAddress(node.id, edges, 'timelock', nodeMap, deployedContracts);
                const constructorArgs = timelockForGov ? [tokenAddress, timelockForGov] : [tokenAddress];
                contractAddress = await deployGovernor(walletClient, publicClient, node, artifact, constructorArgs);
                daoAddress = contractAddress;
                break;
            case 'timelock':
                const governorAddress = findDependencyAddress(node.id, edges, 'governor', nodeMap, deployedContracts);
                if (!governorAddress) throw new Error("Timelock requires a connection to a Governor node.");
                contractAddress = await deployTimelock(walletClient, publicClient, node, artifact, [governorAddress]);
                break;
            case 'treasury':
                const timelockOwner = findDependencyAddress(node.id, edges, 'timelock', nodeMap, deployedContracts);
                const governorOwner = findDependencyAddress(node.id, edges, 'governor', nodeMap, deployedContracts);
                const ownerAddress = timelockOwner || governorOwner;
                if (!ownerAddress) throw new Error("Treasury requires a connection from a Timelock or Governor node.");
                contractAddress = await deployTreasury(walletClient, publicClient, node, artifact, [ownerAddress]);
                break;
            case 'ai':
                const aiOwner = daoAddress;
                if (!aiOwner) throw new Error("AI Module requires a Governor to be deployed first to act as owner.");
                contractAddress = await deployContract(walletClient, publicClient, node, artifact, [aiOwner]);
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
        throw error;
    }
  }

  if (!daoAddress) {
    throw new Error("DAO deployment failed: Could not determine main DAO address (Governor). Ensure a Governor node is present.");
  }

  return { deployedContracts, daoAddress };
};