import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { getSiteSettings, updateSiteSettings } from '../../services/api';

const initialSettings = {
  churchName: '',
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
  website: '',
  facebook: '',
  instagram: '',
  youtube: '',
  vision: '',
  mission: '',
  serviceTimes: '',
  mapsLink: '',
  welcomeMessage: '',
  logo: null,
};

function validate(settings) {
  if (!settings.churchName.trim()) return 'Church name is required.';
  if (!settings.email.trim()) return 'Email is required.';
  if (!/^\S+@\S+\.\S+$/.test(settings.email)) return 'Email is invalid.';
  if (!settings.phone.trim()) return 'Phone is required.';
  if (!settings.address.trim()) return 'Address is required.';
  // Add more validation as needed
  return null;
}

const SiteSettings = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    setLoading(true);
    getSiteSettings()
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        showNotification('Failed to load site settings', 'error');
      })
      .finally(() => setLoading(false));
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setSettings({ ...settings, logo: files[0] });
    } else {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate(settings);
    if (error) {
      showNotification(error, 'error');
      return;
    }
    setLoading(true);
    try {
      await updateSiteSettings(settings);
      showNotification('Settings saved successfully!', 'success');
    } catch (err) {
      showNotification('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Site Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Church Name</label>
          <input type="text" name="churchName" value={settings.churchName} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input type="email" name="email" value={settings.email} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Phone</label>
          <input type="text" name="phone" value={settings.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">WhatsApp</label>
          <input type="text" name="whatsapp" value={settings.whatsapp} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Address</label>
          <input type="text" name="address" value={settings.address} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Website</label>
          <input type="text" name="website" value={settings.website} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Facebook</label>
          <input type="text" name="facebook" value={settings.facebook} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Instagram</label>
          <input type="text" name="instagram" value={settings.instagram} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">YouTube</label>
          <input type="text" name="youtube" value={settings.youtube} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Vision Statement</label>
          <textarea name="vision" value={settings.vision} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Mission Statement</label>
          <textarea name="mission" value={settings.mission} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Service Times</label>
          <input type="text" name="serviceTimes" value={settings.serviceTimes} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Sundays 9am, Wednesdays 6pm" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Google Maps Link</label>
          <input type="text" name="mapsLink" value={settings.mapsLink} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Welcome Message</label>
          <textarea name="welcomeMessage" value={settings.welcomeMessage} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
        </div>
        <div>
          <label className="block font-medium">Church Logo</label>
          <input type="file" name="logo" accept="image/*" onChange={handleChange} className="w-full" disabled={loading} />
          {settings.logo && <div className="mt-2 text-sm">Selected: {settings.logo.name}</div>}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SiteSettings;
