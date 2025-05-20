export const canvasSteps = [
  {
    target: '#control-panel',
    content: 'Save, restore or download the diagram with the help of Control panel.',
    disableBeacon: true
  },
  {
    target: '#controls',
    content: 'Zoom In & out and centering can be done with the controls.'
  },
  {
    target: '.react-flow__minimap',
    content: 'You can see the overall circuit with the help of mini-map .'
  }
];

export const DsSteps = [
  {
    target: '#search-input',
    content: 'Search through damage scenarios by typing in keywords related to tasks/requirements.',
    disableBeacon: true
  },
  {
    target: '#filter-columns-btn',
    content: 'Click here to select which columns to display in the table.'
  },
  {
    target: '.resize-handle',
    content: 'Drag these handles to adjust column widths for better visibility.'
  },
  {
    target: '#add-scenario',
    content: 'Click to add a new scenario to the table directly, You can fill the name and description and click the tick to add new row'
  },
  {
    target: '#delete-scenario',
    content: 'Click the Sno column to select the rows to be deleted.'
  },
  {
    target: '#column-editer',
    content: 'Name and Description can be editable by clicking the Pen icon when you move the mouse towards those cells.'
  },
  {
    target: '#select-losses',
    content: 'Click here to select the cyberecurity losses.'
  },
  {
    target: '#select-impacts',
    content: 'Click here to assign the impacts for the scene.'
  }
];

export const DsDerivedSteps = [
  {
    target: '#search-input',
    content: 'Search through damage scenarios by typing in keywords related to tasks/requirements.',
    disableBeacon: true
  },
  {
    target: '#filter-columns-btn',
    content: 'Click here to select which columns to display in the table.'
  },
  {
    target: '#column-header',
    content: 'Click the checkbox to select/deselect all rows. Drag column edges to resize.'
  },
  {
    target: '.resize-handle',
    content: 'Drag these handles to adjust column widths for better visibility.'
  },
  {
    target: '#checklist-header',
    content: 'Use checkboxes to select individual rows or select all using the header checkbox.'
  }
];

export const TsSteps = [
  {
    target: '#search-input',
    content: 'Search through damage scenarios by typing in keywords related to tasks/requirements.',
    disableBeacon: true
  },
  {
    target: '#filter-columns-btn',
    content: 'Click here to select which columns to display in the table.'
  },
  {
    target: '#derive-btn',
    content: 'Select the rows by clicking the SNo cell of the row and derive them to create a derived scenario.'
  },
  {
    target: '#delete-btn',
    content: 'Select the rows and click on Delete to delete multiple rows.',
    placement: 'top'
  },
  {
    target: '.resize-handle',
    content: 'Drag these handles to adjust column widths for better visibility.'
  },
  {
    target: '#edit-name',
    content: 'You can edit the name and description by clicking the pen icon at the top of the cell.',
    placement: 'top'
  }
];

export const TsDerivedSteps = [
  {
    target: '#search-input',
    content: 'Search through damage scenarios by typing in keywords related to tasks/requirements.',
    disableBeacon: true
  },
  {
    target: '#filter-columns-btn',
    content: 'Click here to select which columns to display in the table.'
  },
  {
    target: '#delete-btn',
    content: 'Select the rows and click on Delete to delete multiple rows.'
  },
  {
    target: '.resize-handle',
    content: 'Drag these handles to adjust column widths for better visibility.'
  },
  {
    target: '#edit-name',
    content: 'You can edit the name and description by clicking the pen icon at the top of the cell.'
  }
];

export const attackTableSteps = [
  {
    target: '#add-btn',
    content: 'Click  here to add new attack to the table.',
    disableBeacon: true
  },
  {
    target: '#search-input',
    content: 'Search through damage scenarios by typing in keywords related to tasks/requirements.'
  },
  {
    target: '#filter-columns-btn',
    content: 'Click here to select which columns to display in the table.'
  },
  {
    target: '.resize-handle',
    content: 'Drag these handles to adjust column widths for better visibility.'
  },
  {
    target: '#select-value',
    content: 'The cells with the select Value can be selected by clicking the cell and selecting the value in the list.'
  }
];

export const attackCanvasSteps = [
  {
    target: '#control-panel',
    content: 'You can Save, restore or Align the diagram with the help of Control panel.',
    disableBeacon: true
  },
  {
    target: '.react-flow__controls',
    content: 'Zoom In & out and centering can be done with the controls.'
  },
  {
    target: '.react-flow__minimap',
    content: 'You can see the overall circuit with the help of mini-map .'
  },
  {
    target: '#resize-handle',
    content: 'You can resize the canvas for better visibility.'
  },
  {
    target: '#attack-tree',
    content: 'You can drag and drop the event or other gates into the canvas.'
  },
  {
    target: '#global-tree',
    content: 'You can drag and drop a whole template of pre-saved attacks from the global library.'
  }
];

export const riskSteps = [
  {
    target: '#search-input',
    content: 'Search through damage scenarios by typing in keywords related to tasks/requirements.',
    disableBeacon: true
  },
  {
    target: '#drag_drop',
    content: 'Drag a threat scenario and drop in the table to view the details.'
  },
  {
    target: '#filter-columns-btn',
    content: 'Click here to select which columns to display in the table.'
  },
  {
    target: '#delete-scenario',
    content: 'Click the Sno column to select the rows to be deleted.'
  },
  {
    target: '.resize-handle',
    content: 'Drag these handles to adjust column widths for better visibility.'
  },
  {
    target: '#select-catalogs',
    content: 'Click here to select the catalogs.'
  },
  {
    target: '#select-claims',
    content: 'Click here to select the Cybersecurity Claims from the saved list.'
  },
  {
    target: '#select-goals',
    content: 'Click here to select the Cybersecurity Goals from the saved list.'
  }
];

export const sidebarSteps = [
  {
    target: '#item-definition',
    content:
      'You can add Components & Data  by clicking the add icon when you move the mouse over the components and Data and assign properties for them.',
    disableBeacon: true
  },
  {
    target: '#damage-scene',
    content: 'The Damage scenes are created by the properties of Components, Data & Connectors Properties that we choose.'
  },
  {
    target: '#threat-scene',
    content:
      'By adding cyberlosses in the "Damage scenario - impact Ratings" table these scenarios are created, you can select and derive them to make derived scenarios.'
  },
  {
    target: '#attack-scene',
    content:
      'These shows the possible attacks and attack trees based on the threat scenes. we can add them by simply move the mouse above the attack or attack to see the add icon and you can also add attack templates from the global trees.'
  },
  {
    target: '#cybersecurity',
    content:
      'These part will showcase the Goals, claims, controls &Requirements that can be used in the attack trees and in the risk treatment. '
  },
  {
    target: '#catalog',
    content: 'Here you can refer the UNICE standards .'
  },
  {
    target: '#risk-treatment',
    content:
      'This will be the final outcome from the threat scenarios and the othres connected with them. You can simply drag & drop a threat scenario to see the results.'
  },
  {
    target: '#reporting',
    content: 'Here You can download the desired data in a PDF format.'
  }
];
