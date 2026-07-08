const mongoose = require('mongoose');

const OrganisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an organisation name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    githubOrgName: {
      type: String,
      trim: true,
      helpText: 'The mapped GitHub organization name for integration',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Organisation', OrganisationSchema);
