import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ACTION_COLORS = {
  USER_LOGIN:            'success',
  USER_LOGOUT:           'secondary',
  USER_REGISTER:         'info',
  LOGIN_FAILED:          'danger',
  BOOKING_CREATED:       'success',
  BOOKING_UPDATED:       'primary',
  BOOKING_CANCELLED:     'danger',
  BOOKING_CHECKED_IN:    'info',
  BOOKING_CHECKED_OUT:   'warning',
  ROOM_CREATED:          'success',
  ROOM_UPDATED:          'primary',
  ROOM_DELETED:          'danger',
  ROOM_STATUS_CHANGED:   'warning',
  PAYMENT_RECEIVED:      'success',
  HOUSEKEEPING_ASSIGNED: 'info',
  HOUSEKEEPING_COMPLETED:'success',
  MAINTENANCE_CREATED:   'warning',
  MAINTENANCE_RESOLVED:  'success',
  USER_UPDATED:          'primary',
  USER_DELETED:          'danger',
  USER_SUSPENDED:        'danger',
  PASSWORD_CHANGED:      'warning',
  SETTINGS_UPDATED:      'info',
};

const SEVERITY_COLORS = {
  info:     'bg-info-subtle text-info',
  warning:  'bg-warning-subtle text-warning',
  critical: 'bg-danger-subtle text-danger',
};

const AuditLogs = () => {
  const [logs, setLogs]         = useState([]);
  const [summary, setSummary]   = useState({ todayCount: 0, criticalCount: 0, recentLogs: [] });
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const limit = 20;

  // Filters
  const [filterAction,   setFilterAction]   = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [startDate,      setStartDate]      = useState('');
  const [endDate,        setEndDate]        = useState('');
  const [activeTab,      setActiveTab]      = useState('all');

  useEffect(() => { loadSummary(); }, []);
  useEffect(() => {
    if (activeTab === 'security') loadSecurityLogs();
    else loadLogs();
  }, [page, filterAction, filterSeverity, startDate, endDate, activeTab]);

  const loadSummary = async () => {
    try {
      const res = await api.get(`${API_URL}/audit-logs/summary`, { headers: headers() });
      setSummary(res.data.summary || {});
    } catch (err) { console.error(err); }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (filterAction)   params.append('action', filterAction);
      if (filterSeverity) params.append('severity', filterSeverity);
      if (startDate)      params.append('startDate', startDate);
      if (endDate)        params.append('endDate', endDate);

      const res = await api.get(`${API_URL}/audit-logs?${params}`, { headers: headers() });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadSecurityLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}/audit-logs/security`, { headers: headers() });
      setLogs(res.data.logs || []);
      setTotal(res.data.logs?.length || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setFilterAction('');
    setFilterSeverity('');
    if (tab === 'security') loadSecurityLogs();
    else loadLogs();
  };

  const clearFilters = () => {
    setFilterAction('');
    setFilterSeverity('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString('en-PK');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="page-title-box d-sm-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Audit Logs</h4>
          <p className="text-muted mb-0">Full activity trail — who did what, and when</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Today\'s Actions', value: summary.todayCount || 0,    icon: 'ri-calendar-check-line', color: 'primary' },
          { label: 'Critical Events',  value: summary.criticalCount || 0, icon: 'ri-alert-line',          color: 'danger'  },
          { label: 'Total Logs',       value: total,                       icon: 'ri-file-list-line',      color: 'info'    },
          { label: 'Tracked Actions',  value: Object.keys(ACTION_COLORS).length, icon: 'ri-shield-check-line', color: 'success' },
        ].map((s, i) => (
          <div className="col-md-3 col-6" key={i}>
            <div className="card">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`avatar-sm bg-${s.color}-subtle rounded d-flex align-items-center justify-content-center`}
                  style={{ width: 48, height: 48, flexShrink: 0 }}>
                  <i className={`${s.icon} text-${s.color} fs-22`}></i>
                </div>
                <div>
                  <div className="fw-bold fs-20">{s.value}</div>
                  <div className="text-muted fs-12">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs-custom rounded card-header-tabs border-bottom-0">
            {[
              { key: 'all',      label: 'All Logs'    },
              { key: 'security', label: '🔒 Security' },
            ].map(tab => (
              <li className="nav-item" key={tab.key}>
                <button
                  className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Filters */}
        {activeTab === 'all' && (
          <div className="card-header border-top py-2">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <select className="form-select form-select-sm w-auto" value={filterAction}
                onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
                <option value="">All Actions</option>
                {Object.keys(ACTION_COLORS).map(a => (
                  <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                ))}
              </select>

              <select className="form-select form-select-sm w-auto" value={filterSeverity}
                onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}>
                <option value="">All Severity</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>

              <input type="date" className="form-control form-control-sm w-auto"
                value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
              <input type="date" className="form-control form-control-sm w-auto"
                value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />

              {(filterAction || filterSeverity || startDate || endDate) && (
                <button className="btn btn-sm btn-light" onClick={clearFilters}>
                  <i className="ri-close-line me-1"></i>Clear
                </button>
              )}

              <span className="text-muted fs-12 ms-auto">{total} total logs</span>
            </div>
          </div>
        )}

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="ri-file-list-line fs-48 d-block mb-2 opacity-25"></i>
              No logs found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log._id || i}>
                      <td>
                        <div className="fw-medium fs-13">{timeAgo(log.createdAt)}</div>
                        <small className="text-muted">{new Date(log.createdAt).toLocaleString('en-PK')}</small>
                      </td>
                      <td>
                        <div className="fw-medium">{log.performedByName || 'System'}</div>
                        <small className="text-muted text-capitalize">{log.performedByRole || ''}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${ACTION_COLORS[log.action] || 'secondary'}-subtle text-${ACTION_COLORS[log.action] || 'secondary'} fs-11`}>
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted" style={{ maxWidth: 250, display: 'block' }}>
                          {log.description}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${SEVERITY_COLORS[log.severity] || 'bg-secondary'}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{log.ipAddress || '—'}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
              <small className="text-muted">Page {page} of {totalPages}</small>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}>
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
                <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}>
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;