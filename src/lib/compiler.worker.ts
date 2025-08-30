import * as solc from 'solc';

self.onmessage = (e) => {
  const { contracts } = e.data;

  const sources = contracts.reduce((acc: any, contract: { filename: string, code: string }) => {
    acc[contract.filename] = { content: contract.code };
    return acc;
  }, {});

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
      const errorMessages = output.errors
        .filter((err: any) => err.severity === 'error')
        .map((err: any) => err.formattedMessage)
        .join('\n');
      if (errorMessages.length > 0) {
        throw new Error(errorMessages);
      }
    }
    
    const compiledContracts: { [contractName: string]: any } = {};
    for (const fileName in output.contracts) {
      for (const contractName in output.contracts[fileName]) {
        compiledContracts[contractName] = {
          abi: output.contracts[fileName][contractName].abi,
          bytecode: `0x${output.contracts[fileName][contractName].evm.bytecode.object}`,
        };
      }
    }

    self.postMessage({ compiledContracts });
  } catch (error: any) {
    self.postMessage({ error: error.message });
  }
};