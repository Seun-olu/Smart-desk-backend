const mongoose = require('mongoose');
const User = require('./models/User');
const Office = require('./models/Office');
const Booking = require('./models/Booking');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartdesk';

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    await Office.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data...');

    // Create 10 offices with varied availability
    const offices = Array.from({ length: 10 }).map((_, i) => ({
      officeId: `office_${i + 1}`,
      officeName: `Office ${String.fromCharCode(65 + i)}`,
      availability: [
        { start: new Date('2025-07-01T08:00:00'), end: new Date('2025-07-01T18:00:00') },
        { start: new Date('2025-07-02T08:00:00'), end: new Date('2025-07-02T18:00:00') },
        { start: new Date('2025-07-03T08:00:00'), end: new Date('2025-07-03T18:00:00') },
      ],
    }));
    const createdOffices = await Office.insertMany(offices);
    console.log('Created offices:', createdOffices.length);

    // Create 20 users
    const users = Array.from({ length: 20 }).map((_, i) => ({
      userId: `user${i + 1}`,
      bookingHistory: [],
      cancellations: Math.floor(Math.random() * 5),
    }));
    const createdUsers = await User.insertMany(users);
    console.log('Created users:', createdUsers.length);

    // Create 50 bookings
    const bookings = [];
    for (let i = 0; i < 50; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const office = createdOffices[Math.floor(Math.random() * createdOffices.length)];
      const startTime = randomDate(new Date('2025-07-01T08:00:00'), new Date('2025-07-03T16:00:00'));
      const durationHours = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
      bookings.push({
        userId: user.userId,
        officeId: office.officeId,
        startTime,
        durationHours,
      });
    }
    const createdBookings = await Booking.insertMany(bookings);
    console.log('Created bookings:', createdBookings.length);

    // Link bookings to users
    for (const booking of createdBookings) {
      const user = createdUsers.find(u => u.userId === booking.userId);
      if (user) {
        user.bookingHistory.push(booking._id);
      }
    }
    for (const user of createdUsers) {
      await User.updateOne({ _id: user._id }, { bookingHistory: user.bookingHistory });
    }
    console.log('Linked bookings to users.');

    console.log('✅ Database seeded successfully!');
    console.log('Sample user IDs:', createdUsers.slice(0, 5).map(u => u.userId).join(', '));
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

if (require.main === module) {
  seedDatabase();
}
