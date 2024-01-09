DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(30) DEFAULT NULL,
  `salary` decimal(10,0) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id_key_idx` (`department_id`),
  CONSTRAINT `department_id_key` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`)
);

CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `role_id` int DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_key_idx` (`role_id`),
  KEY `manager_key_idx` (`manager_id`),
  CONSTRAINT `manager_key` FOREIGN KEY (`manager_id`) REFERENCES `employee` (`id`),
  CONSTRAINT `role_key` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
);

