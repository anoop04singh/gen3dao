import { Node, Edge } from 'reactflow';

const baseNodes = {
  token: (pos: { x: number, y: number }, data: any): Node => ({
    id: '1', type: 'token', position: pos, data: { label: 'Token Node', ...data }
  }),
  voting: (pos: { x: number, y: number }, data: any): Node => ({
    id: '2', type: 'voting', position: pos, data: { label: 'Voting Node', ...data }
  }),
  quorum: (pos: { x: number, y: number }, data: any): Node => ({
    id: '3', type: 'quorum', position: pos, data: { label: 'Quorum Node', ...data }
  }),
  treasury: (pos: { x: number, y: number }, data: any): Node => ({
    id: '4', type: 'treasury', position: pos, data: { label: 'Treasury Node', ...data }
  }),
  timelock: (pos: { x: number, y: number }, data: any): Node => ({
    id: '5', type: 'timelock', position: pos, data: { label: 'Timelock Node', ...data }
  }),
};

export const templates = {
  venture: {
    name: "Venture DAO",
    description: "For groups that pool capital to invest in projects. Prioritizes security and deliberate decision-making.",
    nodes: [
      baseNodes.token({ x: 50, y: 150 }, { name: 'VentureToken', symbol: 'VENT' }),
      baseNodes.voting({ x: 350, y: 50 }, { period: 7, threshold: 5 }),
      baseNodes.quorum({ x: 350, y: 250 }, { percentage: 15 }),
      baseNodes.timelock({ x: 650, y: 150 }, { delay: 3 }),
      baseNodes.treasury({ x: 950, y: 150 }, {}),
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e5-4', source: '5', target: '4' },
    ] as Edge[],
  },
  grants: {
    name: "Grants DAO",
    description: "For allocating funding to ecosystem contributors. Balances inclusivity with operational efficiency.",
    nodes: [
      baseNodes.token({ x: 50, y: 150 }, { name: 'GrantToken', symbol: 'GRNT' }),
      baseNodes.voting({ x: 350, y: 50 }, { period: 5, threshold: 1 }),
      baseNodes.quorum({ x: 350, y: 250 }, { percentage: 5 }),
      baseNodes.timelock({ x: 650, y: 150 }, { delay: 2 }),
      baseNodes.treasury({ x: 950, y: 150 }, {}),
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e5-4', source: '5', target: '4' },
    ] as Edge[],
  },
  social: {
    name: "Social Club",
    description: "For communities where decisions are frequent and non-financial. Prioritizes speed and engagement.",
    nodes: [
      baseNodes.token({ x: 50, y: 150 }, { name: 'SocialToken', symbol: 'CLUB' }),
      baseNodes.voting({ x: 350, y: 150 }, { period: 2, threshold: 0 }),
      baseNodes.quorum({ x: 650, y: 150 }, { percentage: 1 }),
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ] as Edge[],
  },
};