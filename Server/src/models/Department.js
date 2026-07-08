const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a department name'],
      trim: true,
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: [true, 'A department must belong to an organisation'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query patterns seeking departments by organisation
DepartmentSchema.index({ organisation: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', DepartmentSchema);
