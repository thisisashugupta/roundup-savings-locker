import { alchemyRpcUrl } from "@/config";

const useTransactionApis = () => {
  const getUserOperationByHash = async (userOpHash: string) => {
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
    };

    const body = JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_getUserOperationByHash",
      params: [userOpHash],
    });

    try {
      const response = await fetch(alchemyRpcUrl, {
        method: "POST",
        headers: headers,
        body: body,
      });
      const data = await response.json();
      return data.result.transactionHash;
    } catch (e) {
      console.error(e);
    }
  };

  async function getTransactionReceipt(txHash: string) {
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
    };

    const body = JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [txHash],
    });

    try {
      const response = await fetch(alchemyRpcUrl, {
        method: "POST",
        headers: headers,
        body: body,
      });

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return { getUserOperationByHash, getTransactionReceipt };
};

export default useTransactionApis;
