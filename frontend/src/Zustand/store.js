/* eslint-disable */
import { createWithEqualityFn } from 'zustand/traditional';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';

import axios from 'axios';
import { configuration } from '../services/baseApiService';
import { ADD_CALL, GET_CALL, UPDATE_CALL } from '../API/api';

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
  assets: {
    id: 1,
    name: 'Item Model & Assets',
    icon: 'ItemIcon'
  },
  damageScenarios: {
    id: 2,
    name: 'Damage Scenarios Identification and Impact Ratings',
    icon: 'DamageIcon',
    subs: [
      {
        // id: 21,
        name: 'Damage Scenarios Derivations'
      },
      {
        // id: 22,
        name: 'Damage Scenarios - Collection & Impact Ratings'
      }
    ]
  },
  threatScenarios: {
    id: 3,
    name: 'Threat Scenarios Identification',
    icon: 'ThreatIcon',
    subs: [
      {
        // id: 31,
        name: 'Derived Threat Scenarios'
      },
      {
        // id: 32,
        name: 'Threat Scenarios'
      }
    ]
  },
  attackScenarios: {
    id: 4,
    name: 'Attack Path Analysis and Attack Feasability Rating',
    icon: 'AttackIcon',
    subs: [
      {
        name: 'Attack'
      },
      {
        name: 'Attack Trees'
      },
      {
        name: 'Vulnerability Analysis'
      }
    ]
  },
  cybersecurity: {
    id: 5,
    name: 'CyberSecurity Goals, Claims and Requirements',
    icon: 'CybersecurityIcon',
    subs: [
      {
        name: 'CyberSecurity Goals and Requirements',
        subs: [
          {
            name: 'CyberSecurity Goals',
            scenes: []
          },
          {
            name: 'CyberSecurity Requirements',
            scenes: []
          }
        ]
      },
      {
        name: 'CyberSecurity Controls'
      }
    ]
  },

  systemDesign: {
    id: 6,
    name: 'System Design',
    icon: 'SystemIcon',
    subs: [
      {
        id: 61,
        name: 'Hardware Models'
      },
      {
        id: 62,
        name: 'Software Models'
      }
    ]
  },
  catalog: {
    id: 7,
    name: 'Catalogs',
    icon: 'CatalogIcon',
    subs: [
      {
        name: 'UNICE R.155 Annex 5(WP.29)',
        scenes: []
      }
    ]
  },
  riskTreatment: {
    id: 8,
    name: 'Risk Determination and Risk Treatment Decision',
    icon: 'RiskIcon',
    subs: [
      {
        name: 'Threat Assessment & Risk Treatment',
        scenes: []
      }
    ]
  },
  documents: {
    id: 9,
    name: 'Documents',
    icon: 'DocumentIcon'
  },
  reports: {
    id: 10,
    name: 'Reporting',
    icon: 'ReportIcon',
    scenes: []
  },
  layouts: {
    id: 11,
    name: 'Layouts',
    icon: 'LayoutIcon',
    scenes: []
  },
  scenerio: {},
  component: [],

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
        url: `${configuration?.backendUrl}get_details/templates`
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
        url: `${configuration.backendUrl}get_details/sidebarNode`
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
  get_Model: async (modelId) => {
    const FormData = require('form-data');
    let data = new FormData();
    data.append('model-id', modelId);
    const options = {
      method: 'POST',
      ...createHeaders(),
      url: `${configuration.apiBaseUrl}v1/get_details/model`
    };
    const res = await axios(options);

    set({
      model: res.data
    });
  },

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
    set({
      model: res
    });
  },

  getAssets: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/assets`;
    const res = await GET_CALL(modelId, url);
    set((state) => ({
      assets: {
        ...state.assets,
        ...res
      }
    }));
  },

  getDamageScenarios: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/damage_scenarios`;
    const res = await GET_CALL(modelId, url);

    // Separate the "Derived" and "User-defined" objects
    const derivedScenario = res.find((item) => item.type === 'Derived');
    const userDefinedScenario = res.find((item) => item.type === 'User-defined');

    set((state) => ({
      damageScenarios: {
        ...state.damageScenarios,
        subs: [
          {
            ...state.damageScenarios.subs[0],
            ...derivedScenario // Spread the "Derived" object into the first subs element
          },
          {
            ...state.damageScenarios.subs[1],
            ...userDefinedScenario // Spread the "User-defined" object into the second subs element
          }
        ]
      }
    }));
  },

  getThreatScenario: async (modelId) => {
    const url = `${configuration.apiBaseUrl}v1/get_details/threat_scenarios`;
    const res = await GET_CALL(modelId, url);

    // Separate the "Derived" and "User-defined" objects
    const derivedScenario = res.find((item) => item.type === 'derived');
    const userDefinedScenario = res.find((item) => item.type === 'User-defined');

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
  },

  //Update Section

  updateDamageScenario: async (details) => {
    // const { id, detailId, cyberLosses } = details;
    const url = `${configuration.apiBaseUrl}v1/update/damage_scenario`;
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

  // updateModel: async (newModel) => {
  //   const res = await axios.put(`${configuration.backendUrl}update_model/${newModel?._id}`, newModel);

  //   // console.log('res', res);
  //   if (res) {
  //     return res;
  //   }
  // },

  updateAttackNode: (nodeId, name) => {
    set((state) => {
      let node = state.attackNodes.find((ite) => ite.id === nodeId);
      const ind = state.attackNodes.findIndex((ite) => ite.id === nodeId);
      node.data.label = name;
      state.attackNodes[ind] = node;
      return {
        attackNodes: [...state.attackNodes]
      };
    });
  },

  //Add Section

  addThreatScene: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/add/threat_scenarios`;
    const res = await ADD_CALL(details, url);
    return res;
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
    const res = await fetch(`${configuration.backendUrl}add/sidebarNode`, requestOptions);
    // console.log('res', res);
    return res;
  },

  createNode: async (newNode) => {
    const FormData = require('form-data');
    let data = new FormData();
    data.append('id', newNode.id);
    data.append('new_node', JSON.stringify(newNode.new_node));

    // const res = await axios.post(`${configuration.backendUrl}createComponent`,newTemplate)
    const res = await axios.post(`${configuration.backendUrl}add/node`, data);
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
    } catch (err) {
      // console.log('err', err);
      // setTimeout(() => {
      // alert('Something went Wrong');
      // }, 1000);
    }
  },

  addDamageScenario: async (newTemplate) => {
    // console.log('newTemplate', newTemplate);
    try {
      const res = await axios.post(`${configuration.apiBaseUrl}Damage-scenarios`, newTemplate);
      // console.log('res store', res)
      if (res) {
        return res;
      }
    } catch (err) {
      console.log('err', err);
      // setTimeout(() => {
      //     alert('Something went Wrong');
      // }, 1000);
    }
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

  deleteNode: async (id) => {
    const res = await axios.delete(`${configuration.apiBaseUrl}sidebarNode/${id}`);
    // console.log('res', res);
  },

  deleteModels: async (ids) => {
    // console.log('ids', ids);
    let data = new FormData();
    data.append('model_ids', ids);
    try {
      const URL = `${configuration.backendUrl}delete/model`;
      const response = await axios.post(URL, data);
      // console.log('response', response);
      return response.data;
    } catch (err) {
      console.log('err', err);
      throw err; // Re-throwing the error to handle it in calling code if needed
    }
  },

  deleteTemplate: async (id) => {
    const res = await axios.delete(`${configuration.apiBaseUrl}template/${id}`);
    // console.log('res', res);
    if (res) {
      setTimeout(() => {
        alert('Deleted Succesfully');
      });
    }
  }
}));

export default useStore;
