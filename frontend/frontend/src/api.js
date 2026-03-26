const API_BASE_URL = 'http://localhost:5000/api'

const parseResponse = async (response) => {
    const data = await response.json()

    if (!response.ok) {
        if (Array.isArray(data)) {
            return {
                success: false,
                data,
            }
        }

        return {
            ...data,
            success: false,
        }
    }

    if (Array.isArray(data)) {
        return Object.assign([], data, { success: true })
    }

    return {
        ...data,
        success: true,
    }
}

const withErrorHandling = async (requestFn) => {
    try {
        return await requestFn()
    } catch (_error) {
        return {
            success: false,
            message: 'Cannot connect to backend. Start backend server on port 5000.',
        }
    }
}

export const api = {
    register: async (payload) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            return parseResponse(response)
        })
    },

    login: async (payload) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            return parseResponse(response)
        })
    },

    googleLogin: async (payload) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            return parseResponse(response)
        })
    },

    getJobs: async () => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/jobs`)
            return parseResponse(response)
        })
    },

    getRecruiterJobs: async (recruiterId) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`)
            return parseResponse(response)
        })
    },

    postJob: async (payload) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            return parseResponse(response)
        })
    },

    deleteJob: async ({ jobId, recruiterId }) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recruiterId }),
            })

            return parseResponse(response)
        })
    },

    applyForJob: async ({ studentId, jobId, resumeFile }) => {
        return withErrorHandling(async () => {
            const formData = new FormData()
            formData.append('studentId', studentId)
            formData.append('jobId', jobId)

            if (resumeFile) {
                formData.append('resume', resumeFile)
            }

            const response = await fetch(`${API_BASE_URL}/applications/apply`, {
                method: 'POST',
                body: formData,
            })

            return parseResponse(response)
        })
    },

    getStudentApplications: async (studentId) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/applications/student/${studentId}`)
            return parseResponse(response)
        })
    },

    getRecruiterApplications: async (recruiterId) => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/applications/recruiter/${recruiterId}`)
            return parseResponse(response)
        })
    },

    getUsersCount: async () => {
        return withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/users/count`)
            return parseResponse(response)
        })
    },
}
