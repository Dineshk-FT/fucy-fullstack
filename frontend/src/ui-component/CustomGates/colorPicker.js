
export const colorPickerTab = (value) => {
    if (value === 'severe') {
        return 'red';
    }
    if (value === 'major') {
        return 'orange';
    }
    if (value === 'moderate') {
        return 'yellow';
    }
    if (value === 'negligible') {
        return '#65B741';
    }
    return '#000';
};