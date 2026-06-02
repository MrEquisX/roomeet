import mongoose from 'mongoose';
import { faker } from '@faker-js/faker/locale/es';
import dotenv from 'dotenv';

// Como ejecutaremos el script desde la raíz de 'backend', leerá el .env automáticamente
dotenv.config(); 

// Importar tu modelo de Mongoose (Verifica que el nombre del archivo sea correcto)
import Usuario from '../src/models/Usuario.js';

const carrerasPUCV = [
  'Ingeniería en Informática', 'Ingeniería Civil Industrial', 
  'Arquitectura', 'Derecho', 'Ingeniería Comercial', 
  'Psicología', 'Periodismo', 'Ingeniería Mecánica'
];

const campusPUCV = ['Valparaíso', 'Viña del Mar', 'Curauma', 'Quilpué'];

const generarPerfiles = async (cantidad = 20) => {
  console.log('Conectando a MongoDB...');
  
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa. Iniciando la siembra...');

    const perfilesFalsos = [];

    for (let i = 0; i < cantidad; i++) {
      const nuevoUsuario = {
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        email: faker.internet.email(),
        password: 'Password123!', 
        edad: faker.number.int({ min: 18, max: 28 }),
        carrera: faker.helpers.arrayElement(carrerasPUCV),
        campus: faker.helpers.arrayElement(campusPUCV),
        presupuesto: faker.number.int({ min: 150000, max: 350000 }),
        tiene_hogar: faker.datatype.boolean(),
        foto_url: faker.image.avatar(),
        biografia: faker.lorem.sentences(2)
      };
      
      perfilesFalsos.push(nuevoUsuario);
    }

    // Insertar todos a la vez
    await Usuario.insertMany(perfilesFalsos);

    console.log(`✅ ¡Éxito! Se han plantado ${cantidad} estudiantes en ROOMEET.`);
    
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al insertar los datos:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

generarPerfiles(25);