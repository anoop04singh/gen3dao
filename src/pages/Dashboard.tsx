import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, usePublicClient } from "wagmi";
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
  const publicClient = usePublicClient();
  const [daos, setDaos] = useState<DaoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDaos = async () => {
      if (!isConnected || !publicClient) return;
      setIsLoading(true);
      setError(null);
      console.log("Dashboard: Starting DAO fetch...");

      try {
        console.log("Dashboard: Fetching contract events...");
        const events = await publicClient.getContractEvents({
          address: daoRegistryAddress,
          abi: daoRegistryAbi,
          eventName: 'DAORegistered',
          fromBlock: 0n,
          toBlock: 'latest',
        });
        console.log(`Dashboard: Found ${events.length} registration events.`);

        const daoMap = new Map<string, string>();
        events.forEach(event => {
          if (event.args.daoAddress && event.args.cid) {
            daoMap.set(event.args.daoAddress, event.args.cid);
          }
        });
        
        const uniqueDaos = Array.from(daoMap.entries()).map(([daoAddress, cid]) => ({ daoAddress, cid }));
        console.log(`Dashboard: Processing ${uniqueDaos.length} unique DAOs.`);

        const metadataPromises = uniqueDaos.map(async (dao) => {
          try {
            const response = await fetch(`https://ipfs.io/ipfs/${dao.cid}`);
            if (!response.ok) throw new Error(`Failed to fetch metadata for CID ${dao.cid}`);
            const metadata = await response.json();
            return { ...dao, name: metadata.name, description: metadata.description };
          } catch (e) {
            console.error(`Dashboard: Failed to fetch or parse metadata for ${dao.cid}`, e);
            return { ...dao, name: "Metadata not found", description: "Could not load details from IPFS." };
          }
        });

        const resolvedDaos = await Promise.all(metadataPromises);
        console.log("Dashboard: Fetched all metadata. Final DAO list:", resolvedDaos);
        setDaos(resolvedDaos);

      } catch (e) {
        console.error("Dashboard: An error occurred while fetching DAOs:", e);
        setError("Failed to fetch DAOs from the blockchain. Please check your network and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDaos();
  }, [isConnected, publicClient, address]);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <Card className="max-w-md mx-auto mt-10">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Please connect your wallet to view and manage your DAOs.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (daos.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No DAOs Found</CardTitle>
            <CardDescription>You haven't deployed any DAOs yet. Once you deploy a DAO from the builder, it will appear here.</CardDescription>
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