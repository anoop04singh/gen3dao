import { useState } from "react";
import { Node, Edge } from "reactflow";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateDaoContracts } from "@/lib/contract-generator";
import { Bot, FileCode } from "lucide-react";

interface DeploymentPanelProps {
  nodes: Node[];
  edges: Edge[];
}

export const DeploymentPanel = ({ nodes, edges }: DeploymentPanelProps) => {
  const [contracts, setContracts] = useState<{ filename: string, code: string }[]>([]);

  const handleGenerateContracts = () => {
    const generated = generateDaoContracts(nodes, edges);
    setContracts(generated);
  };

  return (
    <SheetContent className="w-[500px] sm:w-[640px] flex flex-col">
      <SheetHeader>
        <SheetTitle>Deploy DAO</SheetTitle>
        <SheetDescription>
          Generate and review your DAO's smart contracts before deployment.
        </SheetDescription>
      </SheetHeader>
      
      <div className="py-4">
        <Button onClick={handleGenerateContracts} className="w-full">
          <FileCode className="mr-2 h-4 w-4" />
          Generate Smart Contracts
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {contracts.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted h-full flex flex-col justify-center items-center">
            <Bot className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your generated smart contracts will appear here.
            </p>
          </div>
        ) : (
          <Tabs defaultValue={contracts[0].filename} className="h-full flex flex-col">
            <TabsList>
              {contracts.map(contract => (
                <TabsTrigger key={contract.filename} value={contract.filename}>
                  {contract.filename}
                </TabsTrigger>
              ))}
            </TabsList>
            {contracts.map(contract => (
              <TabsContent key={contract.filename} value={contract.filename} className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <pre className="text-xs bg-muted p-4 rounded-md">
                    <code>{contract.code}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      
      <div className="mt-auto pt-4">
        <Button disabled className="w-full">
            Deploy to Network (Coming Soon)
        </Button>
      </div>
    </SheetContent>
  );
};