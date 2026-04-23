import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddEmployeeForm, { EMPTY_EMPLOYEE, REQUIRED_FIELDS } from './add-employee-form'
import { IDCardFront, IDCardBack } from '../components/id-preview'
import EmployeeList from './employee-list'
import { createEmployee, getEmployees, updateEmployee } from '../../services/employees'
import { downloadIdPNG, downloadIdPDF } from '../../utils/exportId'
import {
  UserPlus,
  Users,
  LogOut,
  Sun,
  Moon,
  Download,
  FileImage,
  ChevronLeft,
  ChevronRight,
} from './icons'
import './dashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [view, setView] = useState('editor') // 'editor' | 'list'
  const [formData, setFormData] = useState(EMPTY_EMPLOYEE)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [employees, setEmployees] = useState([])
  const [resetSignal, setResetSignal] = useState(0)
  const frontRef = useRef(null)
  const backRef = useRef(null)

  const adminName = useMemo(
    () => localStorage.getItem('adminName') || 'System Administrator',
    [],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    return () => document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    getEmployees()
      .then((list) => setEmployees(list || []))
      .catch(() => setEmployees([]))
  }, [])

  // Optional: redirect to landing if no admin session exists
  // (real auth wired later; comment out while building UI)
  // useEffect(() => {
  //   if (!localStorage.getItem('adminToken')) navigate('/', { replace: true })
  // }, [navigate])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handlePhotoChange = (file, dataUrl) => {
    setFormData((prev) => ({ ...prev, photo: file, photoPreview: dataUrl }))
    setErrors((prev) => ({ ...prev, photo: '' }))
  }

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null, photoPreview: null }))
  }

  const handleReset = () => {
    setFormData(EMPTY_EMPLOYEE)
    setErrors({})
    setEditingId(null)
    setResetSignal((n) => n + 1)
  }

  const handleSave = async () => {
    const missing = REQUIRED_FIELDS.filter((f) => !formData[f]?.toString().trim())
    if (!formData.photo && !formData.photoPreview) missing.push('photo')

    if (missing.length) {
      const nextErrors = missing.reduce((acc, k) => ({ ...acc, [k]: 'Required' }), {})
      setErrors(nextErrors)
      showToast('Please fill in all required fields.', 'error')
      return
    }

    setSaving(true)
    try {
      const isEdit = Boolean(editingId)
      const saved = isEdit
        ? await updateEmployee(editingId, formData)
        : await createEmployee(formData)

      const normalized = {
        ...EMPTY_EMPLOYEE,
        ...formData,
        id: saved?.id || editingId || Date.now(),
        photo_url: saved?.photo_url || formData.photoPreview || null,
        photo: null,
        photoPreview: null,
      }

      setEmployees((prev) => {
        if (isEdit) {
          return prev.map((emp) => (emp.id === editingId ? { ...emp, ...normalized } : emp))
        }
        return [normalized, ...prev]
      })

      showToast(isEdit ? 'Employee updated!' : 'Employee saved successfully!')
      setFormData(EMPTY_EMPLOYEE)
      setErrors({})
      setEditingId(null)
      setResetSignal((n) => n + 1)
    } catch (err) {
      showToast(err?.message || 'Unable to save employee', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (emp) => {
    const proxiedPhoto = emp.photo_url?.replace('/storage/', '/media/') || emp.photo_url || null
    setFormData({
      ...EMPTY_EMPLOYEE,
      ...emp,
      photoPreview: emp.photoPreview || proxiedPhoto,
      photo: null,
    })
    setEditingId(emp.id)
    setErrors({})
    setView('editor')
  }

  const handleDelete = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id))
    showToast('Employee removed.')
  }

  const handleDownload = async (kind) => {
    try {
      const name = [formData.first_name, formData.last_name].filter(Boolean).join('_') || 'Employee_ID'
      if (kind === 'png') {
        await downloadIdPNG(frontRef.current, backRef.current, name)
        showToast('PNG downloaded!')
      } else {
        await downloadIdPDF(frontRef.current, backRef.current, name)
        showToast('PDF downloaded!')
      }
    } catch (err) {
      showToast(err?.message || 'Export failed.', 'error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminName')
    navigate('/', { replace: true })
  }

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/bfar-logo.png" alt="BFAR" className="brand-logo" />
          <span className="brand-text">BFAR 12-IMS</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${view === 'editor' ? 'active' : ''}`}
            onClick={() => setView('editor')}
          >
            <UserPlus size={18} />
            <span>{editingId ? 'Edit Employee' : 'New Employee'}</span>
          </button>
          <button
            className={`nav-item ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <Users size={18} />
            <span>All Employees</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setDarkMode((d) => !d)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="sidebar-user">
            <div className="user-avatar">{adminName?.[0] || 'A'}</div>
            <div className="user-info">
              <span className="user-name">{adminName}</span>
              <span className="user-role">Admin</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        {view === 'list' ? (
          <EmployeeList
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNew={() => {
              handleReset()
              setView('editor')
            }}
          />
        ) : (
          <div className="editor-layout">
            {/* Left: Form */}
            <div className="form-panel1">
              <div className="panel-header">
                <h2>
                  <span className="panel-glyph">{editingId ? '✏️' : '＋'}</span>
                  {editingId ? 'Edit Employee' : 'New Employee'}
                </h2>
                {editingId && (
                  <button className="btn-cancel" onClick={handleReset}>
                    Cancel Edit
                  </button>
                )}
              </div>

              <AddEmployeeForm
                data={formData}
                onChange={handleChange}
                errors={errors}
                onPhotoChange={handlePhotoChange}
                onRemovePhoto={handleRemovePhoto}
                resetSignal={resetSignal}
              />

              <div className="form-actions">
                <button type="button" className="ghost" onClick={handleReset}>
                  Reset
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : editingId ? 'Update employee' : 'Save employee'}
                </button>
              </div>
            </div>

            {/* Right: Preview */}
            <aside className="preview-panel1">
              <div className="panel-header">
                <h2>
                  <span className="panel-glyph">🪪</span>
                  Live ID Preview
                </h2>
                <div className="preview-actions">
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle ${!cardFlipped ? 'active' : ''}`}
                      onClick={() => setCardFlipped(false)}
                    >
                      Front
                    </button>
                    <button
                      type="button"
                      className={`toggle ${cardFlipped ? 'active' : ''}`}
                      onClick={() => setCardFlipped(true)}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>

              <div className="id-card-stage">
                {cardFlipped ? (
                  <IDCardBack data={formData} />
                ) : (
                  <IDCardFront data={formData} />
                )}
              </div>

              <div className="download-buttons">
                <button className="dl-btn dl-png" onClick={() => handleDownload('png')}>
                  <FileImage />
                  Download PNG
                </button>
                <button className="dl-btn dl-pdf" onClick={() => handleDownload('pdf')}>
                  <Download />
                  Download PDF
                </button>
              </div>
            </aside>

            {/* Hidden render for exports (front + back always rendered) */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }} aria-hidden="true">
              <IDCardFront ref={frontRef} data={formData} />
              <IDCardBack ref={backRef} data={formData} />
            </div>
          </div>
        )}
      </main>

      {/* ── Toast ── */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}

export default AdminDashboard
