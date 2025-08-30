import { useState } from "react";
import { Node, Edge } from "reactflow";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateDaoContracts as generatePlaceholderContracts } from "@/lib/contract-generator";
import { generateFinalContractsFromAI } from "@/lib/gemini";
import { Bot, FileCode, Loader, AlertTriangle } from "lucide-react";

interface DeploymentPanelProps {
  nodes: Node[];
  edges: Edge[];
}

export const DeploymentPanel = ({ nodes, edges }: DeploymentPanelProps) => {
  const [contracts, setContracts] = useState<{ filename: string, code: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateContracts = async () => {
    setIsGenerating(true);
    setError(null);
    setContracts([]);

    try {
      const placeholders = generatePlaceholderContracts(nodes, edges);
      if (placeholders.length === 0) {
        throw new Error("No contracts could be generated. Please add and connect nodes on the canvas.");
      }
      const finalContracts = await generateFinalContractsFromAI(nodes, edges, placeholders);
      setContracts(finalContracts);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="text-center p-8 border rounded-lg bg-muted h-full flex flex-col justify-center items-center">
          <Loader className="h-12 w-12 mb-4 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">
            AI is writing your smart contracts...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 border rounded-lg bg-destructive/10 border-destructive/50 h-full flex flex-col justify-center items-center">
          <AlertTriangle className="h-12 w-12 mb-4 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Generation Failed</p>
          <p className="text-xs text-destructive/80 mt-2">{error}</p>
        </div>
      );
    }

    if (contracts.length === 0) {
      return (
        <div className="text-center p-8 border rounded-lg bg-muted h-full flex flex-col justify-center items-center">
          <Bot className="h-12 w-12 mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Your generated smart contracts will appear here.
          </p>
        </div>
      );
    }

    return (
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
    );
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
        <Button onClick={handleGenerateContracts} className="w-full" disabled={isGenerating}>
          {isGenerating ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileCode className="mr-2 h-4 w-4" />
          )}
          Generate Smart Contracts
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      
      <div className="mt-auto pt-4">
        <Button disabled className="w-full">
            Deploy to Network (Coming Soon)
        </Button>
      </div>
    </SheetContent>
  );
};