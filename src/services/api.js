const API_BASE_URL = "https://fsd-project-bd.onrender.com";

/**
 * Helper function to handle standard JSON requests
 */
async function fetchWithJSON(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}: Failed to fetch`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Authentication APIs
 */
export const AuthAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error("Login failed");
    return await response.text();
  },
  register: async (userData) => {
    return fetchWithJSON("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
};

/**
 * Assignments APIs
 */
export const AssignmentsAPI = {
  getAll: async () => {
    return fetchWithJSON("/assignments");
  },
  create: async (assignmentData) => {
    return fetchWithJSON("/assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });
  },
};

/**
 * Subjects APIs
 */
export const SubjectsAPI = {
  getAll: async () => {
    return fetchWithJSON("/subjects");
  },
};

/**
 * Submissions APIs
 */
export const SubmissionsAPI = {
  getAll: async () => {
    return fetchWithJSON("/submissions");
  },
  gradeSubmission: async (id, score, feedback) => {
    // Note: The backend returns a String for this endpoint, not JSON
    const response = await fetch(`${API_BASE_URL}/submissions/${id}/grade`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ score: Number(score), feedback }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }

    return await response.text();
  },
};
