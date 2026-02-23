import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['hospital', 'clinic'],
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contact: {
    phone: String,
    email: String,
    fax: String,
  },
  capacity: {
    beds: Number,
    icuBeds: Number,
    emergencyBeds: Number,
  },
  specialties: [String],
  licenseNumber: String,
  accreditation: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  operatingHours: {
    weekdays: {
      open: String,
      close: String,
    },
    weekends: {
      open: String,
      close: String,
    },
    is24x7: {
      type: Boolean,
      default: false,
    },
  },
  services: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

hospitalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
