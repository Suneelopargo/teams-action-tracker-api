CREATE DATABASE  IF NOT EXISTS `teams_action_tracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `teams_action_tracker`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: teams_action_tracker
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actionitem`
--

DROP TABLE IF EXISTS `actionitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actionitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meetingId` int NOT NULL,
  `ownerName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actionText` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `priority` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastReminder` datetime DEFAULT NULL,
  `reminderSent` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ActionItem_meetingId_fkey` (`meetingId`),
  CONSTRAINT `ActionItem_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meeting` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actionitem`
--

LOCK TABLES `actionitem` WRITE;
/*!40000 ALTER TABLE `actionitem` DISABLE KEYS */;
INSERT INTO `actionitem` VALUES (7,1,'John',NULL,'Complete API integration',NULL,'MEDIUM','OPEN','2026-06-24 06:52:56.525','2026-06-24 06:52:56.525','2026-06-24 06:52:57',0),(8,1,'Mary',NULL,'Prepare deployment checklist',NULL,'MEDIUM','OPEN','2026-06-24 06:52:56.535','2026-06-24 06:52:56.535','2026-06-24 06:52:57',0),(9,1,'Suneel','suneel.kumar@solventek.com','Coordinate production rollout',NULL,'MEDIUM','IN_PROGRESS','2026-06-24 06:52:56.542','2026-06-24 07:03:32.018','2026-06-24 06:52:57',0),(10,1,'Jonathan',NULL,'Wait for the owner to call back to explain the contract signed in 2023',NULL,'MEDIUM','OPEN','2026-06-24 08:55:41.849','2026-06-24 08:55:41.849','2026-06-24 08:55:42',0),(11,2,'Jonathan',NULL,'Wait for the owner to call back to explain the contract signed in 2023',NULL,'MEDIUM','OPEN','2026-06-24 09:17:32.610','2026-06-24 09:17:32.610','2026-06-24 09:17:33',0),(12,2,'Jonathan',NULL,'Wait for the owner to call back to explain the contract signed in 2023',NULL,'MEDIUM','OPEN','2026-06-24 09:20:44.075','2026-06-24 09:20:44.075','2026-06-24 09:20:44',0),(13,2,'Jonathan',NULL,'Get agreement from the client to pay for services',NULL,'HIGH','OPEN','2026-06-24 09:41:38.450','2026-06-24 09:41:38.450','2026-06-24 09:41:38',0),(14,2,'Jonathan',NULL,'Understand the process of the current company for claims module',NULL,'MEDIUM','OPEN','2026-06-24 09:41:38.458','2026-06-24 09:41:38.458','2026-06-24 09:41:38',0),(15,2,'Jonathan',NULL,'Present a better structured system to the client',NULL,'MEDIUM','OPEN','2026-06-24 09:41:38.467','2026-06-24 09:41:38.467','2026-06-24 09:41:38',0),(16,2,'Jonathan',NULL,'Wait for the owner to call back to explain the 2023 contract',NULL,'MEDIUM','OPEN','2026-06-24 09:41:38.475','2026-06-24 09:41:38.475','2026-06-24 09:41:38',0);
/*!40000 ALTER TABLE `actionitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appsetting`
--

DROP TABLE IF EXISTS `appsetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appsetting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `autoSendEmails` tinyint(1) NOT NULL DEFAULT '1',
  `reminderEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `openAiModel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gpt-4o',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appsetting`
--

LOCK TABLES `appsetting` WRITE;
/*!40000 ALTER TABLE `appsetting` DISABLE KEYS */;
/*!40000 ALTER TABLE `appsetting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emaillog`
--

DROP TABLE IF EXISTS `emaillog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emaillog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actionItemId` int DEFAULT NULL,
  `emailTo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sentAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emaillog`
--

LOCK TABLES `emaillog` WRITE;
/*!40000 ALTER TABLE `emaillog` DISABLE KEYS */;
INSERT INTO `emaillog` VALUES (6,9,'suneel.kumar@solventek.com','Follow-up: Sprint Planning Meeting','SENT','2026-06-24 06:52:59.843','2026-06-24 06:52:59.845');
/*!40000 ALTER TABLE `emaillog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meeting`
--

DROP TABLE IF EXISTS `meeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `graphMeetingId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meetingDate` datetime(3) NOT NULL,
  `source` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEAMS',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Meeting_graphMeetingId_key` (`graphMeetingId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting`
--

LOCK TABLES `meeting` WRITE;
/*!40000 ALTER TABLE `meeting` DISABLE KEYS */;
INSERT INTO `meeting` VALUES (1,NULL,'Sprint Planning Meeting','2026-06-23 10:00:00.000','TEAMS','2026-06-23 10:49:41.034','2026-06-23 10:49:41.034'),(2,NULL,'Walkthrough of the billing code assignment','2026-06-24 09:10:09.421','TEAMS','2026-06-24 09:10:09.480','2026-06-24 09:10:09.480');
/*!40000 ALTER TABLE `meeting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participant`
--

DROP TABLE IF EXISTS `participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meetingId` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Participant_meetingId_fkey` (`meetingId`),
  CONSTRAINT `Participant_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meeting` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participant`
--

LOCK TABLES `participant` WRITE;
/*!40000 ALTER TABLE `participant` DISABLE KEYS */;
INSERT INTO `participant` VALUES (1,1,'Suneel','suneel.kumar@solventek.com','2026-06-23 20:39:50.039');
/*!40000 ALTER TABLE `participant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transcript`
--

DROP TABLE IF EXISTS `transcript`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transcript` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meetingId` int NOT NULL,
  `transcriptText` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceFile` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sourceType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Transcript_meetingId_fkey` (`meetingId`),
  CONSTRAINT `Transcript_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meeting` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transcript`
--

LOCK TABLES `transcript` WRITE;
/*!40000 ALTER TABLE `transcript` DISABLE KEYS */;
INSERT INTO `transcript` VALUES (1,1,'John will complete API integration by Friday.\r\n\r\nMary will prepare deployment checklist.\r\n\r\nSuneel will coordinate production rollout.','sample-transcript.txt','UPLOAD','2026-06-23 14:25:32.039'),(2,1,'Vijay Ravula started transcription\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 4 seconds0:04\r\nVijay Ravula 0 minutes 4 seconds\r\nMute.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 6 seconds0:06\r\nJonathan OMeara 0 minutes 6 seconds\r\nYeah, man, this practice is a pain, man. This practice has given me the biggest headache ever. Basically, what happened with them is, so this e-medical practice has somewhat sort of the same\r\nJonathan OMeara 0 minutes 27 seconds\r\nI would say Services is you, right?\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 29 seconds0:29\r\nVijay Ravula 0 minutes 29 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 30 seconds0:30\r\nJonathan OMeara 0 minutes 30 seconds\r\nThey offer a platinum membership. And the platinum membership gets you their EMR service, which is they don\'t bill you for, it\'s for free. Then they take a percentage off of doing the billing. And then they have another thing where they do like data integration, credentialing.\r\nJonathan OMeara 0 minutes 51 seconds\r\nand whatnot. This provider bought this package back in 2023 but never honored it.\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 56 seconds0:56\r\nVijay Ravula 0 minutes 56 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 2 seconds1:02\r\nJonathan OMeara 1 minute 2 seconds\r\nand hired outside consulting.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 2 seconds1:02\r\nVijay Ravula 1 minute 2 seconds\r\nYep.\r\nVijay Ravula 1 minute 5 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 6 seconds1:06\r\nJonathan OMeara 1 minute 6 seconds\r\nSo the back and forth that we were going is that one, he didn\'t, I had to get him to agree to paying for services.\r\nJonathan OMeara 1 minute 16 seconds\r\nBecause he wasn\'t, he, he\'s he was sort of say playing a game of trying to get out of paying people.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 23 seconds1:23\r\nVijay Ravula 1 minute 23 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 24 seconds1:24\r\nJonathan OMeara 1 minute 24 seconds\r\nAnd then the next thing was in line was the current company that I took over from, I needed to understand their process when they go into this claims module and how they and how they\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 40 seconds1:40\r\nVijay Ravula 1 minute 40 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 43 seconds1:43\r\nJonathan OMeara 1 minute 43 seconds\r\nconstruct and bill claims.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 46 seconds1:46\r\nVijay Ravula 1 minute 46 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 46 seconds1:46\r\nJonathan OMeara 1 minute 46 seconds\r\nOkay.\r\nJonathan OMeara 1 minute 48 seconds\r\nSo, what I want to show you is more of...\r\nJonathan OMeara 1 minute 53 seconds\r\nkind of how they do it. It\'s a really backwards motion of it. And I don\'t really like the system, to be 100% honest with you. And I am in talks of him. I kind of got him to a point where, hey, if I were to present you something that could be a little bit better, not only in viewing point, but\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 2 seconds2:02\r\nVijay Ravula 2 minutes 2 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 14 seconds2:14\r\nJonathan OMeara 2 minutes 14 seconds\r\nkind of structured a different way, would you be open to that? He\'s waiting to see. I don\'t know what this contract was that he signed in 2023 or what it is. I\'m waiting for that owner to call me back to kind of explain to me.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 18 seconds2:18\r\nVijay Ravula 2 minutes 18 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 31 seconds2:31\r\nJonathan OMeara 2 minutes 31 seconds\r\nLike, like how this works, or if he turns it off, are they going to be helpful with transitioning?\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 38 seconds2:38\r\nVijay Ravula 2 minutes 38 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 39 seconds2:39\r\nJonathan OMeara 2 minutes 39 seconds\r\nBut, but it\'s a it\'s a he\'s got a pretty nasty way of going about business, this doctor.\r\nJonathan OMeara 2 minutes 48 seconds\r\nUm, but anyways, in this, in the claims, so...\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 48 seconds2:48\r\nVijay Ravula 2 minutes 48 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 53 seconds2:53\r\nJonathan OMeara 2 minutes 53 seconds\r\nFrom what the billing company told me, which they were very long-winded in showing me, is that this doctor sees patients primarily telehealth. And what they do is they go into the claims here.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 58 seconds2:58\r\nVijay Ravula 2 minutes 58 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n3 minutes 12 seconds3:12\r\nJonathan OMeara 3 minutes 12 seconds\r\nAnd they go into this where it says, ready claim to primary.\r\nVR\r\n\r\nVijay Ravula\r\n3 minutes 17 seconds3:17\r\nVijay Ravula 3 minutes 17 seconds\r\nOkay.\r\n','mymeetingfile.txt','UPLOAD','2026-06-24 08:54:40.598'),(5,2,'Vijay Ravula started transcription\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 4 seconds0:04\r\nVijay Ravula 0 minutes 4 seconds\r\nMute.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 6 seconds0:06\r\nJonathan OMeara 0 minutes 6 seconds\r\nYeah, man, this practice is a pain, man. This practice has given me the biggest headache ever. Basically, what happened with them is, so this e-medical practice has somewhat sort of the same\r\nJonathan OMeara 0 minutes 27 seconds\r\nI would say Services is you, right?\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 29 seconds0:29\r\nVijay Ravula 0 minutes 29 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 30 seconds0:30\r\nJonathan OMeara 0 minutes 30 seconds\r\nThey offer a platinum membership. And the platinum membership gets you their EMR service, which is they don\'t bill you for, it\'s for free. Then they take a percentage off of doing the billing. And then they have another thing where they do like data integration, credentialing.\r\nJonathan OMeara 0 minutes 51 seconds\r\nand whatnot. This provider bought this package back in 2023 but never honored it.\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 56 seconds0:56\r\nVijay Ravula 0 minutes 56 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 2 seconds1:02\r\nJonathan OMeara 1 minute 2 seconds\r\nand hired outside consulting.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 2 seconds1:02\r\nVijay Ravula 1 minute 2 seconds\r\nYep.\r\nVijay Ravula 1 minute 5 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 6 seconds1:06\r\nJonathan OMeara 1 minute 6 seconds\r\nSo the back and forth that we were going is that one, he didn\'t, I had to get him to agree to paying for services.\r\nJonathan OMeara 1 minute 16 seconds\r\nBecause he wasn\'t, he, he\'s he was sort of say playing a game of trying to get out of paying people.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 23 seconds1:23\r\nVijay Ravula 1 minute 23 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 24 seconds1:24\r\nJonathan OMeara 1 minute 24 seconds\r\nAnd then the next thing was in line was the current company that I took over from, I needed to understand their process when they go into this claims module and how they and how they\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 40 seconds1:40\r\nVijay Ravula 1 minute 40 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 43 seconds1:43\r\nJonathan OMeara 1 minute 43 seconds\r\nconstruct and bill claims.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 46 seconds1:46\r\nVijay Ravula 1 minute 46 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 46 seconds1:46\r\nJonathan OMeara 1 minute 46 seconds\r\nOkay.\r\nJonathan OMeara 1 minute 48 seconds\r\nSo, what I want to show you is more of...\r\nJonathan OMeara 1 minute 53 seconds\r\nkind of how they do it. It\'s a really backwards motion of it. And I don\'t really like the system, to be 100% honest with you. And I am in talks of him. I kind of got him to a point where, hey, if I were to present you something that could be a little bit better, not only in viewing point, but\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 2 seconds2:02\r\nVijay Ravula 2 minutes 2 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 14 seconds2:14\r\nJonathan OMeara 2 minutes 14 seconds\r\nkind of structured a different way, would you be open to that? He\'s waiting to see. I don\'t know what this contract was that he signed in 2023 or what it is. I\'m waiting for that owner to call me back to kind of explain to me.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 18 seconds2:18\r\nVijay Ravula 2 minutes 18 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 31 seconds2:31\r\nJonathan OMeara 2 minutes 31 seconds\r\nLike, like how this works, or if he turns it off, are they going to be helpful with transitioning?\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 38 seconds2:38\r\nVijay Ravula 2 minutes 38 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 39 seconds2:39\r\nJonathan OMeara 2 minutes 39 seconds\r\nBut, but it\'s a it\'s a he\'s got a pretty nasty way of going about business, this doctor.\r\nJonathan OMeara 2 minutes 48 seconds\r\nUm, but anyways, in this, in the claims, so...\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 48 seconds2:48\r\nVijay Ravula 2 minutes 48 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 53 seconds2:53\r\nJonathan OMeara 2 minutes 53 seconds\r\nFrom what the billing company told me, which they were very long-winded in showing me, is that this doctor sees patients primarily telehealth. And what they do is they go into the claims here.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 58 seconds2:58\r\nVijay Ravula 2 minutes 58 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n3 minutes 12 seconds3:12\r\nJonathan OMeara 3 minutes 12 seconds\r\nAnd they go into this where it says, ready claim to primary.\r\nVR\r\n\r\nVijay Ravula\r\n3 minutes 17 seconds3:17\r\nVijay Ravula 3 minutes 17 seconds\r\nOkay.\r\n','mymeetingfile.txt','UPLOAD','2026-06-24 09:15:59.429'),(6,2,'Vijay Ravula started transcription\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 4 seconds0:04\r\nVijay Ravula 0 minutes 4 seconds\r\nMute.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 6 seconds0:06\r\nJonathan OMeara 0 minutes 6 seconds\r\nYeah, man, this practice is a pain, man. This practice has given me the biggest headache ever. Basically, what happened with them is, so this e-medical practice has somewhat sort of the same\r\nJonathan OMeara 0 minutes 27 seconds\r\nI would say Services is you, right?\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 29 seconds0:29\r\nVijay Ravula 0 minutes 29 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 30 seconds0:30\r\nJonathan OMeara 0 minutes 30 seconds\r\nThey offer a platinum membership. And the platinum membership gets you their EMR service, which is they don\'t bill you for, it\'s for free. Then they take a percentage off of doing the billing. And then they have another thing where they do like data integration, credentialing.\r\nJonathan OMeara 0 minutes 51 seconds\r\nand whatnot. This provider bought this package back in 2023 but never honored it.\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 56 seconds0:56\r\nVijay Ravula 0 minutes 56 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 2 seconds1:02\r\nJonathan OMeara 1 minute 2 seconds\r\nand hired outside consulting.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 2 seconds1:02\r\nVijay Ravula 1 minute 2 seconds\r\nYep.\r\nVijay Ravula 1 minute 5 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 6 seconds1:06\r\nJonathan OMeara 1 minute 6 seconds\r\nSo the back and forth that we were going is that one, he didn\'t, I had to get him to agree to paying for services.\r\nJonathan OMeara 1 minute 16 seconds\r\nBecause he wasn\'t, he, he\'s he was sort of say playing a game of trying to get out of paying people.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 23 seconds1:23\r\nVijay Ravula 1 minute 23 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 24 seconds1:24\r\nJonathan OMeara 1 minute 24 seconds\r\nAnd then the next thing was in line was the current company that I took over from, I needed to understand their process when they go into this claims module and how they and how they\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 40 seconds1:40\r\nVijay Ravula 1 minute 40 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 43 seconds1:43\r\nJonathan OMeara 1 minute 43 seconds\r\nconstruct and bill claims.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 46 seconds1:46\r\nVijay Ravula 1 minute 46 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 46 seconds1:46\r\nJonathan OMeara 1 minute 46 seconds\r\nOkay.\r\nJonathan OMeara 1 minute 48 seconds\r\nSo, what I want to show you is more of...\r\nJonathan OMeara 1 minute 53 seconds\r\nkind of how they do it. It\'s a really backwards motion of it. And I don\'t really like the system, to be 100% honest with you. And I am in talks of him. I kind of got him to a point where, hey, if I were to present you something that could be a little bit better, not only in viewing point, but\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 2 seconds2:02\r\nVijay Ravula 2 minutes 2 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 14 seconds2:14\r\nJonathan OMeara 2 minutes 14 seconds\r\nkind of structured a different way, would you be open to that? He\'s waiting to see. I don\'t know what this contract was that he signed in 2023 or what it is. I\'m waiting for that owner to call me back to kind of explain to me.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 18 seconds2:18\r\nVijay Ravula 2 minutes 18 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 31 seconds2:31\r\nJonathan OMeara 2 minutes 31 seconds\r\nLike, like how this works, or if he turns it off, are they going to be helpful with transitioning?\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 38 seconds2:38\r\nVijay Ravula 2 minutes 38 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 39 seconds2:39\r\nJonathan OMeara 2 minutes 39 seconds\r\nBut, but it\'s a it\'s a he\'s got a pretty nasty way of going about business, this doctor.\r\nJonathan OMeara 2 minutes 48 seconds\r\nUm, but anyways, in this, in the claims, so...\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 48 seconds2:48\r\nVijay Ravula 2 minutes 48 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 53 seconds2:53\r\nJonathan OMeara 2 minutes 53 seconds\r\nFrom what the billing company told me, which they were very long-winded in showing me, is that this doctor sees patients primarily telehealth. And what they do is they go into the claims here.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 58 seconds2:58\r\nVijay Ravula 2 minutes 58 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n3 minutes 12 seconds3:12\r\nJonathan OMeara 3 minutes 12 seconds\r\nAnd they go into this where it says, ready claim to primary.\r\nVR\r\n\r\nVijay Ravula\r\n3 minutes 17 seconds3:17\r\nVijay Ravula 3 minutes 17 seconds\r\nOkay.\r\n','mymeetingfile.txt','UPLOAD','2026-06-24 09:19:57.399'),(7,2,'Vijay Ravula started transcription\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 4 seconds0:04\r\nVijay Ravula 0 minutes 4 seconds\r\nMute.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 6 seconds0:06\r\nJonathan OMeara 0 minutes 6 seconds\r\nYeah, man, this practice is a pain, man. This practice has given me the biggest headache ever. Basically, what happened with them is, so this e-medical practice has somewhat sort of the same\r\nJonathan OMeara 0 minutes 27 seconds\r\nI would say Services is you, right?\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 29 seconds0:29\r\nVijay Ravula 0 minutes 29 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n0 minutes 30 seconds0:30\r\nJonathan OMeara 0 minutes 30 seconds\r\nThey offer a platinum membership. And the platinum membership gets you their EMR service, which is they don\'t bill you for, it\'s for free. Then they take a percentage off of doing the billing. And then they have another thing where they do like data integration, credentialing.\r\nJonathan OMeara 0 minutes 51 seconds\r\nand whatnot. This provider bought this package back in 2023 but never honored it.\r\nVR\r\n\r\nVijay Ravula\r\n0 minutes 56 seconds0:56\r\nVijay Ravula 0 minutes 56 seconds\r\nYeah.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 2 seconds1:02\r\nJonathan OMeara 1 minute 2 seconds\r\nand hired outside consulting.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 2 seconds1:02\r\nVijay Ravula 1 minute 2 seconds\r\nYep.\r\nVijay Ravula 1 minute 5 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 6 seconds1:06\r\nJonathan OMeara 1 minute 6 seconds\r\nSo the back and forth that we were going is that one, he didn\'t, I had to get him to agree to paying for services.\r\nJonathan OMeara 1 minute 16 seconds\r\nBecause he wasn\'t, he, he\'s he was sort of say playing a game of trying to get out of paying people.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 23 seconds1:23\r\nVijay Ravula 1 minute 23 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 24 seconds1:24\r\nJonathan OMeara 1 minute 24 seconds\r\nAnd then the next thing was in line was the current company that I took over from, I needed to understand their process when they go into this claims module and how they and how they\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 40 seconds1:40\r\nVijay Ravula 1 minute 40 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 43 seconds1:43\r\nJonathan OMeara 1 minute 43 seconds\r\nconstruct and bill claims.\r\nVR\r\n\r\nVijay Ravula\r\n1 minute 46 seconds1:46\r\nVijay Ravula 1 minute 46 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n1 minute 46 seconds1:46\r\nJonathan OMeara 1 minute 46 seconds\r\nOkay.\r\nJonathan OMeara 1 minute 48 seconds\r\nSo, what I want to show you is more of...\r\nJonathan OMeara 1 minute 53 seconds\r\nkind of how they do it. It\'s a really backwards motion of it. And I don\'t really like the system, to be 100% honest with you. And I am in talks of him. I kind of got him to a point where, hey, if I were to present you something that could be a little bit better, not only in viewing point, but\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 2 seconds2:02\r\nVijay Ravula 2 minutes 2 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 14 seconds2:14\r\nJonathan OMeara 2 minutes 14 seconds\r\nkind of structured a different way, would you be open to that? He\'s waiting to see. I don\'t know what this contract was that he signed in 2023 or what it is. I\'m waiting for that owner to call me back to kind of explain to me.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 18 seconds2:18\r\nVijay Ravula 2 minutes 18 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 31 seconds2:31\r\nJonathan OMeara 2 minutes 31 seconds\r\nLike, like how this works, or if he turns it off, are they going to be helpful with transitioning?\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 38 seconds2:38\r\nVijay Ravula 2 minutes 38 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 39 seconds2:39\r\nJonathan OMeara 2 minutes 39 seconds\r\nBut, but it\'s a it\'s a he\'s got a pretty nasty way of going about business, this doctor.\r\nJonathan OMeara 2 minutes 48 seconds\r\nUm, but anyways, in this, in the claims, so...\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 48 seconds2:48\r\nVijay Ravula 2 minutes 48 seconds\r\nOkay.\r\nJO\r\n\r\nJonathan OMeara\r\n2 minutes 53 seconds2:53\r\nJonathan OMeara 2 minutes 53 seconds\r\nFrom what the billing company told me, which they were very long-winded in showing me, is that this doctor sees patients primarily telehealth. And what they do is they go into the claims here.\r\nVR\r\n\r\nVijay Ravula\r\n2 minutes 58 seconds2:58\r\nVijay Ravula 2 minutes 58 seconds\r\nMhm.\r\nJO\r\n\r\nJonathan OMeara\r\n3 minutes 12 seconds3:12\r\nJonathan OMeara 3 minutes 12 seconds\r\nAnd they go into this where it says, ready claim to primary.\r\nVR\r\n\r\nVijay Ravula\r\n3 minutes 17 seconds3:17\r\nVijay Ravula 3 minutes 17 seconds\r\nOkay.\r\n','mymeetingfile.txt','UPLOAD','2026-06-24 09:41:28.591');
/*!40000 ALTER TABLE `transcript` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'suneel@solventek.com','Suneel','USER','2026-06-23 07:03:02.486','2026-06-23 07:14:59.427');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-24 15:16:06
