/* eslint-disable */
import { createWithEqualityFn } from 'zustand/traditional';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { v4 as uid } from 'uuid';
import axios from 'axios';
import { configuration } from '../services/baseApiService';
import { ADD_CALL, DELETE_CALL, GET_CALL, GET_CALL_WITH_DETAILS, PATCH_CALL, UPDATE_CALL } from '../API/api';
import { DSTableHeader, DsDerivationHeader, TsTableHeader, AttackTableHeader, RiskTreatmentHeaderTable } from '../ui-component/Table/constraints';

export const createHeaders = () => {
  const userId = sessionStorage.getItem('user-id');

  let headers = {};

  if (!userId) {
    console.error('No  user Id found');
  } else {
    // headers['Content-Type'] = `application/json`;
    headers['user-id'] = userId;
  }

  headers['Cache-Control'] = 'no-cache';

  return { headers };
};

export const createHeadersForJson = () => {
  const userId = sessionStorage.getItem('user-id');

  let headers = {};

  if (!userId) {
    console.error('No  user Id found');
  } else {
    headers['Content-Type'] = `application/json`;
    headers['user-id'] = userId;
  }

  headers['Cache-Control'] = 'no-cache';

  return { headers };
};

const useStore = createWithEqualityFn((set, get) => ({
  reactFlowInstance: null,
  attackNodes: [],
  attackEdges: [],
  cyberNodes: [],
  cyberEdges: [],
  nodes: [],
  edges: [],
  undoStack: [],
  redoStack: [],
  sidebarNodes: [],
  template: [],
  selectedTemplate: {},
  Models: [],
  model: {},
  clickedItem: [],
  assets: {
    id: '1',
    name: 'Item Model & Assets',
    icon: 'ItemIcon'
  },
  damageScenarios: {
    id: '2',
    name: 'Damage Scenarios Identification and Impact Ratings',
    icon: 'DamageIcon',
    subs: [
      {
        id: '21',
        name: 'Damage Scenarios Derivations'
      },
      {
        id: '22',
        name: 'Damage Scenarios - Collection & Impact Ratings'
      }
    ]
  },
  threatScenarios: {
    id: '3',
    name: 'Threat Scenarios Identification',
    icon: 'ThreatIcon',
    subs: [
      {
        name: 'Threat Scenarios',
        id: '31'
      },
      {
        id: '32',
        name: 'Derived Threat Scenarios'
      }
    ]
  },
  attackScenarios: {
    id: '4',
    name: 'Attack Path Analysis and Attack Feasability Rating',
    icon: 'AttackIcon',
    subs: [
      {
        id: '41',
        name: 'Attack'
      },
      {
        id: '42',
        name: 'Attack Trees'
      },
      {
        id: '43',
        name: 'Vulnerability Analysis'
      }
    ]
  },
  cybersecurity: {
    id: '5',
    name: 'Cybersecurity Goals, Claims and Requirements',
    icon: 'CybersecurityIcon',
    subs: [
      {
        id: 51,
        name: 'Cybersecurity Goals'
      },
      {
        id: 53,
        name: 'Cybersecurity Requirements'
      },
      {
        id: 52,
        name: 'Cybersecurity Controls'
      },
      {
        id: 54,
        name: 'Cybersecurity Claims'
      }
    ]
  },

  systemDesign: {
    id: '6',
    name: 'System Design',
    icon: 'SystemIcon',
    subs: [
      {
        id: '61',
        name: 'Hardware Models'
      },
      {
        id: '62',
        name: 'Software Models'
      }
    ]
  },
  catalog: {
    id: '7',
    name: 'Catalogs',
    icon: 'CatalogIcon',
    subs: [
      {
        id: '71',
        name: 'UNICE R.155 Annex 5(WP.29)',
        subs_scenes: [
          {
            id: '72',
            name: 'Threats - Back-end servers associated with vehicle field operations',
          },
          {
            id: '73',
            name: 'Threats - Vehicle communication channel vulnerabilities',
          },
          {
            id: '74',
            name: 'Threats - Vehicle update procedures and their risks',
          },
          {
            id: '75',
            name: 'Threats - Human actions unintentionally enabling cyber attacks on vehicles',
          },
          {
            id: '76',
            name: 'Threats - Vehicles from external connectivity and network connections',
          },
          {
            id: '77',
            name: 'Threats - Vehicle data and software integrity',
          },
          {
            id: '78',
            name: 'Potential vulnerabilities in vehicles if not properly secured or hardened',
          }
        ]        
      }
    ]
  },
  riskTreatment: {
    id: '8',
    name: 'Risk Determination and Risk Treatment Decision',
    icon: 'RiskIcon',
    subs: [
      {
        id: '81',
        name: 'Threat Assessment & Risk Treatment',
        Details: []
      }
    ]
  },
  documents: {
    id: '9',
    name: 'Documents',
    icon: 'DocumentIcon'
  },
  reports: {
    id: '10',
    name: 'Reporting',
    icon: 'ReportIcon',
    scenes: []
  },
  layouts: {
    id: '11',
    name: 'Layouts',
    icon: 'LayoutIcon',
    scenes: []
  },
  scenerio: {},
  component: [],
  originalNodes: [],
  visibleColumns: DSTableHeader.map((column) => column.name), // Initialize with all columns visible
  visibleColumns1: DsDerivationHeader.map((column) => column.name),
  visibleColumns2: TsTableHeader.map((column) => column.name),
  visibleColumns3: AttackTableHeader.map((column) => column.name),
  visibleColumns4: RiskTreatmentHeaderTable.map((column) => column.name),

  setVisibleColumns: (table, columns) => {
    set((state) => ({
      [table]: columns
    }));
  },

  toggleColumnVisibility: (table, columnName) => {
    const { visibleColumns, visibleColumns1, visibleColumns2, visibleColumns3, visibleColumns4 } = get();
    const tableColumns =
      table === 'visibleColumns'
        ? visibleColumns
        : table === 'visibleColumns1'
        ? visibleColumns1
        : table === 'visibleColumns2'
        ? visibleColumns2
        : table === 'visibleColumns3'
        ? visibleColumns3
        : visibleColumns4
    const isCurrentlyVisible = tableColumns.includes(columnName);
    const updatedColumns = isCurrentlyVisible ? tableColumns.filter((col) => col !== columnName) : [...tableColumns, columnName];

    set({
      [table]: updatedColumns
    });
  },

  getCatalog: async () => {
    try {
      const url = `${configuration.apiBaseUrl}v1/get/catalog`;
      const options = {
        method: 'POST',
        url,
        headers: {
          ...createHeadersForJson()
        },
      };

      const response = await axios(options);
      // You can handle additional logic here, like setting a state or triggering a file download
      return response.data;
    } catch (error) {
      console.error('Error fetching catalog:', error);
      throw error; // Throw error to handle it in the component
    }
  },

  generateDocument: async (payload) => {
    try {
      const url = `${configuration.apiBaseUrl}v1/generate/doc`;
      const options = {
        method: 'POST',
        url,
        headers: {
          ...createHeadersForJson()
        },
        data: payload
      };

      const response = await axios(options);
      // Extract the download URL
      const downloadUrl = response.data.download_url;

      // Open the URL in a new tab
      window.open(downloadUrl, '_blank');

      // You can handle additional logic here, like setting a state or triggering a file download
      return response.data;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error; // Throw error to handle it in the component
    }
  },

  setClickedItem: (item) =>
    set((state) => {
      if (state.clickedItem.includes(item)) {
        // If the item is already in the array, remove it
        return { clickedItem: state.clickedItem.filter((i) => i !== item) };
      } else {
        // If the item is not in the array, add it
        return { clickedItem: [...state.clickedItem, item] };
      }
    }),

  setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),

  fitView: (nodes) => {
    set((state) => {
      // console.log('state.reactFlowInstance', state.reactFlowInstance);
      if (!state.reactFlowInstance || nodes.length === 0) return;

      // Calculate the bounding box of the nodes
      const xPositions = nodes.map((node) => node.position.x);
      const yPositions = nodes.map((node) => node.position.y);

      const minX = Math.min(...xPositions);
      const maxX = Math.max(...xPositions);
      const minY = Math.min(...yPositions);
      const maxY = Math.max(...yPositions);

      // Calculate the center of the bounding box
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Get the bounding box dimensions
      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;

      // Access the current dimensions of the viewport
      const { width: viewportWidth, height: viewportHeight } = state.reactFlowInstance.getViewport();

      // Calculate the zoom level to fit the nodes within the viewport (with padding)
      const zoom = Math.min(viewportWidth / (boxWidth + 50), viewportHeight / (boxHeight + 50));

      // Apply the zoom and pan
      state.reactFlowInstance.setTransform({
        x: viewportWidth / 2 - centerX * zoom,
        y: viewportHeight / 2 - centerY * zoom,
        zoom
      });
    });
  },

  //Normal Nodes

  updateNodes: (newNodes) =>
    set((state) => ({
      undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
      redoStack: [],
      nodes: newNodes
    })),

  // Update edges (with undo/redo management)
  updateEdges: (newEdges) =>
    set((state) => ({
      undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
      redoStack: [],
      edges: newEdges
    })),

  onNodesChange: (changes) => {
    const currentNodes = get().nodes; // get current nodes
    const updatedNodes = applyNodeChanges(changes, currentNodes); // apply changes

    set((state) => ({
      undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
      redoStack: [],
      nodes: updatedNodes // set the updated nodes
    }));
  },

  onEdgesChange: (changes) => {
    const currentEdges = get().edges; // get current edges
    const updatedEdges = applyEdgeChanges(changes, currentEdges); // apply changes

    set((state) => ({
      undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
      redoStack: [],
      edges: updatedEdges // set the updated edges
    }));
  },
  onConnect: (connection) => {
    // console.log('connection', connection);
    const Connect = { ...connection };
    Connect.data = { label: '' };
    set({
      edges: addEdge(Connect, get().edges)
    });
  },

  onConnectAttack: (connection) => {
    const { nodes, edges } = useStore.getState(); // Access Zustand state

    // Extract source and target nodes from the connection
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    // Ensure sourceNode and targetNode exist
    if (!sourceNode || !targetNode) {
      console.log('Connection error: Source or Target node not found.');
      return;
    }

    // Allow unrestricted connection if both nodes are of type "Gate"
    if (sourceNode.type.includes('Gate') && targetNode.type.includes('Gate')) {
      const newConnection = { ...connection, data: { label: '' } };

      // Update Zustand edges state
      set({
        edges: addEdge(newConnection, edges)
      });
      return;
    }

    // Determine the parent node based on which node has data.connections
    const parent = sourceNode.data?.connections ? sourceNode : targetNode.data?.connections ? targetNode : null;
    const child = parent === sourceNode ? targetNode : sourceNode;

    // Check if the child node's type matches any type in the parent's connections
    const isMatchingType = parent.data.connections?.some((connection) => connection.type === child.type);

    if (!isMatchingType) {
      // console.log(`Connection not allowed: Child node type "${child.type}" does not match any type in parent's connections.`);
      return;
    }

    // Proceed with creating the connection
    const newConnection = { ...connection, data: { label: '' } };

    // Update Zustand edges state
    set({
      edges: addEdge(newConnection, edges)
    });
  },

  setNodes: (newNodes) => {
    set({
      nodes: newNodes
    });
  },
  setEdges: (newEdges) => {
    set({
      edges: newEdges
    });
  },

  //Attack tree Section
  onAttackNodesChange: (changes) => {
    set({
      attackNodes: applyNodeChanges(changes, get().attackNodes)
    });
  },
  onAttckEdgesChange: (changes) => {
    set({
      attackEdges: applyEdgeChanges(changes, get().attackEdges)
    });
  },
  onAttackConnect: (connection) => {
    set({
      attackEdges: addEdge(connection, get().attackEdges)
    });
  },

  setAttackNodes: (newNodes) => {
    set({
      attackNodes: newNodes
    });
  },

  setAttackEdges: (newEdges) => {
    set({
      attackEdges: newEdges
    });
  },

  //Cybersecurity Section
  onCyberNodesChange: (changes) => {
    set({
      cyberNodes: applyNodeChanges(changes, get().cyberNodes)
    });
  },
  onCyberEdgesChange: (changes) => {
    set({
      cyberEdges: applyEdgeChanges(changes, get().cyberEdges)
    });
  },
  onCyberConnect: (connection) => {
    set({
      cyberEdges: addEdge(connection, get().cyberEdges)
    });
  },
  setCyberNodes: (newNodes) => {
    set({
      cyberNodes: newNodes
    });
  },

  setCyberEdges: (newEdges) => {
    set({
      cyberEdges: newEdges
    });
  },

  getGroupedNodes: () => {
    let nodes = get().nodes;
    const groups = nodes?.filter((nd) => nd?.type === 'group');
    const intersectingNodesMap = {};

    function calculateOverlapArea(nodeA, nodeB) {
      const xOverlap = Math.max(0, Math.min(nodeA.x + nodeA.width, nodeB.x + nodeB.width) - Math.max(nodeA.x, nodeB.x));
      const yOverlap = Math.max(0, Math.min(nodeA.y + nodeA.height, nodeB.y + nodeB.height) - Math.max(nodeA.y, nodeB.y));

      return xOverlap * yOverlap;
    }

    function isAtLeastHalfInside(nodeA, nodeB) {
      const overlapArea = calculateOverlapArea(nodeA, nodeB);
      const nodeBArea = nodeB.width * nodeB.height;

      // Check if the overlap area is at least half of node B's area
      return overlapArea >= nodeBArea / 2;
    }

    if (groups) {
      groups.forEach((group) => {
        const area = {
          x: group?.position?.x,
          y: group?.position?.y,
          width: group?.width,
          height: group?.height
        };

        const intersectingNodes = nodes
          .filter((node) => {
            // Avoid grouping group nodes with another group node
            if (node.id !== group.id && node.type !== 'group') {
              const nodeRect = {
                x: node.position.x,
                y: node.position.y,
                width: node.width,
                height: node.height
              };
              return isAtLeastHalfInside(area, nodeRect);
            }
            return false;
          })
          .map((node) => ({
            ...node,
            parentId: group.id,
            extent: 'parent'
          }));

        intersectingNodesMap[group.id] = intersectingNodes;

        // Add nodeCount to the group's data
        group.data = {
          ...group.data,
          nodeCount: intersectingNodes.length
        };
      });

      // Remove parentId and extent from nodes that are not inside any group
      nodes = nodes.map((node) => {
        const isInGroup = Object.values(intersectingNodesMap)
          .flat()
          .some((n) => n.id === node.id);

        if (!isInGroup && node.parentId && node.extent) {
          const { parentId, extent, ...rest } = node;
          return rest;
        }
        return node;
      });
    }

    set({
      nodes: nodes
    });

    return [intersectingNodesMap, nodes];
  },

  dragAdd: (newNode) => {
    // console.log('newNode', newNode);
    set((state) => ({
      nodes: [...state.nodes, newNode]
    }));
  },

  addEdge: (newEdge) => {
    // console.log('newNode', newNode);
    set((state) => ({
      edges: [...state.edges, newEdge]
    }));
  },

  addEdgeState: (params) =>
    set((state) => ({
      undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
      redoStack: [],
      edges: addEdge(params, state.edges)
    })),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state; // No undo available
      const prevState = state.undoStack[state.undoStack.length - 1];
      return {
        nodes: prevState.nodes,
        edges: prevState.edges,
        redoStack: [...state.redoStack, { nodes: state.nodes, edges: state.edges }],
        undoStack: state.undoStack.slice(0, -1)
      };
    }),

  // Redo action
  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state; // No redo available
      const nextState = state.redoStack[state.redoStack.length - 1];
      return {
        nodes: nextState.nodes,
        edges: nextState.edges,
        undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
        redoStack: state.redoStack.slice(0, -1)
      };
    }),

  addAttackNode: (newNode) => {
    // console.log('newNode', newNode);
    set((state) => ({
      attackNodes: [...state.attackNodes, newNode]
    }));
  },

  addAttackEdge: (newEdge) => {
    set((state) => ({
      attackEdges: [...state.attackEdges, newEdge]
    }));
  },

  addCyberNode: (newNode) => {
    // console.log('newNode', newNode);
    set((state) => ({
      cyberNodes: [...state.cyberNodes, newNode]
    }));
  },

  dragAddNode: (newNode, newEdge) => {
    // console.log("store",newNode);
    set((state) => ({
      nodes: state.nodes.concat(newNode),
      edges: state.edges.concat(newEdge)
    }));
  },

  // API section
  //fetch or GET section
  getTemplates: async () => {
    try {
      const options = {
        method: 'POST',
        ...createHeaders(),
        url: `${configuration?.apiBaseUrl}get_details/templates`
      };
      const res = await axios(options);
      set({
        template: res.data
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  },

  getSidebarNode: async () => {
    try {
      const options = {
        method: 'POST',
        ...createHeaders(),
        url: `${configuration.apiBaseUrl}get_details/sidebarNode`
      };
      const res = await axios(options);
      set({
        sidebarNodes: res.data
      });
    } catch (error) {
      console.error('Error fetching sidebar nodes:', error);
    }
  },

  // getTemplate: async (id) => {
  //   const res = await axios.get(`${configuration.apiBaseUrl}template?id=${id}`);
  //   set({
  //     selectedTemplate: res.data[0],
  //     nodes: res['data'][0]['template']['nodes'],
  //     edges: res['data'][0]['template']['edges']
  //   });
  // },

  //New API's
  getModels: async () => {
    const options = {
      method: 'POST',
      ...createHeaders(),
      url: `${configuration.apiBaseUrl}v1/get_details/models`
    };
    const res = await axios(options);

    set({
      Models: res.data
    });
  },

  getModelById: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/model`;
    const res = await GET_CALL(modelId, url);
    // console.log('res api page', res);
    set({
      model: res,
      assets: {
        id: '1',
        name: 'Item Model & Assets',
        icon: 'ItemIcon'
      },
      damageScenarios: {
        id: '2',
        name: 'Damage Scenarios Identification and Impact Ratings',
        icon: 'DamageIcon',
        subs: [
          {
            id: '21',
            name: 'Damage Scenarios Derivations'
          },
          {
            id: '22',
            name: 'Damage Scenarios - Collection & Impact Ratings'
          }
        ]
      },
      threatScenarios: {
        id: '3',
        name: 'Threat Scenarios Identification',
        icon: 'ThreatIcon',
        subs: [
          {
            name: 'Threat Scenarios',
            id: '31'
          },
          {
            id: '32',
            name: 'Derived Threat Scenarios'
          }
        ]
      },
      attackScenarios: {
        id: '4',
        name: 'Attack Path Analysis and Attack Feasability Rating',
        icon: 'AttackIcon',
        subs: [
          {
            id: '41',
            name: 'Attack'
          },
          {
            id: '42',
            name: 'Attack Trees'
          },
          {
            id: '43',
            name: 'Vulnerability Analysis'
          }
        ]
      },
      riskTreatment: {
        id: '8',
        name: 'Risk Determination and Risk Treatment Decision',
        icon: 'RiskIcon',
        subs: [
          {
            id: '81',
            name: 'Threat Assessment & Risk Treatment',
            Details: []
          }
        ]
      },
      cybersecurity: {
        id: '5',
        name: 'Cybersecurity Goals, Claims and Requirements',
        icon: 'CybersecurityIcon',
        subs: [
          {
            id: 51,
            name: 'Cybersecurity Goals'
          },
          {
            id: 53,
            name: 'Cybersecurity Requirements'
          },
          {
            id: 52,
            name: 'Cybersecurity Controls'
          },
          {
            id: 54,
            name: 'Cybersecurity Claims'
          }
        ]
      }
    });
  },

  getAssets: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/assets`;
    const res = await GET_CALL(modelId, url);
    // console.log('res', res);
    set({
      originalNodes: res.Details
    });
    if (!res.error) {
      set((state) => ({
        assets: {
          ...state.assets,
          ...(res || { template: { nodes: [], edges: [] }, Details: [] })
        }
      }));
    }
  },

  getDamageScenarios: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/damage_scenarios`;
    const res = await GET_CALL(modelId, url);

    set((state) => {
      if (!res?.error) {
        const derivedScenario = res.find((item) => item.type === 'Derived') || {};
        const userDefinedScenario = res.find((item) => item.type === 'User-defined') || {};

        return {
          damageScenarios: {
            ...state.damageScenarios,
            subs: [
              {
                ...state.damageScenarios.subs[0],
                ...derivedScenario // Update Derived
              },
              {
                ...state.damageScenarios.subs[1],
                ...userDefinedScenario // Update User-defined
              }
            ]
          }
        };
      }

      // Fallback: No data or error state
      return {
        damageScenarios: {
          ...state.damageScenarios,
          subs: [
            {
              id: '21',
              name: 'Damage Scenarios Derivations'
            },
            {
              id: '22',
              name: 'Damage Scenarios - Collection & Impact Ratings'
            }
          ]
        }
      };
    });
  },

  getThreatScenario: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/threat_scenarios`;
    const res = await GET_CALL(modelId, url);

    if (!res?.error) {
      // Separate the "Derived" and "User-defined" objects
      const derivedScenario = res?.find((item) => item.type === 'derived');
      const userDefinedScenario = res?.find((item) => item.type === 'User-defined');
      set((state) => ({
        threatScenarios: {
          ...state.threatScenarios,
          subs: [
            {
              ...state.threatScenarios.subs[0],
              ...derivedScenario // Spread the "Derived" object into the first subs element
            },
            {
              ...state.threatScenarios.subs[1],
              ...userDefinedScenario // Spread the "User-defined" object into the second subs element
            }
          ]
        }
      }));
    } else {
      set((state) => ({
        threatScenarios: {
          ...state.threatScenarios,
          subs: [
            {
              name: 'Threat Scenarios',
              id: '31'
            },
            {
              id: '32',
              name: 'Derived Threat Scenarios'
            }
          ]
        }
      }));
    }
  },

  getAttackScenario: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/attacks`;
    const res = await GET_CALL(modelId, url);

    // console.log('res', res);
    if (!res?.error) {
      const attacks = res?.find((item) => item?.type === 'attack');
      const attackTrees = res?.find((item) => item?.type === 'attack_trees');
      const Vulnerability = res?.find((item) => item?.type === 'Vulnerability');
      set((state) => ({
        attackScenarios: {
          ...state.attackScenarios,
          subs: [
            {
              ...state.attackScenarios.subs[0],
              ...attacks
            },
            {
              ...state.attackScenarios.subs[1],
              ...attackTrees
            },
            {
              ...state.attackScenarios.subs[2],
              ...Vulnerability
            }
          ]
        }
      }));
    } else {
      set((state) => ({
        attackScenarios: {
          ...state.attackScenarios,
          subs: [
            {
              id: '41',
              name: 'Attack'
            },
            {
              id: '42',
              name: 'Attack Trees'
            },
            {
              id: '43',
              name: 'Vulnerability Analysis'
            }
          ]
        }
      }));
    }
  },

  getCyberSecurityScenario: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/cybersecurity`;
    const res = await GET_CALL(modelId, url);

    if (!res?.error) {
      const goals = res?.find((item) => item?.type === 'cybersecurity_goals');
      const requirements = res?.find((item) => item?.type === 'cybersecurity_requirements');
      const controls = res?.find((item) => item?.type === 'cybersecurity_controls');
      const claims = res?.find((item) => item?.type === 'cybersecurity_claims');

      set((state) => ({
        cybersecurity: {
          ...state.cybersecurity,
          subs: [
            {
              ...state.cybersecurity.subs[0],
              ...goals
            },
            {
              ...state.cybersecurity.subs[1],
              ...requirements
            },
            {
              ...state.cybersecurity.subs[2],
              ...controls
            },
            {
              ...state.cybersecurity.subs[3],
              ...claims
            }
          ]
        }
      }));
    } else {
      set((state) => ({
        cybersecurity: {
          ...state.cybersecurity,
          subs: [
            {
              id: 51,
              name: 'Cybersecurity Goals'
            },
            {
              id: 53,
              name: 'Cybersecurity Requirements'
            },
            {
              id: 52,
              name: 'Cybersecurity Controls'
            },
            {
              id: 54,
              name: 'Cybersecurity Claims'
            }
          ]
        }
      }));
    }
  },

  getRiskTreatment: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/get/riskDetAndTreat`;
    const res = await GET_CALL(details, url);
    if (!res?.error) {
      set((state) => ({
        riskTreatment: {
          ...state.riskTreatment,
          subs: [
            {
              ...state.riskTreatment.subs[0],
              Details: [...res]
            }
          ]
        }
      }));
    } else {
      set((state) => ({
        riskTreatment: {
          ...state.riskTreatment,
          subs: [
            {
              id: 81,
              name: 'Threat Assessment & Risk Treatment',
              Details: []
            }
          ]
        }
      }));
    }
  },

  //Update Section
  updateModelName: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/model-name`;
    const res = await UPDATE_CALL(details, url);
    // console.log('res', res);
    return res;
  },
  updateDamageScenario: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/damage_scenario`;
    const res = await UPDATE_CALL(details, url);
    // console.log('res', res);
    return res;
  },

  updateDerivedDamageScenario: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/derived_damage_scenario`;
    const res = await PATCH_CALL(details, url);
    // console.log('res', res);
    return res;
  },

  updateThreatScenario: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/threat_scenario`;
    const res = await PATCH_CALL(details, url);
    // console.log('res', res);
    return res;
  },
  updateImpact: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update-impacts/damage_scenerio`;

    // Directly pass details to PATCH_CALL
    return await PATCH_CALL(details, url);
  },

  updateName$DescriptionforDamage: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/damage_scenerio_name&desc`;
    // Directly pass details to PATCH_CALL
    return await PATCH_CALL(details, url);
  },
  updateName$DescriptionforThreat: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/threat_scenerio_name&desc`;
    // Directly pass details to PATCH_CALL
    return await PATCH_CALL(details, url);
  },
  updateName$DescriptionforCybersecurity: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/cybersecurity_name&desc`;
    // Directly pass details to PATCH_CALL
    return await PATCH_CALL(details, url);
  },

  updateAttackScenario: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/attacks`;
    const res = await UPDATE_CALL(details, url);
    // console.log('res', res);
    return res;
  },
  updateSidebarNodes: async (newTemplate) => {
    const res = await axios.patch(`${configuration.apiBaseUrl}sidebarNode/${newTemplate.id}`, newTemplate);
    return res;
  },

  updateTemplate: async (newTemplate) => {
    const res = await axios.patch(`${configuration.apiBaseUrl}template/${newTemplate.id}`, newTemplate);
    // console.log('res', res);
  },

  updateAssets: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/assets`;
    const res = await UPDATE_CALL(details, url);
    console.log('res', res);
    return res;
  },

  updateOverallRating: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/attack_feasibility_rating`;
    const res = await PATCH_CALL(details, url);
    console.log('res', res);
    return res;
  },

  updateRiskTable: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/riskDetAndTreat`;
    const res = await PATCH_CALL(details, url);
    console.log('res', res);
    return res;
  },

  // updateModel: async (newModel) => {
  //   const res = await axios.put(`${configuration.backendUrl}update_model/${newModel?._id}`, newModel);

  //   // console.log('res', res);
  //   if (res) {
  //     return res;
  //   }
  // },

  updateAttackNode: (nodeId, name) => {
    set((state) => {
      let node = JSON.parse(JSON.stringify(state.nodes)).find((ite) => ite.id === nodeId);
      const ind = state.nodes.findIndex((ite) => ite.id === nodeId);
      node.data.label = name;
      state.nodes[ind] = node;
      return {
        nodes: [...state.nodes]
      };
    });
  },

  //Add Section

  addDamageScene: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/add/damage_scenario`;
    const res = await ADD_CALL(details, url);
    return res;
  },

  addThreatScene: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/add/threat_scenarios`;
    const res = await ADD_CALL(details, url);
    return res;
  },

  addAttackScene: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/add/attacks`;
    const res = await ADD_CALL(details, url);
    return res;
  },

  addcybersecurityScene: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/add/cybersecurity`;
    const res = await ADD_CALL(details, url);
    return res;
  },
  addRiskTreatment: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/add/riskDetAndTreat`;
    const res = await ADD_CALL(details, url);
    // console.log('res', res);
    return res;
    // set((state) => ({
    //   riskTreatment: {
    //     ...state.riskTreatment,
    //     subs: [
    //       {
    //         ...state.riskTreatment.subs[0],
    //         scenes: [
    //           ...state.riskTreatment.subs[0].scenes, // Spread existing scenes
    //           res // Add the new res
    //         ]
    //       }
    //     ]
    //   }
    // }));
  },

  createComponent: async (newTemplate) => {
    const FormData = require('form-data');
    let data = new FormData();
    data.append('name', newTemplate?.Name);

    const requestOptions = {
      method: 'POST',
      ...createHeaders(),
      body: data
    };
    const res = await fetch(`${configuration.apiBaseUrl}add/sidebarNode`, requestOptions);
    // console.log('res', res);
    return res;
  },

  createNode: async (newNode) => {
    const FormData = require('form-data');
    let data = new FormData();
    data.append('id', newNode.id);
    data.append('new_node', JSON.stringify(newNode.new_node));

    // const res = await axios.post(`${configuration.backendUrl}createComponent`,newTemplate)
    const res = await axios.post(`${configuration.apiBaseUrl}add/node`, data);
    // console.log('res', res);
    return res;
  },

  createNewComponentLibrary: async (newTemplate) => {
    const res = await axios.post(`${configuration.apiBaseUrl}sidebarNode`, newTemplate);
    return res;
  },
  addTemplate: async (newTemplate) => {
    try {
      const res = await axios.post(`${configuration.apiBaseUrl}template`, newTemplate);
      // console.log('res store', res)
      if (res) {
        setTimeout(() => {
          // alert('Added Succesfully');
          window.location.reload();
        }, 500);
      }
    } catch (err) {}
  },

  addNewNode: async (newNode) => {
    // console.log('newNode',newNode);
    const res = await axios.post(`${configuration.apiBaseUrl}sidebarNode`, newNode);
    return res;
  },

  createModel: async (newModel, username) => {
    const FormData = require('form-data');
    let data = new FormData();
    data.append('name', newModel?.name);
    data.append('createdBy', username);
    try {
      const URL = `${configuration.apiBaseUrl}v1/add/models`;
      const response = await axios.post(URL, data, {
        ...createHeaders(),
        maxRedirects: 5
      });

      return response.data;
    } catch (err) {
      console.log('err', err);
      throw err; // Re-throwing the error to handle it in calling code if needed
    }
  },
  // createModel: async (newModel) => {
  //   const FormData = require('form-data');
  //   let data = new FormData();
  //   data.append('name', newModel?.name);
  //   data.append('scenarios', JSON.stringify(newModel?.scenarios));

  //   try {
  //     const URL = `${configuration.backendUrl}add/models`;
  //     const response = await axios.post(URL, data, {
  //       ...createHeaders(),
  //       maxRedirects: 5
  //     });
  //     // console.log('response', response);
  //     return response.data;
  //   } catch (err) {
  //     console.log('err', err);
  //     throw err; // Re-throwing the error to handle it in calling code if needed
  //   }
  // },
  //Delete Section

  deleteNode: async (details) => {
    let url = `${configuration.apiBaseUrl}v1/delete-node/assets`;
    const res = await DELETE_CALL(details, url);
    return res;
  },

  deleteModels: async (details) => {
    // console.log('details', details);
    let url = `${configuration.apiBaseUrl}v1/delete/models`;
    const res = await DELETE_CALL(details, url);
    return res;
  },
  deleteDamageScenario: async (details) => {
    let url = `${configuration.apiBaseUrl}v1/delete/damage_scenario`;
    const res = await DELETE_CALL(details, url);
    return res;
  },
  deleteThreatScenario: async (details) => {
    let url = `${configuration.apiBaseUrl}v1/delete/threat_scenarios`;
    const res = await DELETE_CALL(details, url);
    return res;
  },

  // deleteModels: async (ids) => {

  //   let data = new FormData();
  //   data.append('model_ids', ids);
  //   try {
  //     const URL = `${configuration.apiBaseUrl}delete/model`;
  //     const response = await axios.post(URL, data);
  //     // console.log('response', response);
  //     return response.data;
  //   } catch (err) {
  //     console.log('err', err);
  //     throw err; // Re-throwing the error to handle it in calling code if needed
  //   }
  // },

  deleteTemplate: async (id) => {
    const res = await axios.delete(`${configuration.apiBaseUrl}template/${id}`);
    // console.log('res', res);
    if (res) {
      setTimeout(() => {
        alert('Deleted Succesfully');
      });
    }
  },

  isNodePasted: true,

  // Function to toggle or set `isNodePasted`
  setIsNodePasted: (value) =>
    set(() => {
      return { isNodePasted: value };
    })
}));

export default useStore;
