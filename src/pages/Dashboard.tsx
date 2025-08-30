import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";

const DashboardPage = () => {
  const { isConnected } = useAccount();

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
          {isConnected ? (
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
          ) : (
            <Card className="max-w-md mx-auto mt-10">
              <CardHeader className="text-center">
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>Please connect your wallet to view and manage your DAOs.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Use the "Connect Wallet" button in the builder's header to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;