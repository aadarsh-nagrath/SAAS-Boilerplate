import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "myapp";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    image: String,
    plan: { type: String, default: "free" },
    planStatus: { type: String, default: "inactive" },
  },
  { timestamps: true }
);

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

const SEED_USERS = [
  { name: "Free User", email: "free@example.com", plan: "free", planStatus: "inactive" },
  { name: "Pro User", email: "pro@example.com", plan: "monthly", planStatus: "active" },
  { name: "Yearly User", email: "yearly@example.com", plan: "yearly", planStatus: "active" },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!, { dbName: MONGODB_DB_NAME });
  console.log("Connected to MongoDB");

  for (const user of SEED_USERS) {
    await User.findOneAndUpdate({ email: user.email }, user, { upsert: true });
    console.log(`  ✓ ${user.email}`);
  }

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
