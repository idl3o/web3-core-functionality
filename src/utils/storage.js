export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

export const getItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return null;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
};
