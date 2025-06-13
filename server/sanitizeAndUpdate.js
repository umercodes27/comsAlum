import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from './models/User.js'; // Make sure this is the correct path

// Setup __dirname (ESM doesn't support __dirname natively)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGO_URI = "mongodb+srv://uaziz7560:umeraziz63@cluster-umer.shwm2.mongodb.net/socio-pedia"; // Update if needed
const directoryPath = path.join(__dirname, 'public', 'assets');

const sanitizeFilename = (filename) =>
  filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/gi, '-')
    .replace(/-+/g, '-');

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const files = fs.readdirSync(directoryPath);
    const updates = [];

    for (const file of files) {
      const sanitized = sanitizeFilename(file);

      if (file !== sanitized) {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, sanitized);

        // Rename the file
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${file} → ${sanitized}`);

        // Update DB
        const result = await User.updateMany(
          { picturePath: file },
          { $set: { picturePath: sanitized } }
        );

        if (result.modifiedCount > 0) {
          console.log(`🔄 Updated ${result.modifiedCount} user(s) in DB for: ${sanitized}`);
        }

        updates.push({ old: file, new: sanitized });
      }
    }

    console.log('\n🎉 Done! Here\'s a summary of changes:');
    console.table(updates);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
};

run();
