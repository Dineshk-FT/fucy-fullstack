/* eslint-disable */
import { createWithEqualityFn } from 'zustand/traditional';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { v4 as uid } from 'uuid';
import axios from 'axios';
import { configuration } from '../services/baseApiService';
import { ADD_CALL, DELETE_CALL, GET_CALL, GET_CALL_WITH_DETAILS, PATCH_CALL, UPDATE_CALL } from '../API/api';
import {
  DSTableHeader,
  DsDerivationHeader,
  TsTableHeader,
  AttackTableHeader,
  RiskTreatmentHeaderTable,
  CybersecurityGoalsHeader,
  CybersecurityClaimsHeader,
  CybersecurityRequirementsHeader,
  CybersecurityControlsHeader
} from '../ui-component/Table/constraints';

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
  selectedNodes: [],
  initialNodes: [],
  initialEdges: [],
  undoStack: [],
  redoStack: [],
  sidebarNodes: [],
  template: [],
  selectedTemplate: {},
  Models: [],
  model: {},
  clickedItem: [],
  isSaveModalOpen: false,

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
        id: '51',
        name: 'Cybersecurity Goals'
      },
      {
        id: '53',
        name: 'Cybersecurity Requirements'
      },
      {
        id: '52',
        name: 'Cybersecurity Controls'
      },
      {
        id: '54',
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
            item_name: [
              {
                id: '431.1',
                name: '4.3.1. - Vehicle related data held on back-end servers being lost or compromised'
              },
              {
                id: '431.2',
                name: '4.3.1.	- Back-end servers used as a means to attack a vehicle or extract data'
              },
              {
                id: '431.3',
                name: '4.3.1.	- Services from back-end server being disrupted, affecting the operation of a vehicle'
              }
            ]
          },
          {
            id: '73',
            name: 'Threats - Vehicle communication channel vulnerabilities',
            item_name: [
              {
                id: '432.1',
                name: '4.3.2. - Spoofing of messages or data received by the vehicle'
              },
              {
                id: '432.2',
                name: '4.3.2.	- Communication channels used to conduct unauthorized manipulation, deletion or other amendments to vehicle held code/data'
              },
              {
                id: '432.3',
                name: '4.3.2.	- Communication channels permit untrusted/unreliable messages to be accepted or are vulnerable to session hijacking/replay attacks'
              },
              {
                id: '432.4',
                name: '4.3.2. - Information can be readily disclosed. For example, through eavesdropping on communications or through allowing unauthorized access to sensitive files or folders'
              },
              {
                id: '432.5',
                name: '4.3.2.	- Denial of service attacks via communication channels to disrupt vehicle functions'
              },
              {
                id: '432.6',
                name: '4.3.2.	- An unprivileged user is able to gain privileged access to vehicle systems'
              },
              {
                id: '432.7',
                name: '4.3.2.	- Viruses embedded in communication media are able to infect vehicle systems'
              },
              {
                id: '432.8',
                name: '4.3.2.	- Messages received by the vehicle (for example X2V or diagnostic messages), or transmitted within it, contain malicious content'
              }
            ]
          },
          {
            id: '74',
            name: 'Threats - Vehicle update procedures and their risks',
            item_name: [
              {
                id: '433.1',
                name: '4.3.3. - Misuse or compromise of update procedures'
              },
              {
                id: '433.2',
                name: '4.3.3.	- It is possible to deny legitimate updates'
              }
            ]
          },
          {
            id: '75',
            name: 'Threats - Human actions unintentionally enabling cyber attacks on vehicles',
            item_name: [
              {
                id: '434.1',
                name: '4.3.4. - Legitimate actors are able to take actions that would unwittingly facilitate a cyberattack'
              }
            ]
          },
          {
            id: '76',
            name: 'Threats - Vehicles from external connectivity and network connections',
            item_name: [
              {
                id: '435.1',
                name: '4.3.5. - Devices connected to external interfaces used as a means to attack vehicle systems'
              },
              {
                id: '435.2',
                name: '4.3.5.	- Manipulation of the connectivity of vehicle functions enables a cyberattack'
              },
              {
                id: '435.3',
                name: '4.3.5.	- Manipulation of the connectivity of vehicle functions enables a cyberattack'
              }
            ]
          },
          {
            id: '77',
            name: 'Threats - Vehicle data and software integrity',
            item_name: [
              {
                id: '436.1',
                name: '4.3.6. - Extraction of vehicle data/code'
              },
              {
                id: '436.2',
                name: '4.3.6.	- Manipulation of vehicle data/code'
              },
              {
                id: '436.3',
                name: '4.3.6.	- Erasure of data/code '
              },
              {
                id: '436.4',
                name: '4.3.6. - Introduction of malware '
              },
              {
                id: '436.5',
                name: '4.3.6.	- Introduction of new software or overwrite existing software'
              },
              {
                id: '436.6',
                name: '4.3.6.	- Disruption of systems or operations'
              },
              {
                id: '436.7',
                name: '4.3.6.	- Manipulation of vehicle parameters'
              }
            ]
          },
          {
            id: '78',
            name: 'Potential vulnerabilities in vehicles if not properly secured or hardened',
            item_name: [
              {
                id: '437.1',
                name: '4.3.7. - Parts or supplies could be compromised to permit vehicles to be attacked'
              },
              {
                id: '437.2',
                name: '4.3.7.	- Cryptographic technologies can be compromised or insufficiently applied'
              },
              {
                id: '437.3',
                name: '4.3.7.	- Software or hardware development permits vulnerabilities'
              },
              {
                id: '437.4',
                name: '4.3.7. - Network design introduces vulnerabilities'
              },
              {
                id: '437.5',
                name: '4.3.7.	- Physical manipulation of systems can enable an attack'
              },
              {
                id: '437.6',
                name: '4.3.7.	- Unintended transfer of data can occur'
              }
            ]
          },
          {
            id: '79',
            name: 'Vulnerablity',
            item_name: [
              {
                id: '[1.1]',
                name: '[1.1] - Vehicle related data held on back-end servers being lost or compromised'
              },
              {
                id: '[1.2]',
                name: '[1.2] - Back-end servers used as a means to attack a vehicle or extract data'
              },
              {
                id: '[1.3]',
                name: '[1.3] - Services from back-end server being disrupted, affecting the operation of a vehicle'
              },
              {
                id: '[2.1]',
                name: '[2.1] - Spoofing of messages or data received by the vehicle'
              },
              {
                id: '[2.2]',
                name: '[2.2] - Communication channels used to conduct unauthorized manipulation, deletion or other amendments to vehicle held code/data'
              },
              {
                id: '[2.3]',
                name: '[2.3] - Communication channels permit untrusted/unreliable messages to be accepted or are vulnerable to session hijacking/replay attacks'
              },
              {
                id: '[2.4]',
                name: '[2.4] - Information can be readily disclosed. For example, through eavesdropping on communications or through allowing unauthorized access to sensitive files or folders'
              },
              {
                id: '[2.5]',
                name: '[2.5] - Denial of service attacks via communication channels to disrupt vehicle functions'
              },
              {
                id: '[2.6]',
                name: '[2.6] - An unprivileged user is able to gain privileged access to vehicle systems'
              },
              {
                id: '[2.7]',
                name: '[2.7] - Viruses embedded in communication media are able to infect vehicle systems'
              },
              {
                id: '[2.8]',
                name: '[2.8] - Messages received by the vehicle (for example X2V or diagnostic messages), or transmitted within it, contain malicious content'
              },
              {
                id: '[3.1]',
                name: '[3.1] - Misuse or compromise of update procedures'
              },
              {
                id: '[3.2]',
                name: '[3.2] - It is possible to deny legitimate updates'
              },
              {
                id: '[4.1]',
                name: '[4.1] - Legitimate actors are able to take actions that would unwittingly facilitate a cyberattack'
              },
              {
                id: '[5.1]',
                name: '[5.1] - Devices connected to external interfaces used as a means to attack vehicle systems'
              },
              {
                id: '[5.2]',
                name: '[5.2] - Manipulation of the connectivity of vehicle functions enables a cyberattack'
              },
              {
                id: '[5.3]',
                name: '[5.3] - Manipulation of the connectivity of vehicle functions enables a cyberattack'
              },
              {
                id: '[6.1]',
                name: '[6.1] - Extraction of vehicle data/code'
              },
              {
                id: '[6.2]',
                name: '[6.2] - Manipulation of vehicle data/code'
              },
              {
                id: '[6.3]',
                name: '[6.3] - Erasure of data/code'
              },
              {
                id: '[6.4]',
                name: '[6.4] - Introduction of malware'
              },
              {
                id: '[6.5]',
                name: '[6.5] - Introduction of new software or overwrite existing software'
              },
              {
                id: '[6.6]',
                name: '[6.6] - Disruption of systems or operations'
              },
              {
                id: '[6.7]',
                name: '[6.7] - Manipulation of vehicle parameters'
              },
              {
                id: '[7.1]',
                name: '[7.1] - Parts or supplies could be compromised to permit vehicles to be attacked'
              },
              {
                id: '[7.2]',
                name: '[7.2] - Cryptographic technologies can be compromised or insufficiently applied'
              },
              {
                id: '[7.3]',
                name: '[7.3] - Software or hardware development permits vulnerabilities'
              },
              {
                id: '[7.4]',
                name: '[7.4] - Network design introduces vulnerabilities'
              },
              {
                id: '[7.5]',
                name: '[7.5] - Physical manipulation of systems can enable an attack'
              },
              {
                id: '[7.6]',
                name: '[7.6] - Unintended transfer of data can occur'
              }
            ]
          },
          {
            id: '80',
            name: 'Mitigations',
            item_name: [
              {
                id: 'M1',
                name: '[M1] - Security Controls are applied to back-end systems to minimise the risk of insider attack'
              },
              {
                id: 'M2',
                name: '[M2] - Security Controls are applied to back-end systems to minimise unauthorised access. Example Security Controls can be found in OWASP'
              },
              {
                id: 'M3',
                name: '[M3] - Security Controls are applied to back-end systems. Where back-end servers are critical to the provision of services, there are recovery measures in case of system outage. Example Security Controls can be found in OWASP'
              },
              {
                id: 'M4',
                name: '[M4] - Security Controls are applied to minimise risks associated with cloud computing. Example Security Controls can be found in OWASP and NCSC cloud computing guidance'
              },
              {
                id: 'M5',
                name: '[M5] - Security Controls are applied to back-end systems to prevent data breaches. Example Security Controls can be found in OWASP'
              },
              {
                id: 'M6',
                name: '[M6] - Systems shall implement security by design to minimize risks'
              },
              {
                id: 'M7',
                name: '[M7] - Access control techniques and designs shall be applied to protect system data/code'
              },
              {
                id: 'M8',
                name: '[M8] - Through system design and access control, it should not be possible for unauthorized personnel to access personal or system-critical data. Examples of Security Controls can be found in OWASP'
              },
              {
                id: 'M9',
                name: '[M9] - Measures to prevent and detect unauthorized access shall be employed'
              },
              {
                id: 'M10',
                name: '[M10] - The vehicle shall verify the authenticity and integrity of messages it receives'
              },
              {
                id: 'M11',
                name: '[M11] - Security controls shall be implemented for storing cryptographic keys (e.g., use of Hardware Security Modules)'
              },
              {
                id: 'M12',
                name: '[M12] - Confidential data transmitted to or from the vehicle shall be protected'
              },
              {
                id: 'M13',
                name: '[M13] - Measures to detect and recover from a denial of service attack shall be employed'
              },
              {
                id: 'M14',
                name: '[M14] - Measures to protect systems against embedded viruses/malware should be considered'
              },
              {
                id: 'M15',
                name: '[M15] - Measures to detect malicious internal messages or activity should be considered'
              },
              {
                id: 'M16',
                name: '[M16] - Secure software update procedures shall be employed'
              },
              {
                id: 'M17',
                name: '[M17] - Not provided'
              },
              {
                id: 'M18',
                name: '[M18] - Measures shall be implemented for defining and controlling user roles and access privileges, based on the principle of least access privilege'
              },
              {
                id: 'M19',
                name: '[M19] - Organizations shall ensure security procedures are defined and followed, including logging of actions and access related to the management of the security functions'
              },
              {
                id: 'M20',
                name: '[M20] - Security controls shall be applied to systems that have remote access'
              },
              {
                id: 'M21',
                name: '[M21] - Software shall be security assessed, authenticated, and integrity protected. Security controls shall be applied to minimize the risk from third-party software that is intended or foreseeable to be hosted on the vehicle'
              },
              {
                id: 'M22',
                name: '[M22] - Security controls shall be applied to external interfaces'
              },
              {
                id: 'M23',
                name: '[M23] - Cybersecurity best practices for software and hardware development shall be followed'
              },
              {
                id: 'M24',
                name: '[M24] - Best practices for the protection of data integrity and confidentiality shall be followed for storing personal data'
              }
            ]
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
  // reports: {
  //   id: '10',
  //   name: 'Reporting',
  //   icon: 'ReportIcon',
  //   scenes: []
  // },
  // layouts: {
  //   id: '11',
  //   name: 'Layouts',
  //   icon: 'LayoutIcon',
  //   scenes: []
  // },
  scenerio: {},
  component: [],
  originalNodes: [],
  DsTable: DsDerivationHeader.map((column) => column.name),
  dmgScenTblClms: DSTableHeader.map((column) => column.name),
  threatScenTblClms: TsTableHeader.map((column) => column.name),
  attackTreeTblClms: AttackTableHeader.map((column) => column.name),
  riskTreatmentTblClms: RiskTreatmentHeaderTable.map((column) => column.name),
  CybersecurityGoalsTable: CybersecurityGoalsHeader.map((column) => column.name),
  CybersecurityRequirementsTable: CybersecurityRequirementsHeader.map((column) => column.name),
  CybersecurityControlsTable: CybersecurityControlsHeader.map((column) => column.name),
  CybersecurityClaimsTable: CybersecurityClaimsHeader.map((column) => column.name),

  // Object to store filtered data for multiple tables
  filteredTableData: {},

  // Update visible columns for a specific table
  setVisibleColumns: (table, columns) => {
    set((state) => ({
      [table]: columns
    }));
  },

  setSaveModal: (value) =>
    set(() => ({
      isSaveModalOpen: Boolean(value)
    })),

  // Toggle column visibility for a specific table
  toggleColumnVisibility: (table, columnName) => {
    const currentColumns = get()[table] || [];
    const isCurrentlyVisible = currentColumns.includes(columnName);
    const updatedColumns = isCurrentlyVisible ? currentColumns.filter((col) => col !== columnName) : [...currentColumns, columnName];

    // Update visible columns for the table
    set({
      [table]: updatedColumns
    });

    // Update the filteredTableData object
    set((state) => ({
      filteredTableData: {
        ...state.filteredTableData,
        [table]: updatedColumns
      }
    }));
  },

  getCatalog: async () => {
    try {
      const url = `${configuration.apiBaseUrl}v1/get/catalog`;
      const options = {
        method: 'POST',
        url,
        headers: {
          ...createHeadersForJson()
        }
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
      const { filteredTableData } = get();

      // Iterate through filteredTableData and append all tables to the payload
      Object.keys(filteredTableData).forEach((tableKey) => {
        const tableData = filteredTableData[tableKey];
        if (Array.isArray(tableData)) {
          // Join array elements into a string with a delimiter (e.g., comma or newline)
          const tableString = tableData.join(','); // Change delimiter if needed (e.g., use '\n' for newline separation)
          payload.append(tableKey, tableString); // Append the plain string
        }
      });

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
      // undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
      // redoStack: [],
      nodes: updatedNodes // set the updated nodes
    }));
  },

  onEdgesChange: (changes) => {
    const currentEdges = get().edges; // get current edges
    const updatedEdges = applyEdgeChanges(changes, currentEdges); // apply changes

    set((state) => ({
      // undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
      // redoStack: [],
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

    // Check if an edge already exists between source and target
    const edgeExists = edges.some(
      (edge) =>
        (edge.source === connection.source && edge.target === connection.target) ||
        (edge.source === connection.target && edge.target === connection.source)
    );

    if (edgeExists) {
      console.log('Connection already exists between the source and target.');
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
    const isMatchingType = parent.data.connections?.some((conn) => conn.type === child.type);

    if (!isMatchingType) {
      console.log(`Connection not allowed: Child node type "${child.type}" does not match any type in parent's connections.`);
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
    set((state) => ({
      nodes: typeof newNodes === 'function' ? newNodes(state.nodes) : newNodes
    }));
  },

  setInitialNodes: (newNodes) => {
    set(() => ({
      initialNodes: newNodes
    }));
  },
  setSelectedNodes: (newNodes) => {
    set((state) => ({
      selectedNodes: typeof newNodes === 'function' ? newNodes(state.selectedNodes) : newNodes
    }));
  },

  setEdges: (newEdges) => {
    set({
      edges: newEdges
    });
  },

  setInitialEdges: (newEdges) => {
    set({
      initialEdges: newEdges
    });
  },

  updateNodeDimensions: (nodeId, newDimensions) =>
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            style: { ...node.style, ...newDimensions } // Update dimensions in the style
          };
        }
        return node;
      });
      return { nodes: updatedNodes };
    }),

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
            id: '51',
            name: 'Cybersecurity Goals'
          },
          {
            id: '53',
            name: 'Cybersecurity Requirements'
          },
          {
            id: '52',
            name: 'Cybersecurity Controls'
          },
          {
            id: '54',
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
              id: '51',
              name: 'Cybersecurity Goals'
            },
            {
              id: '53',
              name: 'Cybersecurity Requirements'
            },
            {
              id: '52',
              name: 'Cybersecurity Controls'
            },
            {
              id: '54',
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
              id: '81',
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
    // console.log('res', res);
    return res;
  },

  updateOverallRating: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/attack_feasibility_rating`;
    const res = await PATCH_CALL(details, url);
    // console.log('res', res);
    return res;
  },

  updateRiskTable: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/update/riskDetAndTreat`;
    const res = await PATCH_CALL(details, url);
    // console.log('res', res);
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
  },

  createPropmt: async (details) => {
    const url = `${configuration.apiBaseUrl}v1/generateAndStoreAttack`;
    const res = await ADD_CALL(details, url);
    // console.log('res', res);
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

  deleteCybersecurity: async (details) => {
    let url = `${configuration.apiBaseUrl}v1/delete/cybersecurity`;
    const res = await DELETE_CALL(details, url);
    return res;
  },
  deleteAttacks: async (details) => {
    let url = `${configuration.apiBaseUrl}v1/delete/attacks`;
    const res = await DELETE_CALL(details, url);
    return res;
  },
  deleteRiskTreatment: async (details) => {
    let url = `${configuration.apiBaseUrl}v1/delete/risktreatment`;
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
