const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pill_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Error al conectar con MongoDB', err);
    process.exit(1); 
  }
};

module.exports = connectDB;
