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
  if (value === 'Severe') {
    return 'red';
  }
  if (value === 'Major') {
    return 'orange';
  }
  if (value === 'Moderate') {
    return 'yellow';
  }
  if (value === 'Negligible') {
    return '#65B741';
  }
  return 'white';
};
