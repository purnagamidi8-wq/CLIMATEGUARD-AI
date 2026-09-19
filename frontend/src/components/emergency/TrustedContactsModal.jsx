import { useState, useEffect } from 'react';
import { contactsAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function TrustedContactsModal({ isOpen, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    relationship: 'Parent',
    phone: '',
    email: '',
    priority: 1,
    notify_on_alert: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedNotification, setSavedNotification] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsAPI.getAll();
      setContacts(res.data || []);
    } catch {
      setContacts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (savedNotification) {
      const timer = setTimeout(() => {
        setSavedNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [savedNotification]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.name.trim()) {
      setError('Please enter a full name.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Please enter a phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        relationship: form.relationship,
        phone: form.phone.trim(),
        email: form.email.trim() ? form.email.trim() : null,
        priority: Number(form.priority) || 1,
        notify_on_alert: form.notify_on_alert,
      };

      const res = await contactsAPI.add(payload);
      const savedContact = res.data || { ...payload, id: Date.now() };

      // Reset form
      setForm({
        name: '',
        relationship: 'Parent',
        phone: '',
        email: '',
        priority: 1,
        notify_on_alert: true,
      });
      setShowAddForm(false);

      // Trigger the saved popup notification
      setSavedNotification(savedContact);

      // Refresh list
      await fetchContacts();
    } catch (err) {
      console.error('Failed to save contact:', err);
      let message = 'Failed to add contact. Please check details and try again.';
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        message = detail.map((d) => d.msg || d).join(', ');
      } else if (typeof detail === 'string') {
        message = detail;
      }
      setError(message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Remove "${name}" from your trusted contacts?`)) {
      try {
        await contactsAPI.delete(id);
        setStatusMessage(`"${name}" was removed from your emergency contacts.`);
        await fetchContacts();
      } catch (err) {
        console.error('Failed to delete contact:', err);
        setError('Failed to remove contact.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden border border-teal-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">👥</span> {t('contacts')}
            </h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Enrolled contacts receive one-tap SOS alerts & live GPS coordinates
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white text-lg font-bold transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* 1. SAVED POP-UP NOTIFICATION (When contact is saved successfully) */}
          {savedNotification && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600" />
              <button
                onClick={() => setSavedNotification(null)}
                className="absolute top-2.5 right-2.5 text-emerald-700 hover:text-emerald-950 font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full hover:bg-emerald-100"
              >
                ✕
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                  ✓
                </div>
                <div className="space-y-1.5 flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-emerald-950 text-sm">
                      Contact Saved Successfully!
                    </h4>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900">
                    <strong className="text-emerald-950">{savedNotification.name}</strong> ({savedNotification.relationship}) is now stored and enrolled in your emergency dispatch network.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-800">
                    <span className="bg-white px-2.5 py-0.5 rounded-md border border-emerald-300 font-semibold shadow-2xs">
                      📞 {savedNotification.phone}
                    </span>
                    {savedNotification.email && (
                      <span className="bg-white px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                        ✉️ {savedNotification.email}
                      </span>
                    )}
                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                      Priority: {savedNotification.priority === 1 ? 'High (Primary)' : savedNotification.priority === 2 ? 'Medium' : 'Standard'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium pt-0.5">
                    <span>⚡</span> Instant 1-tap SOS alerts and live GPS link enabled
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. General Status Message */}
          {statusMessage && (
            <div className="bg-teal-50 border border-teal-300 text-teal-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <span>ℹ️ {statusMessage}</span>
              <button onClick={() => setStatusMessage(null)} className="text-teal-700 font-bold ml-2">✕</button>
            </div>
          )}

          {/* 3. Error Alert Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-700 font-bold ml-2">✕</button>
            </div>
          )}

          {!showAddForm ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Enrolled Contacts ({contacts.length}/10)
                </span>
                <button
                  onClick={() => {
                    setError(null);
                    setShowAddForm(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-sm font-bold">+</span> {t('add_contact')}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-sm text-gray-500 space-y-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
                  <p>Loading trusted contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="bg-gradient-to-b from-teal-50/70 to-emerald-50/40 border border-teal-200 rounded-2xl p-7 text-center space-y-3">
                  <span className="text-4xl block">🛡️</span>
                  <p className="font-bold text-teal-950 text-base">No trusted contacts added yet</p>
                  <p className="text-xs text-teal-800 max-w-sm mx-auto leading-relaxed">
                    Add family members, close friends, or neighbors so they can receive instant SOS alerts, your live location map, and automated safety warnings.
                  </p>
                  <button
                    onClick={() => {
                      setError(null);
                      setShowAddForm(true);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
                  >
                    <span>+</span> Add Your First Contact
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{c.name}</span>
                          <span className="text-[10px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                            {c.relationship}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            c.priority === 1
                              ? 'bg-red-100 text-red-800'
                              : c.priority === 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {c.priority === 1 ? 'Primary' : c.priority === 2 ? 'Medium' : 'Standard'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 font-mono">
                          <span>📞 {c.phone}</span>
                          {c.email && <span className="font-sans text-gray-500">✉️ {c.email}</span>}
                        </div>
                        <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium pt-0.5">
                          <span>🟢</span> SOS Notification Active
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                        <a
                          href={`tel:${c.phone}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition"
                        >
                          <span>📞</span> {t('call')}
                        </a>
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Message on WhatsApp"
                          className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                        >
                          💬 Chat
                        </a>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-sm transition"
                          title="Remove contact"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Contact Enrollment Form */
            <form onSubmit={handleAdd} className="space-y-4 bg-gray-50/60 border border-teal-100 rounded-2xl p-4 sm:p-5">
              <div className="border-b pb-2">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <span>➕</span> Enroll New Trusted Contact
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Stored securely to receive automated SOS dispatches and safety alerts.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              {/* Relationship and Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('relationship')}</label>
                  <select
                    value={form.relationship}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('priority')}</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value={1}>High (Primary Alert)</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Standard</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Optional Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. contact@example.com"
                />
              </div>

              {/* Notification Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notify_on_alert"
                  checked={form.notify_on_alert}
                  onChange={(e) => setForm({ ...form, notify_on_alert: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="notify_on_alert" className="text-xs text-gray-700 font-medium">
                  Dispatch automatic alerts & live map coordinates on SOS trigger
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setError(null);
                    setShowAddForm(false);
                  }}
                  className="flex-1 border border-gray-300 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                      <span>Saving Contact...</span>
                    </>
                  ) : (
                    <span>💾 {t('save')} Contact</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
