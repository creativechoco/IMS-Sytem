import { useMemo, useState } from 'react'
import { Search, Plus, Edit2, Trash2, Users, Download } from './icons'

/**
 * Employee listing table. Data is currently provided by the parent
 * Dashboard (frontend-only mock). Backend integration pending.
 */
function EmployeeList({
  employees = [],
  loading = false,
  onEdit,
  onDelete,
  onNew,
  onExportZip,
  exportingZip = false,
}) {
  const [search, setSearch] = useState('')
  const [confirmingEmp, setConfirmingEmp] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((emp) => {
      const haystack = [
        emp.first_name,
        emp.middle_name,
        emp.last_name,
        emp.id_number,
        emp.position,
        emp.department,
        emp.contact_number,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [employees, search])

  const openConfirm = (emp) => {
    setConfirmingEmp(emp)
    setConfirmError('')
  }

  const closeConfirm = () => {
    if (confirming) return
    setConfirmingEmp(null)
    setConfirmError('')
  }

  const confirmDelete = async () => {
    if (!confirmingEmp) return
    setConfirming(true)
    setConfirmError('')
    try {
      await onDelete?.(confirmingEmp.id)
      setConfirmingEmp(null)
    } catch (err) {
      setConfirmError(err?.message || 'Unable to delete employee')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="emp-list">
      <div className="list-toolbar">
        <div className="list-title">
          <Users size={20} />
          <span>All Employees</span>
          <span className="total-badge">{employees.length}</span>
        </div>
        <div className="list-actions">
          <button
            className="btn-export"
            onClick={onExportZip}
            disabled={exportingZip || employees.length === 0}
            title={employees.length === 0 ? 'No employees to export' : 'Download all IDs as ZIP'}
          >
            <Download size={14} />
            {exportingZip ? 'Exporting…' : 'Export ZIP'}
          </button>
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-new" onClick={onNew}>
            <Plus size={15} />
            New Employee
          </button>
        </div>
      </div>

      <div className="list-table-wrapper">
        {loading ? (
          <div className="list-loading">
            <div className="loading-spinner" />
            <span>Loading employees…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="list-empty">
            <Users size={40} />
            <p>{employees.length === 0 ? 'No employees yet' : 'No matches found'}</p>
            {employees.length === 0 && (
              <button className="btn-new" onClick={onNew}>
                <Plus size={14} /> Add First Employee
              </button>
            )}
          </div>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>ID Number</th>
                <th>Full Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase()
                const photoSrc = emp.photoPreview || emp.photo_url
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="table-photo">
                        {photoSrc ? (
                          <img src={photoSrc} alt={emp.first_name || 'Employee'} />
                        ) : (
                          <div className="table-photo-placeholder">{initials || '—'}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="id-chip">{emp.id_number || '—'}</span>
                    </td>
                    <td className="name-cell">
                      {[emp.first_name, emp.middle_name ? `${emp.middle_name[0]}.` : '', emp.last_name]
                        .filter(Boolean)
                        .join(' ')}
                    </td>
                    <td>{emp.position || '—'}</td>
                    <td>{emp.department || '—'}</td>
                    <td>{emp.contact_number || '—'}</td>
                    <td>
                      <span className={`status-pill ${emp.status || 'active'}`}>
                        {emp.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="tbl-btn edit"
                          onClick={() => onEdit?.(emp)}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="tbl-btn delete"
                          onClick={() => openConfirm(emp)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmingEmp && (
        <div
          className="confirm-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="confirm-modal"
            style={{
              background: '#fff',
              color: '#111',
              padding: '22px 24px',
              borderRadius: '14px',
              width: '360px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>Delete employee</h3>
            <p style={{ margin: '0 0 12px 0', color: '#444', lineHeight: 1.5 }}>
              Are you sure you want to delete{' '}
              <strong>
                {[confirmingEmp.first_name, confirmingEmp.middle_name, confirmingEmp.last_name]
                  .filter(Boolean)
                  .join(' ') || 'this employee'}
              </strong>
              ? This action cannot be undone.
            </p>
            {confirmError && (
              <div
                style={{
                  background: '#ffecec',
                  color: '#b3261e',
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 10,
                  border: '1px solid #f2b8b5',
                }}
              >
                {confirmError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={closeConfirm} disabled={confirming}>
                Cancel
              </button>
              <button
                className="btn-ghost"
                onClick={confirmDelete}
                disabled={confirming}
                style={{ background: '#e54848', color: '#fff', borderColor: '#e54848' }}
              >
                {confirming ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeList
