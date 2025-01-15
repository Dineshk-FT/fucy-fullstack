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
  // { id: 3, name: 'Damage Scenario' },
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

export const DsDerivationHeader = [
  { id: 1, name: 'Task/Requirement' },
  { id: 2, name: 'Checked' },
  { id: 3, name: 'Losses of Cybersecurity Properties' },
  { id: 4, name: 'Assets' },
  { id: 5, name: 'Damage Scenarios' }
];

export const TsTableHeader = [
  { id: 1, name: 'SNo' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'Description' },
  { id: 5, name: 'Damage Scenarios' },
  { id: 6, name: 'Related Threats from Catalog' },
  { id: 7, name: 'Losses of Cybersecurity Properties' },
  { id: 8, name: 'Assets' },
  { id: 9, name: 'Related Attack Trees' },
  { id: 10, name: 'Related Attack Path Models' },
  { id: 11, name: 'Assessment References' },
  { id: 12, name: 'To be Assessed' },
  { id: 13, name: 'Assessment Jurification' }
];

export const AttackTableHeader = [
  { id: 1, name: 'SNO' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'Description' },
  { id: 5, name: 'Approach' },
  { id: 6, name: 'Elapsed Time' },
  { id: 7, name: 'Expertise' },
  { id: 8, name: 'Knowledge of the Item' },
  { id: 9, name: 'Window of Opportunity' },
  { id: 10, name: 'Equipment' },
  { id: 11, name: 'Attack Vector' },
  { id: 12, name: 'Attack Complexity' },
  { id: 13, name: 'Privileges Required' },
  { id: 14, name: 'User Interaction' },
  { id: 15, name: 'Scope' },
  { id: 16, name: 'Determination Criteria' },
  { id: 17, name: 'Attack Feasibilities Rating' },
  { id: 18, name: 'Attack Feasability Rating Justification' }
];

export const RiskTreatmentHeaderTable = [
  { id: 1, name: 'SNo' },
  { id: 2, name: 'Threat Scenario' },
  { id: 3, name: 'Assets' },
  { id: 4, name: 'Damage Scenarios' },
  { id: 5, name: 'Related UNECE Threats or Vulns' },
  { id: 6, name: 'Safety Impact' },
  { id: 7, name: 'Financial Impact' },
  { id: 8, name: 'Operational Impact' },
  { id: 9, name: 'Privacy Impact' },
  { id: 10, name: 'Attack Tree or Attack Path(s)' },
  { id: 11, name: 'Attack Path Name' },
  { id: 12, name: 'Attack Path Details' },
  { id: 13, name: 'Attack Feasibility Rating' },
  { id: 14, name: 'Mitigated Attack Feasibility' },
  { id: 15, name: 'Acceptence Level' },
  { id: 16, name: 'Safety Risk' },
  { id: 17, name: 'Financial Risk' },
  { id: 18, name: 'Operational Risk' },
  { id: 19, name: 'Privacy Risk' },
  { id: 20, name: 'Residual Safety Risk' },
  { id: 21, name: 'Residual Financial Risk' },
  { id: 22, name: 'Residual Operational Risk' },
  { id: 23, name: 'Residual Privacy Risk' },
  { id: 24, name: 'Risk Treatment Options' },
  { id: 25, name: 'Risk Treatment Justification' },
  { id: 26, name: 'Applied Measures' },
  { id: 27, name: 'Detailed / Combained Threat Scenarios' },
  { id: 28, name: 'Cybersecurity Goals' },
  { id: 29, name: 'Contributing Requirements' },
  { id: 30, name: 'Cybersecurity Claims' }
];

export const VulnerbilityHeader = [
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
];

export const MitigationsHeader = [
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
  // console.log('impact', impact);
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

export const getCybersecurityType = (type) => {
  const getType = {
    'Cybersecurity Goals': 'cybersecurity_goals',
    'Cybersecurity Requirements': 'cybersecurity_requirements',
    'Cybersecurity Controls': 'cybersecurity_controls',
    'Cybersecurity Claims': 'cybersecurity_claims'
  };
  return getType[type];
};

//Cybersecurity Table Headers
export const CybersecurityGoalsHeader = [
  { id: 1, name: 'SNo' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Description' },
  { id: 4, name: 'CAL' },
  { id: 5, name: 'Related Threat Scenario' },
  { id: 6, name: 'Related Cybersecurity Requirements' },
  { id: 7, name: 'Related Cybersecurity Controls' }
];

export const CybersecurityClaimsHeader = [
  { id: 1, name: 'SNo' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Description' },
  { id: 4, name: 'Condition for Re-Evaluation' },
  { id: 5, name: 'Related Threat Scenario' }
];
export const CybersecurityRequirementsHeader = [
  { id: 1, name: 'SNo' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Description' },
  { id: 4, name: 'Related Cybersecurity Goals' },
  { id: 5, name: 'Related Cybersecurity Controls' }
];
export const CybersecurityControlsHeader = [
  { id: 1, name: 'SNo' },
  { id: 2, name: 'Name' },
  { id: 3, name: 'Description' },
  { id: 4, name: 'Related Cybersecurity Goals' },
  { id: 5, name: 'Related Cybersecurity Requirements' }
];
