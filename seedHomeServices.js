const mongoose = require("mongoose");
const dotenv = require("dotenv");
const HomeData = require("./src/models/Home");

dotenv.config();

const connectDB = async () => {
  const mongoURI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/manudevi-db";
  await mongoose.connect(mongoURI);
  console.log("✅ MongoDB Connected");
};

const seedHomeServices = async () => {
  try {
    await connectDB();

    // Clear existing data
    await HomeData.deleteMany({});
    console.log("🗑️ Cleared old home data");

    const homeData = await HomeData.create({
      temple: {
        name: "Shree Manudevi",
        location: "Yaval, Jalgaon",
        location_url: "https://maps.app.goo.gl/pJs1YWi28u8XVURZ9",
        banner_images: [
          "https://example.com/banner1.jpg",
          "https://example.com/banner2.jpg",
          "https://example.com/banner3.jpg",
        ],
        title_text:
          "सर्व मंगल मांगल्ये शिवे सर्वार्थ साधिके। शरन्ये त्रयम्बिके गौरी नारायणी नमोस्तुते",
        notification_count: 3,
      },
      features: [
        {
          id: 1,
          title: "Aartis",
          subtitle: "Daily Prayers",
          icon: "aarti_icon",
          type: "aartis",
          isActive: true,
        },
        {
          id: 2,
          title: "Bhakti Geete",
          subtitle: "Devotional Songs",
          icon: "music_icon",
          type: "songs",
          isActive: true,
        },
        {
          id: 3,
          title: "History",
          subtitle: "Divine Stories",
          icon: "history_icon",
          type: "history",
          isActive: true,
        },
        {
          id: 4,
          title: "Stotras",
          subtitle: "Sacred Hymns",
          icon: "stotra_icon",
          type: "stotras",
          isActive: true,
        },
      ],

      services: [
        {
          category_id: 1,
          category_name: "Puja & Rituals",
          services: [
            {
              id: 101,
              title: "Pooja Booking",
              type: "pooja_booking",
              description: "Pre-book your sacred rituals online",
              icon: "pooja_icon",
              route: "/pooja-booking",
            },
            {
              id: 102,
              title: "Abhishek Seva",
              type: "abhishek",
              description: "Special water and milk offerings",
              icon: "abhishek_icon",
            },
            {
              id: 103,
              title: "Satyanarayan Katha",
              type: "katha",
              description: "Group or private katha sessions",
            },
            {
              id: 104,
              title: "Morning Aarti",
              type: "morning_aarti",
              description: "Early morning prayer participation",
            },
          ],
        },
        {
          category_id: 2,
          category_name: "Administrative",
          services: [
            {
              id: 201,
              title: "E-Pass Generation",
              type: "epass",
              description: "Avoid queues with digital darshan passes",
            },
            {
              id: 202,
              title: "Donations",
              type: "donation",
              description: "Digital receipts for your contributions",
            },
            {
              id: 203,
              title: "Bhakta Niwas",
              type: "accommodation",
              description: "Accommodation booking for pilgrims",
            },
            {
              id: 204,
              title: "Prasad Seva",
              type: "prasad",
              description: "Meal coupons and prasad home delivery",
            },
          ],
        },
        {
          category_id: 3,
          category_name: "Live Media",
          services: [
            {
              id: 301,
              title: "Live Darshan",
              type: "live_stream",
              description: "24/7 direct feed from the sanctum",
            },
            {
              id: 302,
              title: "Aarti Archives",
              type: "archives",
              description: "Watch recordings of previous rituals",
            },
            {
              id: 303,
              title: "Bhakti Radio",
              type: "radio",
              description: "Continuous stream of divine hymns",
            },
          ],
        },
      ],
    });

    console.log("✅ Home services seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding home services:", error);
    process.exit(1);
  }
};

seedHomeServices();
