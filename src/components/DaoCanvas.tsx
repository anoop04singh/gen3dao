"use client";

import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  OnNodesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TokenNode } from './nodes/TokenNode';
import { VotingNode } from './nodes/VotingNode';
import { TreasuryNode } from './nodes/TreasuryNode';

const initialNodes: Node[] = [];

let id = 1;
const getId = () => `${id++}`;

interface DaoCanvasProps {
  onNodeSelect: (node: Node | null) => void;
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  onNodesChange: OnNodesChange;
}

const DaoCanvasComponent = ({ onNodeSelect, nodes, setNodes, onNodesChange }: DaoCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const nodeTypes = useMemo(() => ({
    token: TokenNode,
    voting: VotingNode,
    treasury: TreasuryNode,
  }), []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
        y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
      });
      
      const label = `${type.charAt(0).toUpperCase() + type.slice(1)} Node`;
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeSelect(node);
  }, [onNodeSelect]);

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export const DaoCanvasProvider = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeDataChange = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
    // Also update the selected node state if it's the one being changed
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
    }
  };

  return (
    <ReactFlowProvider>
      <Layout
        configPanel={<ConfigurationPanel selectedNode={selectedNode} onNodeDataChange={handleNodeDataChange} />}
      >
        <DaoCanvasComponent
          onNodeSelect={setSelectedNode}
          nodes={nodes}
          setNodes={setNodes}
          onNodesChange={onNodesChange}
        />
      </Layout>
    </ReactFlowProvider>
  );
};