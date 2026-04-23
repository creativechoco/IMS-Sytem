const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export async function createEmployee(payload) {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === 'photoPreview') return
    formData.append(key, value)
  })

  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let errorPayload
    try {
      errorPayload = await response.json()
    } catch (err) {
      throw new Error('Unable to connect to the server.')
    }
    const message = errorPayload?.message || 'Unable to save employee'
    throw new Error(message)
  }

  return response.json()
}

export async function updateEmployee(id, payload) {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === 'photoPreview') return
    formData.append(key, value)
  })

  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'POST',
    headers: { 'X-HTTP-Method-Override': 'PUT' },
    body: formData,
  })

  if (!response.ok) {
    let errorPayload
    try {
      errorPayload = await response.json()
    } catch (err) {
      throw new Error('Unable to connect to the server.')
    }
    const message = errorPayload?.message || 'Unable to update employee'
    throw new Error(message)
  }

  return response.json()
}

export async function getEmployees() {
  const response = await fetch(`${API_BASE_URL}/employees`)

  if (!response.ok) {
    throw new Error('Unable to load employees')
  }

  return response.json()
}
