const getApiBaseUrl = () => {
  // Development mode - using IP address for physical devices
  if (__DEV__) {
    // return "http://YOUR_IP:5000"; // for physical devices: "http://YOUR_IP:5000" (can switch out)
    return "http://localhost:5000"; // for simulator (can switch out)
  }
  return "http://52.15.240.1:5000";
};

const API_BASE_URL = getApiBaseUrl();

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    RESTAURANTS: "/api/restaurants",
    RESTAURANT_MENU: (id: number) => `/api/restaurants/${id}/menu`,
    MENU_ITEMS: "/api/menu-items",
    MENU_ITEM: (id: number) => `/api/menu-items/${id}`,
    REVIEWS: "/api/reviews",
    HEALTH: "/api/health",
  },
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => {
        return {};
      });
      throw new Error(
        errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
