export const colorPicker = (pr) => {
  // console.log('pr', pr);
  switch (pr) {
    case 'Confidentiality':
      return 'red';
    case 'Integrity':
      return 'green';
    case 'Availability':
      return 'yellow';
    case 'Authenticity':
      return 'blue';
    case 'Authorization':
      return 'violet';
    case 'Non-repudiation':
      return 'gray';
    default:
      return 'black';
  }
};

export const RatingColor = (value) => {
  const mapped = {
    High: 'red',
    Medium: 'yellow',
    Low: 'green',
    'Very low': 'lightgreen',
    NA: 'transparent'
  };
  return mapped[value];
};

export const threatType = (value) => {
  // console.log('value', value)
  switch (value) {
    case 'Integrity':
      return 'Tampering';
    case 'Confidentiality':
      return 'Information Disclosure';
    case 'Availability':
      return 'Denial';
    case 'Authenticity':
      return 'Spoofing';
    case 'Authorization':
      return 'Elevation of Privilage';
    case 'Non-repudiation':
      return 'Rejection';
    default:
      return '';
  }
};

export const colorPickerTab = (value) => {
  const trimmed = value?.trim();
  switch (trimmed) {
    case 'Severe':
      return 'red';
    case 'Major':
      return '#FCAE1E';
    case 'Moderate':
      return 'yellow';
    case 'Minor':
      return 'green';
    case 'Negligible':
      return 'lightgreen';
    default:
      return 'inherit';
  }
};

export const options = [
  {
    value: 'Severe',
    label: 'Severe',
    description: {
      'Safety Impact': 'Life-threatening or fatal injuries.',
      'Financial Impact':
        'The financial damage leads to significant loss for the affected road user with substantial effects on their ability to meet financial obligations.',
      'Operational Impact':
        'The operational damage leads to a loss of important or all vehicle functions. EXAMPLE 1: Major malfunction in the steering system leads to a loss of directional control. EXAMPLE 2: Significant loss in the braking system causes a severe reduction in braking force. EXAMPLE 3: Significant loss in other important functions of the vehicle.',
      'Privacy Impact':
        'The privacy damage leads to significant or very harmful impacts to the road user. The information regarding the road user’s identity is available and easy to link to PII (personally identifiable information), leading to severe harm or loss. The information belongs to third parties as well.'
    }
  },
  {
    value: 'Major',
    label: 'Major',
    description: {
      'Safety Impact': 'Severe and/or irreversible injuries or significant physical harm.',
      'Financial Impact':
        'The financial damage leads to notable loss for the affected road user, but the financial ability of the road user to meet financial obligations is not fundamentally impacted.',
      'Operational Impact':
        'The operational damage leads to partial degradation of a vehicle function. EXAMPLE 4: Degradation in steering or braking capacity.',
      'Privacy Impact':
        'The privacy damage has a notable impact on the road user. The information may be difficult to link to PII but is of a significant nature and has risks to PII principal.'
    }
  },
  {
    value: 'Moderate',
    label: 'Moderate',
    description: {
      'Safety Impact': 'Reversible physical injuries requiring treatment.',
      'Financial Impact': 'The financial damage is noticeable but does not significantly affect the financial situation of the road user.',
      'Operational Impact':
        'The operational damage leads to noticeable degradation of a vehicle function. EXAMPLE 5: Slight degradation in steering capability.',
      'Privacy Impact':
        'The privacy damage leads to moderate consequences to the road user. The information regarding the road user is not sensitive.'
    }
  },
  {
    value: 'Minor',
    label: 'Minor',
    description: {
      'Safety Impact': 'Light physical injuries, may require first aid.',
      'Financial Impact': 'The financial damage is small and can be easily absorbed by the affected road user.',
      'Operational Impact': 'The operational damage leads to an insignificant or no noticeable impact on vehicle operation.',
      'Privacy Impact':
        'The privacy damage has a light impact or no effect at all. The information is low-risk and difficult to link to PII.'
    }
  },
  {
    value: 'Negligible',
    label: 'Negligible',
    description: {
      'Safety Impact': 'No physical injuries.',
      'Financial Impact': 'The financial damage is so low that it has no significant effect on the road user.',
      'Operational Impact': "The operational damage leads to an insignificant or no post-collision damage to a vehicle's functionality.",
      'Privacy Impact': 'The privacy damage has no effect on the road user or their personal information.'
    }
  }
];

export const stakeHeader = [
  { id: 1, name: 'ID' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Damage Scenario' },
  { id: 4, name: 'Description/ Scalability' },
  { id: 5, name: 'Losses of Cybersecurity Properties' },
  { id: 6, name: 'Assets' },
  { id: 7, name: 'Component/Message' },
  { id: 8, name: 'Safety Impact per StakeHolder' },
  { id: 9, name: 'Financial Impact per StakeHolder' },
  { id: 10, name: 'Operational Impact per StakeHolder' },
  { id: 11, name: 'Privacy Impact per StakeHolder' },
  { id: 12, name: 'Impact Justification by Stakeholder' },
  { id: 13, name: 'Safety Impact' },
  { id: 14, name: 'Financial Impact' },
  { id: 15, name: 'Operational Impact' },
  { id: 16, name: 'Privacy Impact' },
  { id: 17, name: 'Impact Justification' },
  { id: 18, name: 'Associated Threat Scenarios' },
  { id: 19, name: 'Overall Impact' },
  { id: 20, name: 'Asset is Evaluated' },
  { id: 21, name: 'Cybersecurity Properties are Evaluated' },
  { id: 22, name: 'Unevaluated Cybersecurity Properties' }
];

export const DSTableHeader = [
  { id: 1, name: 'ID' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Damage Scenario' },
  { id: 4, name: 'Description/ Scalability' },
  { id: 5, name: 'Losses of Cybersecurity Properties' },
  { id: 6, name: 'Assets' },
  { id: 7, name: 'Component/Message' },
  { id: 13, name: 'Safety Impact' },
  { id: 14, name: 'Financial Impact' },
  { id: 15, name: 'Operational Impact' },
  { id: 16, name: 'Privacy Impact' },
  { id: 17, name: 'Impact Justification' },
  { id: 18, name: 'Associated Threat Scenarios' },
  { id: 19, name: 'Overall Impact' },
  { id: 20, name: 'Asset is Evaluated' },
  { id: 21, name: 'Cybersecurity Properties are Evaluated' },
  { id: 22, name: 'Unevaluated Cybersecurity Properties' }
];
