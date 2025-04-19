import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Space from './models/Space.js';
import User from './models/User.js';

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Sample data
const spaces = [
  {
    title: 'Bibliothèque Moderne',
    description: 'Un espace calme et inspirant pour la lecture et l\'étude, équipé de ressources multimédias modernes.',
    capacity: 50,
    image: '/images/espace1.png',
    status: 'active'
  },
  {
    title: 'Salle de Conférence',
    description: 'Salle polyvalente équipée de matériel audiovisuel pour vos présentations et événements.',
    capacity: 100,
    image: '/images/espace2.png',
    status: 'active'
  },
  {
    title: 'Espace Créatif',
    description: 'Un environnement stimulant pour les activités créatives et collaboratives.',
    capacity: 30,
    image: '/images/espace3.png',
    status: 'active'
  },
  {
    title: 'Laboratoire Informatique',
    description: 'Espace équipé d\'ordinateurs et de logiciels spécialisés pour la formation et la recherche.',
    capacity: 25,
    image: '/images/espace4.png',
    status: 'active'
  },
  {
    title: 'Salle de Réunion',
    description: 'Espace professionnel pour les réunions d\'équipe et les entretiens.',
    capacity: 15,
    image: '/images/espace5.png',
    status: 'active'
  }
];

const users = [
  {
    name: 'Admin CMC',
    email: 'admin@cmc.ma',
    password: 'admin123',
    role: 'admin'
  }
];

// Import data into DB
const importData = async () => {
  try {
    await Space.deleteMany();
    await User.deleteMany();

    await Space.insertMany(spaces);
    await User.create(users);

    console.log('Données importées avec succès');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await Space.deleteMany();
    await User.deleteMany();

    console.log('Données supprimées avec succès');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Check command line args
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Veuillez spécifier une option: -i (import) ou -d (delete)');
  process.exit();
}