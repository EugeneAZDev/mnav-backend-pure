-- admin@local.loc/123456
INSERT INTO "User" ("email", "password") VALUES
  ('admin@local.loc', '$scrypt$N=32768,r=8,p=1,maxmem=67108864$p7DBp3v1Zx+69RVx34h5Ag7cD3afRPCzVRVnEjsHyJw$68t4RJhzu/jlU0LBQ1WcOT11/DF8Ycn3h6CqBOsC1HNKkQDYoTyzcd2G1AWxGM0h4rX/JeykrycI1FDMYM8psQ');   

INSERT INTO "Item" (title, description, "targetValue", priority, "type", "userId", "createdAt")
VALUES
	('EYES', 'Exercises', 10, 'high'::"ItemPriority", 'active'::"ItemType", 1, now()),
	('LEGS', 'Squats', 20, 'medium'::"ItemPriority", 'sport'::"ItemType", 1, '2023-04-20 11:45:00'),
	('ARMS', 'Push-ups', 15, 'low'::"ItemPriority", 'sport'::"ItemType", 1, '2023-04-20 14:00:00'),
	('BACK', 'Deadlifts', 30, 'high'::"ItemPriority", 'sport'::"ItemType", 1, now()),
	('CORE', 'Planks', 5, 'optional'::"ItemPriority", 'active'::"ItemType", 1, '2023-04-21 18:15:00');

INSERT INTO public."ItemValue" ("itemId", value, "createdAt")
VALUES (1, 8, '2023-04-19 08:00:00'), (1, 12, '2023-04-19 09:30:00'), (4, 16, '2023-04-20 11:00:00'),
  (4, 21, '2023-04-20 13:45:00'), (1, 9, '2023-04-21 15:00:00'), (1, 12, '2023-04-22 08:30:00'),
  (4, 15, '2023-04-22 10:15:00'), (5, 19, '2023-04-23 12:30:00'), (4, 24, '2023-04-23 14:00:00'),
  (3, 10, '2023-04-24 16:00:00'), (1, 10, '2023-04-25 08:45:00'), (2, 11, '2023-04-25 09:00:00'),
  (1, 17, '2023-04-26 11:30:00'), (1, 22, '2023-04-26 14:15:00'), (2, 12, '2023-04-27 16:30:00'),
  (2, 9, '2023-04-28 08:15:00'), (2, 14, '2023-04-28 10:30:00'), (3, 18, '2023-04-29 12:15:00'),
  (3, 23, '2023-04-29 14:45:00'), (3, 11, '2023-04-30 16:15:00'), (3, 8, now()),
  (2, 13, now()), (2, 15, now()), (1, 20, now()), (1, 8, now());
