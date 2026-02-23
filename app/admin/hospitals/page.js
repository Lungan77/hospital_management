'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, Mail, Bed } from 'lucide-react';

export default function HospitalsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contact: {
      phone: '',
      email: '',
      fax: '',
    },
    capacity: {
      beds: '',
      icuBeds: '',
      emergencyBeds: '',
    },
    specialties: [],
    licenseNumber: '',
    accreditation: '',
    status: 'active',
    operatingHours: {
      weekdays: { open: '08:00', close: '18:00' },
      weekends: { open: '08:00', close: '18:00' },
      is24x7: false,
    },
    services: [],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchHospitals();
    }
  }, [session]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/hospitals');
      const data = await response.json();
      if (response.ok) {
        setHospitals(data.hospitals);
      }
    } catch (error) {
      toast.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      capacity: {
        beds: parseInt(formData.capacity.beds) || 0,
        icuBeds: parseInt(formData.capacity.icuBeds) || 0,
        emergencyBeds: parseInt(formData.capacity.emergencyBeds) || 0,
      },
    };

    try {
      const url = editingHospital
        ? `/api/hospitals/${editingHospital._id}`
        : '/api/hospitals';
      const method = editingHospital ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setShowModal(false);
        resetForm();
        fetchHospitals();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name,
      type: hospital.type,
      address: hospital.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      contact: hospital.contact || { phone: '', email: '', fax: '' },
      capacity: {
        beds: hospital.capacity?.beds || '',
        icuBeds: hospital.capacity?.icuBeds || '',
        emergencyBeds: hospital.capacity?.emergencyBeds || '',
      },
      specialties: hospital.specialties || [],
      licenseNumber: hospital.licenseNumber || '',
      accreditation: hospital.accreditation || '',
      status: hospital.status,
      operatingHours: hospital.operatingHours || {
        weekdays: { open: '08:00', close: '18:00' },
        weekends: { open: '08:00', close: '18:00' },
        is24x7: false,
      },
      services: hospital.services || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;

    try {
      const response = await fetch(`/api/hospitals/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchHospitals();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to delete hospital');
    }
  };

  const resetForm = () => {
    setEditingHospital(null);
    setFormData({
      name: '',
      type: 'hospital',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
      contact: { phone: '', email: '', fax: '' },
      capacity: { beds: '', icuBeds: '', emergencyBeds: '' },
      specialties: [],
      licenseNumber: '',
      accreditation: '',
      status: 'active',
      operatingHours: {
        weekdays: { open: '08:00', close: '18:00' },
        weekends: { open: '08:00', close: '18:00' },
        is24x7: false,
      },
      services: [],
    });
  };

  const filteredHospitals = hospitals.filter((h) => {
    if (filter === 'all') return true;
    return h.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospitals & Clinics</h1>
          <p className="text-gray-600 mt-1">Manage healthcare facilities</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Facility
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({hospitals.length})
        </button>
        <button
          onClick={() => setFilter('hospital')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'hospital'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Hospitals ({hospitals.filter((h) => h.type === 'hospital').length})
        </button>
        <button
          onClick={() => setFilter('clinic')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'clinic'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Clinics ({hospitals.filter((h) => h.type === 'clinic').length})
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredHospitals.map((hospital) => (
          <div
            key={hospital._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{hospital.name}</h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      hospital.type === 'hospital'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {hospital.type}
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  hospital.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {hospital.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              {hospital.address?.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {hospital.address.city}, {hospital.address.state}
                  </span>
                </div>
              )}
              {hospital.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{hospital.contact.phone}</span>
                </div>
              )}
              {hospital.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{hospital.contact.email}</span>
                </div>
              )}
              {hospital.capacity?.beds > 0 && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span>{hospital.capacity.beds} beds</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => handleEdit(hospital)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(hospital._id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No facilities found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingHospital ? 'Edit Facility' : 'Add New Facility'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name*</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Type*</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, phone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Beds</label>
                    <input
                      type="number"
                      value={formData.capacity.beds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: { ...formData.capacity, beds: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ICU Beds</label>
                    <input
                      type="number"
                      value={formData.capacity.icuBeds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: { ...formData.capacity, icuBeds: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ER Beds</label>
                    <input
                      type="number"
                      value={formData.capacity.emergencyBeds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: {
                            ...formData.capacity,
                            emergencyBeds: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">License Number</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status*</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is24x7"
                    checked={formData.operatingHours.is24x7}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatingHours: {
                          ...formData.operatingHours,
                          is24x7: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="is24x7" className="text-sm font-medium">
                    Open 24/7
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingHospital ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
