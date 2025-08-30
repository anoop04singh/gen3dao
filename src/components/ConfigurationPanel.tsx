import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node } from 'reactflow';

interface ConfigurationPanelProps {
  selectedNode: Node | null;
  onNodeDataChange: (nodeId: string, data: any) => void;
}

const TokenConfig = ({ node, onNodeDataChange }: { node: Node, onNodeDataChange: (nodeId: string, data: any) => void }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="token-name">Token Name</Label>
      <Input id="token-name" value={node.data.name || ''} onChange={(e) => onNodeDataChange(node.id, { ...node.data, name: e.target.value })} />
    </div>
    <div>
      <Label htmlFor="token-symbol">Symbol</Label>
      <Input id="token-symbol" value={node.data.symbol || ''} onChange={(e) => onNodeDataChange(node.id, { ...node.data, symbol: e.target.value })} />
    </div>
    <div>
      <Label htmlFor="token-supply">Initial Supply</Label>
      <Input id="token-supply" type="number" value={node.data.supply || ''} onChange={(e) => onNodeDataChange(node.id, { ...node.data, supply: e.target.value })} />
    </div>
  </div>
);

const VotingConfig = ({ node, onNodeDataChange }: { node: Node, onNodeDataChange: (nodeId: string, data: any) => void }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="quorum">Quorum (%)</Label>
      <Input id="quorum" type="number" value={node.data.quorum || ''} onChange={(e) => onNodeDataChange(node.id, { ...node.data, quorum: e.target.value })} />
    </div>
    <div>
      <Label htmlFor="threshold">Proposal Threshold</Label>
      <Input id="threshold" type="number" value={node.data.threshold || ''} onChange={(e) => onNodeDataChange(node.id, { ...node.data, threshold: e.target.value })} />
    </div>
    <div>
      <Label htmlFor="voting-period">Voting Period (days)</Label>
      <Input id="voting-period" type="number" value={node.data.period || ''} onChange={(e) => onNodeDataChange(node.id, { ...node.data, period: e.target.value })} />
    </div>
  </div>
);

export const ConfigurationPanel = ({ selectedNode, onNodeDataChange }: ConfigurationPanelProps) => {
  const renderContent = () => {
    if (!selectedNode) {
      return <p className="text-sm text-muted-foreground text-center">Select a node to configure it.</p>;
    }

    switch (selectedNode.data.label) {
      case 'Token Node':
        return <TokenConfig node={selectedNode} onNodeDataChange={onNodeDataChange} />;
      case 'Voting Node':
        return <VotingConfig node={selectedNode} onNodeDataChange={onNodeDataChange} />;
      case 'Treasury Node':
        return <p className="text-sm text-muted-foreground">No configuration available for Treasury.</p>;
      default:
        return <p className="text-sm text-muted-foreground">This node cannot be configured.</p>;
    }
  };

  return (
    <aside className="bg-card border-l h-full p-4">
      <h2 className="text-lg font-semibold mb-4">Configuration</h2>
      <div className="p-4 border rounded-lg bg-muted/40 h-full">
        {renderContent()}
      </div>
    </aside>
  );
};