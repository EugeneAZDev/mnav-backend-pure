-- admin@local.loc/123456
INSERT INTO "User" ("email", "password", "premiumAt", "premiumPeriod") VALUES
  ('admin@local.loc',
   '$scrypt$N=32768,r=8,p=1,maxmem=67108864$p7DBp3v1Zx+69RVx34h5Ag7cD3afRPCzVRVnEjsHyJw$68t4RJhzu/jlU0LBQ1WcOT11/DF8Ycn3h6CqBOsC1HNKkQDYoTyzcd2G1AWxGM0h4rX/JeykrycI1FDMYM8psQ',
   NOW(), 'month');

INSERT INTO "ItemSection"
  (title, "userId", "createdAt")
VALUES
  ('Activity', 1,    '2020-01-01 15:55:55'),
  ('Other', 1,       '2020-01-01 15:57:05');

INSERT INTO "Item" 
  (title, description, target, "sectionId", "valueType", "valueAssessment", "userId", "createdAt")
VALUES
  ('Steps', 'Migration number type check', 5, 1, 'number', TRUE, 1, '2020-04-20 18:15:00'),
  ('Movies', 'Migration text type check', NULL, 2, 'text', TRUE, 1, '2020-04-21 18:15:00');

INSERT INTO public."ItemValue"
  ("itemId", value, "createdAt")
VALUES
  -- Value Type Number
  (1, 2, '2023-08-02 09:00:00'),
  (1, 3, '2023-08-02 09:00:00'),
  (1, 4, '2023-08-03 09:00:00'),
  (1, 5, '2023-08-07 09:00:00'),
  (1, 2, '2023-08-08 09:00:00');
  -- Value Type Text '24 hours'
  -- (2, '24 hours', '2023-08-22 15:00:00'),
  -- (2, '24 hours', '2023-08-25 15:25:17'),
  -- Value Type Text 'Knight Rider'
  -- (2, 'Knight Rider', '2023-08-23 17:30:00'),
  -- (2, 'Knight Rider', '2023-08-25 17:30:00')
;

-- Value Type Number
-- "latestAt": '2023-08-01 08:00:00'
-- "startedAt":'2023-08-05 09:15:00'
-- "daysDone": 2
-- "daysMissed": 0
-- "total": 2,

-- Value Type Text Title '24 hours'
-- "latestAt": '2023-04-22 08:00:00'
-- "startedAt":'2023-04-22 08:00:00'
-- "daysDone": 1
-- "daysMissed": 0

-- Value Type Text Title 'Knight Rider'
-- "latestAt": '2023-04-22 08:00:00'
-- "startedAt":'2023-04-22 08:00:00'
-- "daysDone": 1
-- "daysMissed": 0
