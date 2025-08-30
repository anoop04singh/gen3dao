import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useReadContract } from "wagmi";
import { daoRegistryAddress, daoRegistryAbi } from "@/lib/contracts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DaoInfo {
  daoAddress: string;
  cid: string;
  name?: string;
  description?: string;
}

const DashboardPage = () => {
  const { isConnected, address } = useAccount();
  const [daos, setDaos] = useState<DaoInfo[]>([]);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const { data: userDaosData, isLoading: isContractLoading, error: contractError } = useReadContract({
    address: daoRegistryAddress,
    abi: daoRegistryAbi,
    functionName: 'getDAOsByUser',
    args: [address!],
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!userDaosData) return;

      const [daoAddresses, cids] = userDaosData;
      console.log(`Dashboard: Found ${cids.length} DAOs for user ${address}.`);
      if (cids.length === 0) {
        setDaos([]);
        return;
      }

      setIsFetchingMetadata(true);
      
      const metadataPromises = cids.map(async (cid, index) => {
        const daoAddress = daoAddresses[index];
        try {
          const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
          if (!response.ok) throw new Error(`Failed to fetch metadata for CID ${cid}`);
          const metadata = await response.json();
          return { daoAddress, cid, name: metadata.name, description: metadata.description };
        } catch (e) {
          console.error(`Dashboard: Failed to fetch or parse metadata for ${cid}`, e);
          return { daoAddress, cid, name: "Metadata not found", description: "Could not load details from IPFS." };
        }
      });

      const resolvedDaos = await Promise.all(metadataPromises);
      console.log("Dashboard: Fetched all metadata. Final DAO list:", resolvedDaos);
      setDaos(resolvedDaos.reverse()); // Show most recent first
      setIsFetchingMetadata(false);
    };

    fetchMetadata();
  }, [userDaosData, address]);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <Card className="max-w-md mx-auto mt-10">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Please connect your wallet to view your DAOs.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    if (isContractLoading || isFetchingMetadata) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (contractError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch DAOs from the blockchain. Please ensure you have deployed the new contract and updated the address in the code.
            <p className="text-xs mt-2">({contractError.shortMessage})</p>
          </AlertDescription>
        </Alert>
      );
    }

    if (daos.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No DAOs Found</CardTitle>
            <CardDescription>You haven't registered any DAOs with this wallet yet. Once you register a DAO from the builder, it will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Create a DAO</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {daos.map((dao) => (
          <Card key={dao.daoAddress}>
            <CardHeader>
              <CardTitle className="truncate">{dao.name || "Unnamed DAO"}</CardTitle>
              <CardDescription className="truncate">{dao.description || "No description."}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground break-all">
                Address: {dao.daoAddress}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
        <h1 className="text-xl font-bold">My DAOs</h1>
        <Button asChild variant="outline">
          <Link to="/">Back to Builder</Link>
        </Button>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div className="container mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;