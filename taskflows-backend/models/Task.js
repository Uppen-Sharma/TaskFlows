const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // task name required
      trim: true, // remove extra spaces
      minlength: 3, // minimum name length
    },

    description: {
      type: String,
      required: true, // description required
      trim: true, // remove extra spaces
    },

    status: {
      type: String,
      enum: [
        "proposed",
        "pending",
        "inprocess",
        "onhold",
        "completed",
        "closed",
      ], // allowed task statuses
      default: "pending", // default status
    },

    initialEstimatedTime: {
      type: Number,
      required: true, // baseline time required
      default: 0, // default time
      min: 0, // cannot be negative
    },

    currentEstimatedTime: {
      type: Number,
      required: true, // current time required
      default: 0, // default current time
    },

    timeTrackingStartedAt: {
      type: Date,
      default: null, // timer not started
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // assigner required
    },

    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // at least one assignee
      },
    ],

    userSuggestedBaseline: {
      type: Number,
      default: null, // no suggestion by default
      min: 0, // cannot be negative
    },
  },
  {
    timestamps: true, // add createdAt updatedAt
    toJSON: { virtuals: true, versionKey: false }, // include virtuals
    toObject: { virtuals: true }, // include virtuals
  }
);

taskSchema.virtual("id").get(function () {
  return this._id.toHexString(); // expose id field
});

taskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id; // hide internal id
  },
});

taskSchema.index({ status: 1 }); // index status
taskSchema.index({ assignedTo: 1 }); // index assignees
taskSchema.index({ assignedBy: 1 }); // index assigner

module.exports = mongoose.model("Task", taskSchema);
