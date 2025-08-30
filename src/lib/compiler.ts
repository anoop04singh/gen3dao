export interface CompiledContract {
  abi: any[];
  bytecode: `0x${string}`;
}

export const compileContracts = (
  contracts: { filename: string; code: string }[]
): Promise<{ [contractName: string]: CompiledContract }> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.compiledContracts);
      }
      worker.terminate();
    };

    worker.onerror = (e) => {
      reject(new Error(`Compiler worker error: ${e.message}`));
      worker.terminate();
    };

    worker.postMessage({ contracts });
  });
};