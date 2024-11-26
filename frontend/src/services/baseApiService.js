export const configuration = {
  // apiBaseUrl: `http://localhost:5000/`,
  apiBaseUrl: process.env.REACT_APP_API_URL,
  // backendUrl: `http://localhost:5000/`,
  // backendUrl: `https://fucybackend-djfpgndsddbybbdm.eastus-01.azurewebsites.net/`,
  backendUrl: process.env.REACT_APP_API_URL,
  // backendUrl: `http://localhost:5000/`,

  fileLimit: 10240, //10 MB
  allowedFileFormats: '.txt,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.csv',
  version: '1.0.0'
};
