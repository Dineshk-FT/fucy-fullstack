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
  const trimmed = value.trim();
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
      return 'white';
  }
};
