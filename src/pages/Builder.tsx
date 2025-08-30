import { useState } from "react";
import { Node, useNodesState, ReactFlowProvider } from "reactflow";
import { Layout } from "@/components/Layout";
import { Sidebar } from "@/components/Sidebar";
import { DaoCanvas } from "@/components/DaoCanvas";
import { ConfigurationPanel } from "@/components/ConfigurationPanel";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { Sheet } from "@/components/ui/sheet";

const initialNodes: Node[] = [];
let id = 1;
const getId = () => `${id++}`;

const BuilderPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDeploySheetOpen, setIsDeploySheetOpen] = useState(false);

  const handleNodeDataChange = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
    }
  };

  const addNode = (type: string) => {
    const newNode: Node = {
      id: getId(),
      type,
      position: { x: Math.random() * 250 + 100, y: Math.random() * 150 + 50 },
      data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <ReactFlowProvider>
       <Sheet open={isDeploySheetOpen} onOpenChange={setIsDeploySheetOpen}>
        <Layout
          onDeployClick={() => setIsDeploySheetOpen(true)}
          sidebar={<Sidebar addNode={addNode} />}
          configPanel={<ConfigurationPanel selectedNode={selectedNode} onNodeDataChange={handleNodeDataChange} />}
        >
          <DaoCanvas
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            onNodeSelect={setSelectedNode}
          />
        </Layout>
        <DeploymentPanel />
      </Sheet>
    </ReactFlowProvider>
  );
};

export default BuilderPage;