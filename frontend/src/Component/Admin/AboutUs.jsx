import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AboutUs = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [about, setAbout]     = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const [infoForm, setInfoForm] = useState({
    hotelName: '', tagline: '', story: '', mission: '', vision: '',
  });

  useEffect(() => { loadAbout(); }, []);

  const loadAbout = async () => {
    try {
      const res = await api.get(`${API_URL}/about`, { headers });
      setAbout(res.data);
      setInfoForm({
        hotelName: res.data.hotelName || '',
        tagline:   res.data.tagline   || '',
        story:     res.data.story     || '',
        mission:   res.data.mission   || '',
        vision:    res.data.vision    || '',
      });
    } catch (err) { console.error(err); }
  };

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleSaveInfo = async () => {
    setLoading(true);
    try {
      await api.put(`${API_URL}/about`, infoForm, {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      showMsg('About Us saved successfully!');
      loadAbout();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to save.', true); }
    setLoading(false);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">About Us</h4>
          </div>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="ri-hotel-line me-2 text-primary"></i>Hotel Information
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label fw-semibold">Hotel Name</label>
              <input className="form-control" value={infoForm.hotelName}
                onChange={e => setInfoForm({ ...infoForm, hotelName: e.target.value })}
                placeholder="Enter hotel name" />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Tagline</label>
              <input className="form-control" value={infoForm.tagline}
                onChange={e => setInfoForm({ ...infoForm, tagline: e.target.value })}
                placeholder="Enter tagline" />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Our Story</label>
              <textarea className="form-control" rows={4} value={infoForm.story}
                onChange={e => setInfoForm({ ...infoForm, story: e.target.value })}
                placeholder="Tell your hotel's story..." />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Mission</label>
              <textarea className="form-control" rows={3} value={infoForm.mission}
                onChange={e => setInfoForm({ ...infoForm, mission: e.target.value })}
                placeholder="Our mission..." />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Vision</label>
              <textarea className="form-control" rows={3} value={infoForm.vision}
                onChange={e => setInfoForm({ ...infoForm, vision: e.target.value })}
                placeholder="Our vision..." />
            </div>

            <div className="col-12 text-end">
              <button className="btn btn-primary px-4" onClick={handleSaveInfo} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                  : <><i className="ri-save-line me-2"></i>Save Changes</>}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;