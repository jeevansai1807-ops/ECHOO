import { useCallback, useEffect, useState, memo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import type { Connection, Edge, Node, NodeProps } from '@xyflow/react';
import { User, FileText, FolderGit2 } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';

// Custom Node Component
const CustomNode = memo(({ data, selected }: NodeProps) => {
  let Icon = FileText;
  let colorClass = "text-green-400";
  let borderClass = selected ? "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]" : "border-green-400/30";

  if (data.type === 'Person') {
    Icon = User;
    colorClass = "text-blue-400";
    borderClass = selected ? "border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-blue-400/30";
  } else if (data.type === 'Project') {
    Icon = FolderGit2;
    colorClass = "text-purple-400";
    borderClass = selected ? "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "border-purple-400/30";
  }

  return (
    <div className={`px-4 py-2 rounded-xl bg-echo-card/90 backdrop-blur-sm border-2 ${borderClass} transition-all duration-200 flex items-center gap-3 hover:scale-105 cursor-pointer`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-echo-text-muted border-none" />
      <div className={`p-2 rounded-lg bg-echo-dark/50 ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="font-semibold text-echo-text text-sm">{data.label as string}</div>
        {data.type && <div className="text-[10px] text-echo-text-muted mt-0.5">{data.type as string}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-echo-text-muted border-none" />
    </div>
  );
});

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Project Apollo', type: 'Project' } },
  { id: '2', type: 'custom', position: { x: 100, y: 200 }, data: { label: 'Rahul', type: 'Person' } },
  { id: '3', type: 'custom', position: { x: 400, y: 200 }, data: { label: 'Budget.pdf', type: 'Document' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'Managed By', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', label: 'Mentions', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
];

function KnowledgeGraphInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Mocking the backend call for now since we are focusing on UI polish
    // In a real scenario, this fetches from /graph
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_, node: Node) => {
    // Highlight connected edges and nodes
    const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
    const connectedNodeIds = new Set(connectedEdges.flatMap(e => [e.source, e.target]));
    
    setNodes(nds => nds.map(n => {
      const isConnected = connectedNodeIds.has(n.id);
      return {
        ...n,
        style: {
          ...n.style,
          opacity: isConnected ? 1 : 0.2,
          transition: 'opacity 0.3s ease'
        }
      }
    }));

    setEdges(eds => eds.map(e => {
      const isConnected = e.source === node.id || e.target === node.id;
      return {
        ...e,
        style: {
          ...e.style,
          stroke: isConnected ? '#3b82f6' : '#94a3b8',
          opacity: isConnected ? 1 : 0.1,
          strokeWidth: isConnected ? 3 : 1
        },
        animated: isConnected
      }
    }));
  }, [edges, setNodes, setEdges]);

  const onPaneClick = useCallback(() => {
    // Reset highlights
    setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
    setEdges(eds => eds.map(e => ({
      ...e,
      style: { ...e.style, stroke: '#94a3b8', opacity: 1, strokeWidth: 2 },
      animated: true
    })));
  }, [setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.2}
        className="bg-transparent"
      >
        <Controls className="bg-echo-card fill-white border-white/10 shadow-xl" />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="rgba(255,255,255,0.05)" />
      </ReactFlow>
    </div>
  );
}

export function KnowledgeGraph() {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner />
    </ReactFlowProvider>
  )
}
