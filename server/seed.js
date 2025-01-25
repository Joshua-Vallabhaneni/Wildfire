const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path to your User model

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
      serverSelectionTimeoutMS: 30000, // Increase timeout to avoid errors
    });

    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Seed data
    const users = [
      // Requestors
      {
        name: "Maria Rodriguez",
        isVolunteer: false,
        tasksRequested: [
          { title: "Plant Trees in Community Parks", urgency: 8, specialtyRequired: false },
          { title: "Organize Neighborhood Cleanup", urgency: 7, specialtyRequired: false },
        ],
        availability: {
          Monday: ["9am-12pm", "3pm-6pm"],
          Wednesday: ["12pm-3pm"],
          Friday: ["6am-9am"],
        },
      },
      {
        name: "James Wilson",
        isVolunteer: false,
        tasksRequested: [
          { title: "Deliver Emergency Supplies to Families in Need", urgency: 9, specialtyRequired: false },
          { title: "Provide Assistance at Temporary Shelters", urgency: 7, specialtyRequired: false },
        ],
        availability: {
          Tuesday: ["12pm-3pm"],
          Thursday: ["6am-9am"],
          Sunday: ["9am-12pm"],
        },
      },
      {
        name: "Sophia Martinez",
        isVolunteer: false,
        tasksRequested: [
          { title: "Help Restore Local Forest Areas", urgency: 8, specialtyRequired: true },
          { title: "Teach Water Conservation Practices to Residents", urgency: 6, specialtyRequired: false },
        ],
        availability: {
          Monday: ["9am-12pm"],
          Thursday: ["3pm-6pm"],
          Saturday: ["6pm-9pm"],
        },
      },
      {
        name: "Emily Davis",
        isVolunteer: false,
        tasksRequested: [
          { title: "Create Social Media Campaigns for Environmental Awareness", urgency: 7, specialtyRequired: false },
          { title: "Coordinate Volunteer Teams for Local Projects", urgency: 9, specialtyRequired: true },
        ],
        availability: {
          Wednesday: ["3pm-6pm"],
          Thursday: ["9am-12pm"],
          Saturday: ["12pm-3pm"],
        },
      },
      {
        name: "Robert Johnson",
        isVolunteer: false,
        tasksRequested: [
          { title: "Distribute Educational Materials on Fire Safety", urgency: 6, specialtyRequired: false },
          { title: "Install Smoke Alarms in High-Risk Neighborhoods", urgency: 8, specialtyRequired: false },
        ],
        availability: {
          Tuesday: ["6am-9am"],
          Friday: ["12pm-3pm"],
          Sunday: ["9am-12pm"],
        },
      },

      // Volunteers
      {
        name: "Anna Smith",
        isVolunteer: true,
        tasksWilling: [
          { title: "Plant Trees and Help Restore Nature" },
          { title: "Organize and Lead Cleanup Events" },
        ],
        availability: {
          Monday: ["9am-12pm"],
          Wednesday: ["12pm-3pm"],
          Friday: ["6am-9am"],
        },
      },
      {
        name: "Michael Lee",
        isVolunteer: true,
        tasksWilling: [
          { title: "Deliver Emergency Supplies to Those in Need" },
          { title: "Help at Emergency Shelters" },
        ],
        availability: {
          Tuesday: ["12pm-3pm"],
          Thursday: ["6am-9am"],
          Sunday: ["9am-12pm"],
        },
      },
      {
        name: "Sophia Chen",
        isVolunteer: true,
        tasksWilling: [
          { title: "Restore Forests and Plant Trees" },
          { title: "Teach Water Conservation Practices" },
        ],
        availability: {
          Monday: ["9am-12pm"],
          Thursday: ["3pm-6pm"],
          Saturday: ["6pm-9pm"],
        },
      },
      {
        name: "Emma Brown",
        isVolunteer: true,
        tasksWilling: [
          { title: "Coordinate Volunteer Groups" },
          { title: "Run Social Media Campaigns for Environmental Awareness" },
        ],
        availability: {
          Wednesday: ["3pm-6pm"],
          Thursday: ["9am-12pm"],
          Saturday: ["12pm-3pm"],
        },
      },
      {
        name: "Liam Garcia",
        isVolunteer: true,
        tasksWilling: [
          { title: "Distribute Fire Safety Materials" },
          { title: "Install Smoke Alarms in Vulnerable Communities" },
        ],
        availability: {
          Tuesday: ["6am-9am"],
          Friday: ["12pm-3pm"],
          Sunday: ["9am-12pm"],
        },
      },
    ];

    // Insert users into the database
    await User.insertMany(users);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
