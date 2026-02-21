const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HomeData = require('./src/models/Home');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/manudevi-db';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedHomeData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await HomeData.deleteMany({});
    console.log('🗑️  Cleared existing home data');

    // Create initial home data
    const homeData = await HomeData.create({
      temple: {
        name: "Shree Manudevi",
        location: "Yaval, Jalgaon",
        location_url: "https://maps.app.goo.gl/pJs1YWi28u8XVURZ9",
        banner_images: [
          "https://example.com/banner1.jpg",
          "https://example.com/banner2.jpg",
          "https://example.com/banner3.jpg"
        ],
        title_text: "सर्व मंगल मांगल्ये शिवे सर्वार्थ साधिके। शरन्ये त्रयम्बिके गौरी नारायणी नमोस्तुते",
        notification_count: 3
      },
      features: [
        {
          id: 1,
          title: "Aartis",
          subtitle: "Daily Prayers",
          icon: "aarti_icon",
          type: "aartis"
        },
        {
          id: 2,
          title: "Bhakti Geete",
          subtitle: "Devotional Song",
          icon: "music_icon",
          type: "songs"
        },
        {
          id: 3,
          title: "History",
          subtitle: "Divine Stories",
          icon: "history_icon",
          type: "history"
        },
        {
          id: 4,
          title: "Stotras",
          subtitle: "Sacred Hymns",
          icon: "stotra_icon",
          type: "stotras"
        }
      ],
      services: [
        {
          id: 1,
          title: "Pooja Booking",
          type: "pooja"
        },
        {
          id: 2,
          title: "E-Pass Entry",
          type: "epass"
        },
        {
          id: 3,
          title: "Seva Booking",
          type: "seva"
        },
        {
          id: 4,
          title: "Kalyana Mandap",
          type: "mandap"
        }
      ],
      live_darshan: {
        id: 1,
        title: "Morning Aarti",
        thumbnail: "https://example.com/live.jpg",
        start_time: "06:00 AM",
        watching_count: 245,
        stream_url: "https://example.com/stream.m3u8",
        isLive: true
      },
      daily_panchang: {
        date: "2023-10-12",
        tithi: "Dashami",
        nakshatra: "Ashwini",
        yoga: "Shubha"
      },
      events: [
        {
          id: 101,
          title: "Navratri Utsav",
          description: "Special Pooja and celebrations",
          date: "2023-10-15",
          isActive: true
        }
      ]
    });

    console.log('✅ Home data seeded successfully!');
    console.log('📊 Data:', JSON.stringify(homeData, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedHomeData();