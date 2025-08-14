// theme constant
export const gridSpacing = 3;
export const drawerWidth = 400;
export const sidebarWidth = 400;
export const appDrawerWidth = 320;
export const getNavbarHeight = (isCollapsed) => (isCollapsed ? 50 : 145);
export const height = '93svh';
export const fontSize = 13;
export const tableHeight = '100vh';

export const lightTheme = {
  navBG: '#e3e3e3',
  tabBorder: '#f7f7f7',
  tabBG: '#e3e3e3',
  selectedTab: '#5c636e',
  sidebarBG: '#f7f7f7',
  sidebarInnerBG: '#f7f7f7',
  canvaSurroundsBG: '#f7f7f7',
  canvasBG: '#f7f7f7',
  sidebarContent: '#000',
  tabContentClr: '#000',
  title: '#000',
  logo: '#5FBDFF',
  iconColor: '#555555',
  stroke: '#000',
  line: '#f5f5f5',
  leftbarBG: '#f5f5f5',
  label: '#666666',
  modalBg: '#ffffff',
  paperBg: '#ffffff', // Background for Paper components
  borderColor: '#d1d1d1', // Border for tables and charts
  textPrimary: '#000000', // Primary text color
  textSecondary: '#666666', // Secondary text color
  tableHeaderBg: '#e0e0e0', // Table header background
  tableRowOdd: '#f9f9f9', // Odd row background
  tableRowHover: '#e6f0fa', // Row hover background
  primaryButtonBg: '#5FBDFF', // Primary button background
  primaryButtonText: '#ffffff', // Primary button text
  primaryButtonHoverBg: '#4a9cd6', // Primary button hover
  buttonText: '#5c636e', // Default button text
  buttonBorder: '#d1d1d1', // Default button border
  buttonHoverBorder: '#5FBDFF', // Button hover border
  buttonHoverBg: '#e6f0fa', // Button hover background
  buttonDisabledBg: '#e0e0e0', // Disabled button background
  buttonDisabledText: '#999999', // Disabled button text
  chartBackground: '#ffffff', // Chart background
  chartGrid: '#d1d1d1', // Chart grid lines
  chartText: '#000000', // Chart labels and text
  chartColors: [ // Chart series colors
    '#5FBDFF', // Primary
    '#FF6B6B', // Error
    '#FFCA28', // Warning
    '#4CAF50', // Success
    '#AB47BC', // Secondary
  ],
};

export const darkTheme = {
  navBG: '#36454F',
  tabBorder: '#222831',
  tabBG: '#36454F',
  selectedTab: '#D1D9E0',
  sidebarBG: '#36454F',
  sidebarInnerBG: '#36454F',
  canvaSurroundsBG: '#36454F',
  canvasBG: '#36454F',
  sidebarContent: '#D1D9E0',
  tabContentClr: '#D1D9E0',
  title: '#D1D9E0',
  logo: '#5FBDFF',
  iconColor: '#D1D9E0',
  stroke: '#f5f5f5',
  line: '#000',
  leftbarBG: '#222831',
  label: '#f7f7f7',
  modalBg: '#2a3439',
  paperBg: '#1F272B', // Dark background for Paper
  borderColor: '#4a5b66', // Border for tables and charts
  textPrimary: '#F1F5F9', // Primary text color
  textSecondary: '#A0AEC0', // Secondary text color
  tableHeaderBg: '#4a5b66', // Table header background
  tableRowOdd: '#37444d', // Odd row background
  tableRowHover: '#4a5b66', // Row hover background
  primaryButtonBg: '#5FBDFF', // Primary button background
  primaryButtonText: '#ffffff', // Primary button text
  primaryButtonHoverBg: '#4a9cd6', // Primary button hover
  buttonText: '#D1D9E0', // Default button text
  buttonBorder: '#4a5b66', // Default button border
  buttonHoverBorder: '#5FBDFF', // Button hover border
  buttonHoverBg: '#4a5b66', // Button hover background
  buttonDisabledBg: '#4a5b66', // Disabled button background
  buttonDisabledText: '#666666', // Disabled button text
  chartBackground: '#2a3439', // Chart background
  chartGrid: '#4a5b66', // Chart grid lines
  chartText: '#D1D9E0', // Chart labels and text
  chartColors: [ // Chart series colors (same as light for consistency)
    '#5FBDFF', // Primary
    '#FF6B6B', // Error
    '#FFCA28', // Warning
    '#4CAF50', // Success
    '#AB47BC', // Secondary
  ],
};

export const iconStyle = {
  position: 'absolute',
  top: '-12px',
  background: '#007bff',
  borderRadius: '50%',
  width: '20px',
  height: '19px',
  fontSize: '0.7rem',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease-in-out',
};
