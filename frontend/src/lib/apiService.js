// API Service Layer for Eco-Collect Kenya
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = null;
        this.refreshToken = null;
        this.useFallbackData = false;
    }

    // Set authentication tokens
    setTokens(accessToken, refreshToken = null) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
        }
    }

    // Get stored tokens
    getTokens() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
        }
        return { accessToken: this.token, refreshToken: this.refreshToken };
    }

    // Clear tokens (logout)
    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Important: Send cookies with requests
            ...options,
        };

        // Add auth token if available
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        console.log(`API Request: ${options.method || 'GET'} ${url}`)
        console.log('Request config:', config)

        try {
            const response = await fetch(url, config);

            console.log(`API Response: ${response.status} ${response.statusText}`)

            // Handle token refresh if needed
            if (response.status === 401 && this.refreshToken) {
                const newToken = await this.refreshAccessToken();
                if (newToken) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                    return fetch(url, config);
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('API Error Response:', errorData)
                throw new Error(`HTTP error! status: ${response.status}`, { cause: errorData });
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('API Response Data:', data)
                return data;
            }
            return response;
        } catch (error) {
            console.error('API Request failed:', error);

            // In development mode, enable fallback data for connection failures
            if (
                error.message.includes('Failed to fetch') ||
                error.message.includes('CONNECTION_REFUSED') ||
                error.name === 'TypeError'
            ) {
                console.warn(`🔄 API connection failed. Using fallback data for ${endpoint}`);
                this.useFallbackData = true;
                return this.getFallbackData(endpoint, options.method || 'GET');
            }

            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken) return null;

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: this.refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access_token, data.refresh_token);
                return data.access_token;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
        }
        return null;
    }

    // Authentication endpoints
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.access_token) {
            this.setTokens(response.access_token, response.refresh_token);
        }
        return response;
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.clearTokens();
        }
    }

    // User profile endpoints
    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async getUserStats() {
        return this.request('/users/stats');
    }

    // Upload endpoints
    async uploadWastePhoto(file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request('/uploads/photo', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type
            body: formData,
        });
    }

    async classifyWaste(fileId) {
        return this.request(`/uploads/${fileId}/classify`, {
            method: 'POST',
        });
    }

    async submitWasteEntry(entryData) {
        return this.request('/submissions', {
            method: 'POST',
            body: JSON.stringify(entryData),
        });
    }

    // History endpoints
    async getSubmissionHistory(page = 1, limit = 10, filters = {}) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters,
        });

        return this.request(`/submissions/history?${params}`);
    }

    async getSubmissionById(id) {
        return this.request(`/submissions/${id}`);
    }

    async updateSubmissionStatus(id, status) {
        return this.request(`/submissions/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // Collection Centers endpoints
    async getCollectionCenters(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/centers?${params}`);
    }

    async getCenterById(id) {
        return this.request(`/centers/${id}`);
    }

    async searchCentersByLocation(latitude, longitude, radius = 10) {
        return this.request(`/centers/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
    }

    // Analytics endpoints
    async getEnvironmentalImpact() {
        return this.request('/analytics/impact');
    }

    async getPointsHistory() {
        return this.request('/analytics/points');
    }

    // Notifications endpoints
    async getNotifications() {
        return this.request('/notifications');
    }

    async markNotificationAsRead(id) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PATCH',
        });
    }

    // Fallback data for development when API is not available
    getFallbackData(endpoint, method = 'GET') {
        const fallbackData = {
            '/users/profile': {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+254712345678',
                location: 'Nairobi, Kenya',
                avatar: null,
                memberSince: 'January 2024',
                totalSubmissions: 24,
                totalWeight: 45.8,
                pointsEarned: 1250,
                co2Reduced: '15.2kg',
            },
            '/users/stats': {
                totalSubmissions: 24,
                totalWeight: 45.8,
                pointsEarned: 1250,
                co2Reduced: '15.2kg',
                currentMonth: { submissions: 8, weight: 12.3, points: 340 },
                achievements: 4,
                rank: 'Eco Warrior',
            },
            '/analytics/points': {
                data: [
                    { id: 1, title: 'First Submission', description: 'Made your first waste submission', icon: '🎯', unlocked: true, earnedDate: '2024-01-15' },
                    { id: 2, title: 'Eco Warrior', description: 'Submitted 10kg of recyclables', icon: '🌱', unlocked: true, earnedDate: '2024-02-20' },
                ],
                totalPoints: 1250,
                currentLevel: 'Eco Warrior',
                nextLevelPoints: 2000,
            },
        };

        if (endpoint.includes('/classify')) {
            const wasteTypes = ['plastic', 'paper', 'glass', 'metal', 'organic', 'e-waste'];
            const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
            console.log(`🤖 AI Classification: ${randomType}`);
            return Promise.resolve({
                type: randomType,
                confidence: 85,
                points: 10,
                description: 'Example classification fallback data',
                timestamp: Date.now(),
            });
        }

        for (const [path, data] of Object.entries(fallbackData)) {
            if (endpoint.includes(path)) {
                console.log(`📦 Serving fallback data for ${endpoint}`);
                return Promise.resolve(data);
            }
        }

        console.log(`⚠️ No fallback data available for ${endpoint}`);
        return Promise.resolve({ message: 'Fallback data not available', data: [] });
    }
}

// Create singleton instance
const apiService = new ApiService();

// Initialize tokens on app start
if (typeof window !== 'undefined') {
    apiService.getTokens();
}

export default apiService;
