"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Network, Bot, Rocket } from "lucide-react";

interface HeaderProps {
  onDeployClick: () => void;
}

export const Header = ({ onDeployClick }: HeaderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedChain, setSelectedChain] = useState("sepolia");

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card z-10">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6" />
        <h1 className="text-xl font-bold">AI DAO Creator</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsConnected(!isConnected)} variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {isConnected ? "Wallet Connected" : "Connect Wallet"}
        </Button>
        <Button onClick={onDeployClick}>
          <Rocket className="mr-2 h-4 w-4" />
          Deploy
        </Button>
      </div>
    </header>
  );
};