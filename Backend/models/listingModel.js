import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "ETB",
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      required: true,
    },

    condition: {
      type: String,
      enum: ["new", "used", "old"],
      default: "used",
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to users collection
      required: true,
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
      },
    },

    status: {
      type: String,
      enum: ["active", "sold", "pending", "rejected"],
      default: "pending",
    },

    isBoosted: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);
// Update `updatedAt` automatically before saving.
listingSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

listingSchema.index({ sellerId: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ "location.latitude": 1, "location.longitude": 1 });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
