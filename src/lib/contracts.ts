import { sepolia } from 'wagmi/chains';

// The addresses of your deployed DAORegistryV2 contracts, mapped by chain ID
export const daoRegistryAddresses: { [chainId: number]: `0x${string}` } = {
  545: '0x37D50136Ac1f6010AC6C4B67893434B366AF0aaF', // Flow EVM Testnet
  [sepolia.id]: '0xF95e4594f90436E26A349b7f5B31f592be790547', // Sepolia Testnet
};

export const daoRegistryAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "registrar",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "daoAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "cid",
				"type": "string"
			}
		],
		"name": "DAORegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_daoAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_cid",
				"type": "string"
			}
		],
		"name": "registerDAO",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getDAOsByUser",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "addresses",
				"type": "address[]"
			},
			{
				"internalType": "string[]",
				"name": "cids",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;