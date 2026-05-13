require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Company  = require('./models/Company');
const Quote    = require('./models/Quote');
const Review   = require('./models/Review');
const Thread   = require('./models/Thread');

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/craftbase';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Clearing existing data...');
    await Promise.all([User, Company, Quote, Review, Thread].map(M => M.deleteMany({})));

    // Users - use create() to trigger bcrypt hashing via pre-save hook
    console.log('Creating users...');
    const ahmed = await User.create({ name: 'Ahmed Khan', email: 'ahmed@example.com', password: 'password123', role: 'USER' });
    const sara = await User.create({ name: 'Sara Malik', email: 'sara@example.com', password: 'password123', role: 'USER' });
    const bilal = await User.create({ name: 'Bilal Raza', email: 'bilal@example.com', password: 'password123', role: 'USER' });
    const apex = await User.create({ name: 'Apex Construction', email: 'apex@example.com', password: 'password123', role: 'COMPANY' });

    // Company
    console.log('Creating company...');
    const company = await Company.create({
      user: apex._id,
      name: 'Apex Construction Group',
      area: 'Rawalpindi',
      specialization: ['full_construction', 'renovation'],
      description: 'Premier construction firm serving Rawalpindi and Islamabad since 2005.',
      phone: '0300-1234567',
      verified: true,
      badges: ['top_rated', 'most_hired', 'verified'],
      avgRating: 4.8,
      totalReviews: 3,
    });

    // Quotes
    console.log('Creating quotes...');
    const q1 = await Quote.create({ 
      user: ahmed._id, 
      title: 'Residential 3-Bedroom House Build', 
      description: 'Looking for a contractor to build a 3-bed, 2-bath home. Architect drawings available.', 
      projectType: 'residential', 
      budgetMin: 5000000, 
      budgetMax: 8000000, 
      location: 'Rawalpindi', 
      timeline: '6 months', 
      status: 'OPEN' 
    });
    
    const q2 = await Quote.create({ 
      user: sara._id,  
      title: 'Office Renovation – 2nd Floor', 
      description: 'Complete renovation of a 3000 sqft office space.', 
      projectType: 'commercial', 
      budgetMin: 1500000, 
      budgetMax: 2500000, 
      location: 'Islamabad', 
      timeline: '3 months', 
      status: 'OPEN' 
    });

    // Reviews
    console.log('Creating reviews...');
    await Review.create([
      { company: company._id, user: ahmed._id, ratingQuality: 5, ratingTimeliness: 4, ratingComm: 5, ratingValue: 5, comment: 'Excellent work. Professional and on schedule.', verifiedHire: true },
      { company: company._id, user: sara._id,  ratingQuality: 4, ratingTimeliness: 5, ratingComm: 4, ratingValue: 4, comment: 'Very responsive and punctual.', verifiedHire: true },
      { company: company._id, user: bilal._id, ratingQuality: 5, ratingTimeliness: 5, ratingComm: 5, ratingValue: 4, comment: 'Best construction company in Rawalpindi.', verifiedHire: true },
    ]);

    // Threads
    console.log('Creating threads...');
    await Thread.create([
      { user: ahmed._id, title: 'Best materials for earthquake-resistant homes in Pakistan?', body: 'Planning to build in zone 3. What materials should we insist the contractor uses?', category: 'general', upvotes: 28 },
      { user: sara._id,  title: 'How to avoid contractor scams — my experience', body: 'After getting burned twice, here is what I now ask every company before signing anything.', category: 'legal', upvotes: 54 },
      { user: bilal._id, title: 'Average cost per sqft for full construction in Islamabad 2026?', body: 'Looking to get realistic numbers before requesting quotes.', category: 'budget', upvotes: 41 },
    ]);

    console.log('✅ Seed complete successfully!');
    await mongoose.disconnect();
  } catch (err) { 
    console.error('❌ Seed error:', err.message); 
    process.exit(1); 
  }
}

seed();
