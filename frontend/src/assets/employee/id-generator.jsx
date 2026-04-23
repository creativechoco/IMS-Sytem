import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IDCardFront, IDCardBack } from '../components/id-preview'
import { createEmployee } from '../../services/employees'
import './id-generator.css'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const defaultForm = {
  /* Identity */
  id_number: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  position: '',
  department: '',
  blood_type: '',

  /* Contact */
  home_address: '',
  contact_number: '',
  date_of_birth: '',

  /* Government IDs */
  sss_number: '',
  pagibig_number: '',
  tin_number: '',
  philhealth_number: '',

  /* Emergency */
  emergency_name: '',
  emergency_contact: '',
  emergency_relationship: '',

  /* Photo */
  photo: null,
  photoPreview: null,
}

function seedFromLocal() {
  const stored = localStorage.getItem('employeeName') || ''
  if (!stored) return defaultForm
  /* Expected formats: "LASTNAME, FIRST M." or "First Last" */
  const parts = stored.split(',').map((s) => s.trim())
  if (parts.length === 2) {
    const [last, rest] = parts
    const tokens = rest.split(/\s+/).filter(Boolean)
    return {
      ...defaultForm,
      last_name: last,
      first_name: tokens[0] || '',
      middle_name: tokens[1]?.replace('.', '') || '',
    }
  }
  const tokens = stored.split(/\s+/).filter(Boolean)
  return {
    ...defaultForm,
    first_name: tokens[0] || '',
    last_name: tokens.slice(1).join(' '),
  }
}

function EmployeeIdGenerator() {
  const navigate = useNavigate()
  const [form, setForm] = useState(seedFromLocal)
  const [activeSide, setActiveSide] = useState('front')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState({})
  const fileRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('employeeToken')
    if (!token) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const displayName = useMemo(() => {
    const full = [form.last_name, form.first_name].filter(Boolean).join(', ')
    return full || localStorage.getItem('employeeName') || 'Employee'
  }, [form.first_name, form.last_name])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) =>
      setForm((prev) => ({ ...prev, photo: file, photoPreview: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, photo: null, photoPreview: null }))
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleReset = () => {
    setForm(defaultForm)
    setErrors({})
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = () => {
    const requiredFields = [
      'id_number',
      'first_name',
      'last_name',
      'position',
      'department',
      'home_address',
      'contact_number',
      'blood_type',
      'date_of_birth',
      'sss_number',
      'pagibig_number',
      'tin_number',
      'philhealth_number',
      'emergency_name',
      'emergency_contact',
      'emergency_relationship',
    ]

    const missing = requiredFields.filter((field) => !form[field]?.toString().trim())
    if (!form.photo) {
      missing.push('photo')
    }

    if (missing.length) {
      const nextErrors = missing.reduce((acc, key) => ({ ...acc, [key]: 'Required' }), {})
      setErrors((prev) => ({ ...prev, ...nextErrors }))
      setError('Please fill in all required fields.')
      setSuccess('')
      return
    }

    setError('')
    setSuccess('')
    setSaving(true)

    createEmployee(form)
      .then((employee) => {
        setSuccess('Your ID information has been successfully saved!')
        setForm(defaultForm)
        setErrors({})
        if (fileRef.current) fileRef.current.value = ''

        // Optionally store returned name
        if (employee?.last_name && employee?.first_name) {
          localStorage.setItem('employeeName', `${employee.last_name}, ${employee.first_name}`)
        }
      })
      .catch((err) => {
        setError(err?.message || 'Unable to save employee')
      })
      .finally(() => setSaving(false))
  }

  return (
    <div className="id-page">
      <div className="id-bg" />
      <header className="id-header">
        <div>
          <h1>Employee ID Encoding</h1>
          <p>Preview your front and back ID layout while filling out the official details.</p>
        </div>
        <div className="session-chip">
          <span className="label">Signed in as</span>
          <span className="value">{displayName}</span>
        </div>
      </header>

      <main className="id-workspace">
        <section className="form-panel">
          <div className="panel-title">
            <h2>ID Data Capture</h2>
            <p>Please match the official masterlist spelling to avoid reprints.</p>
          </div>

          {/* ── Photo Upload ── */}
          <div className="photo-upload-section">
            <div
              className={`photo-upload-area ${errors.photo ? 'has-error' : ''}`}
              onClick={() => !form.photoPreview && fileRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {form.photoPreview ? (
                <div className="photo-preview-box">
                  <img src={form.photoPreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      removePhoto()
                    }}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="photo-placeholder">
                  <span className="upload-glyph">⬆</span>
                  <span>Upload 2×2 Photo</span>
                  <span className="photo-hint">JPG, PNG up to 5MB</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhoto}
            />
          </div>

          {/* ── Personal Information ── */}
          <div className="form-section">
            <div className="section-header">Personal Information</div>
            <div className="form-grid">
              <label>
                <span>First Name*</span>
                <input
                  type="text"
                  placeholder="Maria"
                  value={form.first_name}
                  onChange={handleChange('first_name')}
                  className={errors.first_name ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Middle Name</span>
                <input
                  type="text"
                  placeholder="Santos"
                  value={form.middle_name}
                  onChange={handleChange('middle_name')}
                />
              </label>
              <label>
                <span>Last Name*</span>
                <input
                  type="text"
                  placeholder="Dela Cruz"
                  value={form.last_name}
                  onChange={handleChange('last_name')}
                  className={errors.last_name ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>ID Number</span>
                <input
                  type="text"
                  placeholder="BFAR12 COS-0001"
                  value={form.id_number}
                  onChange={handleChange('id_number')}
                  className={errors.id_number ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Position / Title</span>
                <input
                  type="text"
                  placeholder="Aquaculture Technician"
                  value={form.position}
                  onChange={handleChange('position')}
                  className={errors.position ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Department</span>
                <input
                  type="text"
                  placeholder="Fisheries Post-Harvest"
                  value={form.department}
                  onChange={handleChange('department')}
                  className={errors.department ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Blood Type</span>
                <select
                  value={form.blood_type}
                  onChange={handleChange('blood_type')}
                  className={errors.blood_type ? 'has-error' : ''}
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* ── Contact Information ── */}
          <div className="form-section">
            <div className="section-header">Contact Information</div>
            <div className="form-grid">
              <label className="full">
                <span>Home Address</span>
                <textarea
                  placeholder="House no, Street, Barangay, Municipality"
                  value={form.home_address}
                  onChange={handleChange('home_address')}
                  className={errors.home_address ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Contact Number</span>
                <input
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  value={form.contact_number}
                  onChange={handleChange('contact_number')}
                  className={errors.contact_number ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Date of Birth</span>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={handleChange('date_of_birth')}
                  className={errors.date_of_birth ? 'has-error' : ''}
                />
              </label>
            </div>
          </div>

          {/* ── Government IDs ── */}
          <div className="form-section">
            <div className="section-header">Government IDs</div>
            <div className="form-grid">
              <label>
                <span>SSS Number</span>
                <input
                  type="text"
                  placeholder="12-3456789-0"
                  value={form.sss_number}
                  onChange={handleChange('sss_number')}
                  className={errors.sss_number ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Pag-IBIG Number</span>
                <input
                  type="text"
                  placeholder="1234-5678-9012"
                  value={form.pagibig_number}
                  onChange={handleChange('pagibig_number')}
                  className={errors.pagibig_number ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>TIN Number</span>
                <input
                  type="text"
                  placeholder="123-456-789-000"
                  value={form.tin_number}
                  onChange={handleChange('tin_number')}
                  className={errors.tin_number ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>PhilHealth No.</span>
                <input
                  type="text"
                  placeholder="12-345678901-2"
                  value={form.philhealth_number}
                  onChange={handleChange('philhealth_number')}
                  className={errors.philhealth_number ? 'has-error' : ''}
                />
              </label>
            </div>
          </div>

          {/* ── Emergency Contact ── */}
          <div className="form-section emergency">
            <div className="section-header emergency-header">Emergency Contact</div>
            <div className="form-grid">
              <label>
                <span>Contact Name</span>
                <input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={form.emergency_name}
                  onChange={handleChange('emergency_name')}
                  className={errors.emergency_name ? 'has-error' : ''}
                />
              </label>
              <label>
                <span>Contact Number</span>
                <input
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  value={form.emergency_contact}
                  onChange={handleChange('emergency_contact')}
                  className={errors.emergency_contact ? 'has-error' : ''}
                />
              </label>
              <label className="full">
                <span>Relationship</span>
                <input
                  type="text"
                  placeholder="Spouse, Parent, Sibling…"
                  value={form.emergency_relationship}
                  onChange={handleChange('emergency_relationship')}
                  className={errors.emergency_relationship ? 'has-error' : ''}
                />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="ghost" onClick={() => navigate('/', { replace: true })}>
              Return to landing
            </button>
            <div className="action-group">
              <button type="button" className="ghost" onClick={handleReset}>
                Reset
              </button>
              <button type="button" className="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Submitting…' : 'Submit now'}
              </button>
            </div>
          </div>

          {(error || success) && (
            <div className={`form-status ${error ? 'error' : 'success'}`}>
              {error || success}
            </div>
          )}
        </section>

        <section className="preview-panel">
          <div className="preview-header">
            <h2>ID Preview</h2>
            <div className="toggle-group">
              <button
                type="button"
                className={activeSide === 'front' ? 'toggle active' : 'toggle'}
                onClick={() => setActiveSide('front')}
              >
                Front
              </button>
              <button
                type="button"
                className={activeSide === 'back' ? 'toggle active' : 'toggle'}
                onClick={() => setActiveSide('back')}
              >
                Back
              </button>
            </div>
          </div>

          <div className={`id-canvas ${activeSide}`}>
            {activeSide === 'front' ? (
              <IDCardFront data={form} />
            ) : (
              <IDCardBack data={form} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default EmployeeIdGenerator