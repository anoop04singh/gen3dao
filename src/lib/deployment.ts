import { type WalletClient, type PublicClient, type Address, type Abi } from 'viem';
import { Node } from 'reactflow';

export interface ContractArtifact {
  abi: Abi;
  bytecode: `0x${string}`;
}

const deployContractInternal = async (
    walletClient: WalletClient,
    publicClient: PublicClient,
    artifact: ContractArtifact,
    args: unknown[] = []
): Promise<Address> => {
    const account = walletClient.account;
    if (!account) throw new Error("Wallet not connected");

    const hash = await walletClient.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        args,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (!receipt.contractAddress) throw new Error("Deployment failed: No contract address found.");
    
    return receipt.contractAddress;
};

export const deployToken = (
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenNode: Node,
  artifact: ContractArtifact
): Promise<Address> => {
  const name = tokenNode.data.name || 'MyToken';
  const symbol = tokenNode.data.symbol || 'TKN';
  const supply = BigInt((tokenNode.data.supply || 1000000) * 10**18);
  return deployContractInternal(walletClient, publicClient, artifact, [name, symbol, supply]);
};

export const deployGovernor = (
  walletClient: WalletClient,
  publicClient: PublicClient,
  _governorNode: Node,
  artifact: ContractArtifact,
  constructorArgs: unknown[]
): Promise<Address> => {
  return deployContractInternal(walletClient, publicClient, artifact, constructorArgs);
};

export const deployTimelock = (
  walletClient: WalletClient,
  publicClient: PublicClient,
  _timelockNode: Node,
  artifact: ContractArtifact,
  constructorArgs: unknown[]
): Promise<Address> => {
  return deployContractInternal(walletClient, publicClient, artifact, constructorArgs);
};

export const deployTreasury = (
  walletClient: WalletClient,
  publicClient: PublicClient,
  _treasuryNode: Node,
  artifact: ContractArtifact,
  constructorArgs: unknown[]
): Promise<Address> => {
  return deployContractInternal(walletClient, publicClient, artifact, constructorArgs);
};

export const deployContract = (
    walletClient: WalletClient,
    publicClient: PublicClient,
    _node: Node,
    artifact: ContractArtifact,
    constructorArgs: unknown[]
): Promise<Address> => {
    return deployContractInternal(walletClient, publicClient, artifact, constructorArgs);
}