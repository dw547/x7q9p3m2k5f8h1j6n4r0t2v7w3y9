export const safeJsonParse = (jsonString, defaultValue = null) => {
    if (typeof jsonString !== 'string') {
      return defaultValue;
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue;
    }
  };