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

export const getRating = (value) => {
  if (value >= 0 && value <= 13) {
    return 'High';
  } else if (value >= 14 && value <= 19) {
    return 'Medium';
  } else if (value >= 20 && value <= 24) {
    return 'Low';
  } else {
    return 'Very low';
  }
};

export const threatType = (value) => {
  // console.log('value', value)
  switch (value) {
    case 'Integrity':
      return 'Tampering';
    case 'Confidentiality':
      return 'Information Disclosure';
    case 'Availability':
      return 'Denial of service';
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

export const AttackTableoptions = {
  Approach: [
    { value: 'Attack Potential-based Approach', label: 'Attack Potential-based Approach' },
    { value: 'CVSS-based Approach', label: 'CVSS-based Approach' },
    { value: 'Attack Vector-based Approach', label: 'Attack Vector-based Approach' }
  ],
  'Elapsed Time': [
    { value: '<= 1 day', label: '<= 1 day', rating: 0 },
    { value: '<= 1 week', label: '<= 1 week', rating: 1 },
    { value: '<= 1 month', label: '<= 1 month', rating: 4 },
    { value: '<= 6 month', label: '<= 6 month', rating: 17 },
    { value: '>6 month', label: '>6 month', rating: 19 }
  ],
  Expertise: [
    {
      value: 'Layman',
      label: 'Layman',
      rating: 0,
      description: 'Unknowledgeable compared to experts or proficient persons, with no particular expertise.'
    },
    {
      value: 'Proficient',
      label: 'Proficient',
      rating: 3,
      description: 'Knowledgeable in that they are familiar with the security behavior of the product or system type.'
    },
    {
      value: 'Expert',
      label: 'Expert',
      rating: 6,
      description:
        'Familiar with the underlying algorithms, protocols, hardware, structures, security behavior, and the complexity of scientific knowledge that leads to the definition of new attacks, cryptography, classical attacks for the product type, attack methods, etc., implemented in the product or system type. '
    },
    {
      value: 'Multiple experts',
      label: 'Multiple experts',
      rating: 8,
      description: 'Different fields of expertise are required at an expert level for distinct steps of an attack. '
    }
  ],
  'Knowledge of the Item': [
    {
      value: 'Public information',
      label: 'Public information',
      rating: 0,
      description: 'Public information concerning the item or component (e.g. as gained from the Internet).'
    },
    {
      value: 'Restricted information',
      label: 'Restricted information',
      rating: 3,
      description:
        'Restricted information concerning the item or component (e.g. knowledge that is controlled within the developer organization and shared with other organizations under a non-disclosure agreement). '
    },
    {
      value: 'Confidential information',
      label: 'Confidential information',
      rating: 7,
      description:
        'Confidential information about the item or component (e.g. knowledge that is shared between different teams within the developer organization, access to which is controlled and only to members of the design and testing teams). '
    },
    {
      value: 'Strictly confidential information',
      label: 'Strictly confidential information',
      rating: 11,
      description:
        'Highly confidential information about the item or component (e.g. knowledge that is known by a handful of individuals, access to which is very tightly controlled on a strict need-to-know basis and kept secret for individual reasons). '
    }
  ],
  'Window of Opportunity': [
    {
      value: 'Unlimited',
      label: 'Unlimited',
      rating: 0,
      description:
        'Highly availability via public/untrusted network without any time limitation (i.e. asset is always accessible). Remote access without physical presence or time limitation as well as unlimited physical access is provided to the item or component.'
    },
    {
      value: 'Easy',
      label: 'Easy',
      rating: 1,
      description: 'Highly available but limited access time. Remote access without physical presence to the item or component.'
    },
    {
      value: 'Moderate',
      label: 'Moderate',
      rating: 4,
      description:
        'Low availability of the item or component, limited physical and/or logical access. Physical access to the vehicle interior or exterior without using any special tool. '
    },
    {
      value: 'Difficult',
      label: 'Difficult',
      rating: 10,
      description:
        'Very low availability of the item or component. Impractical level of access to the item or component to perform the attack.'
    }
  ],
  Equipment: [
    {
      value: 'Standard',
      label: 'Standard',
      rating: 0,
      description:
        'Equipment is readily available to the attacker. This equipment can be a part of the product itself (e.g. debugger on an operating system), or can be readily obtained (e.g. internet sources, product samples, or simple attack scripts). '
    },
    {
      value: 'Specialized',
      label: 'Specialized',
      rating: 4,
      description:
        'Equipment is not readily available to the attacker but can be acquired without undue effort. This includes products and/or intermediate stages of equipment (e.g., power analysis tools, use of hundreds of PC hacker tools offered in the Internet) would fall into this category. Development of more extensive attack scripts or scan programs. If difficulty reflects the benchmark costs of specialized equipment are required for distinct steps of an attack, this would be rated as bespoke. '
    },
    {
      value: 'Bespoke',
      label: 'Bespoke',
      rating: 7,
      description:
        'Equipment is specially produced (e.g. very sophisticated software) and not readily available on the public or black market, or the equipment is so specialized that its distribution is controlled, possibly even restricted. Alternatively, the equipment is very expensive.'
    },
    {
      value: 'Multiple bespoke',
      label: 'Multiple bespoke',
      rating: 9,
      description:
        ' It is introduced to allow for a situation, where different types of bespoke equipment are required for distinct steps of an attack.'
    }
  ]
};

export const OverallImpact = (impact) => {
  const impactMap = {
    Negligible: 1,
    Minor: 2,
    Moderate: 3,
    Major: 4,
    Severe: 5
  };

  const impactLabel = {
    1: 'Negligible',
    2: 'Minor',
    3: 'Moderate',
    4: 'Major',
    5: 'Severe'
  };

  const maxImpactValue = Math.max(...impact.map((it) => impactMap[it] || 0));

  return impactLabel[maxImpactValue] || '';
};
