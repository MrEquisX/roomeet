/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: roomeet
-- ------------------------------------------------------
-- Server version	11.4.10-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `alojamientos`
--

DROP TABLE IF EXISTS `alojamientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alojamientos` (
  `id_alojamiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_anfitrion` int(11) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `precio_mensual` decimal(10,2) NOT NULL,
  `habitaciones_disponibles` int(11) DEFAULT 1,
  `reglas_casa` text DEFAULT NULL,
  PRIMARY KEY (`id_alojamiento`),
  KEY `fk_alojamiento_usuario` (`id_anfitrion`),
  CONSTRAINT `fk_alojamiento_usuario` FOREIGN KEY (`id_anfitrion`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alojamientos`
--

LOCK TABLES `alojamientos` WRITE;
/*!40000 ALTER TABLE `alojamientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `alojamientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `intereses_catalogo`
--

DROP TABLE IF EXISTS `intereses_catalogo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `intereses_catalogo` (
  `id_interes` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_interes` varchar(50) NOT NULL,
  PRIMARY KEY (`id_interes`),
  UNIQUE KEY `nombre_interes` (`nombre_interes`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intereses_catalogo`
--

LOCK TABLES `intereses_catalogo` WRITE;
/*!40000 ALTER TABLE `intereses_catalogo` DISABLE KEYS */;
INSERT INTO `intereses_catalogo` VALUES
(4,'Básquetbol'),
(6,'Cine y Series'),
(8,'Cocina'),
(1,'Fútbol'),
(2,'Gimnasio'),
(7,'Lectura'),
(5,'Música'),
(3,'Videojuegos');
/*!40000 ALTER TABLE `intereses_catalogo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `id_match` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario_interesado` int(11) NOT NULL,
  `id_usuario_objetivo` int(11) NOT NULL,
  `estado` enum('Pendiente','Aceptado','Rechazado') DEFAULT 'Pendiente',
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_match`),
  KEY `fk_match_interesado` (`id_usuario_interesado`),
  KEY `fk_match_objetivo` (`id_usuario_objetivo`),
  CONSTRAINT `fk_match_interesado` FOREIGN KEY (`id_usuario_interesado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_match_objetivo` FOREIGN KEY (`id_usuario_objetivo`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_convivencia`
--

DROP TABLE IF EXISTS `preferencias_convivencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferencias_convivencia` (
  `id_preferencia` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `fuma` tinyint(1) DEFAULT 0,
  `acepta_mascotas` tinyint(1) DEFAULT 0,
  `nivel_orden` int(11) DEFAULT NULL CHECK (`nivel_orden` between 1 and 5),
  `nivel_ruido` int(11) DEFAULT NULL CHECK (`nivel_ruido` between 1 and 5),
  `visitas_frecuentes` tinyint(1) DEFAULT 0,
  `horario_preferido` enum('Diurno','Nocturno','Indiferente') DEFAULT 'Indiferente',
  PRIMARY KEY (`id_preferencia`),
  KEY `fk_preferencias_usuario` (`id_usuario`),
  CONSTRAINT `fk_preferencias_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_convivencia`
--

LOCK TABLES `preferencias_convivencia` WRITE;
/*!40000 ALTER TABLE `preferencias_convivencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferencias_convivencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_intereses`
--

DROP TABLE IF EXISTS `usuario_intereses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_intereses` (
  `id_usuario` int(11) NOT NULL,
  `id_interes` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_interes`),
  KEY `fk_ui_interes` (`id_interes`),
  CONSTRAINT `fk_ui_interes` FOREIGN KEY (`id_interes`) REFERENCES `intereses_catalogo` (`id_interes`) ON DELETE CASCADE,
  CONSTRAINT `fk_ui_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_intereses`
--

LOCK TABLES `usuario_intereses` WRITE;
/*!40000 ALTER TABLE `usuario_intereses` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_intereses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `sexo_biologico` enum('Masculino','Femenino','Otro') DEFAULT NULL,
  `identidad_genero` varchar(50) DEFAULT NULL,
  `universidad` varchar(100) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `anio_ingreso` int(11) DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `rol` enum('Buscador','Anfitrion') NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(1,'André Limarí','andre.estudiante@pucv.cl','segura123','+56912345678','https://pucv.cl/foto.jpg','1998-10-20','Masculino','Hombre',NULL,'Ingeniería en Informática',2021,'Soy estudiante de informática y busco un roomie tranquilo para el último semestre.','Buscador');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'roomeet'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-03 23:40:19
