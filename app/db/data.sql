-- admin@local.loc/123456
INSERT INTO "User" ("email", "password") VALUES
  ('admin@local.loc', '$scrypt$N=32768,r=8,p=1,maxmem=67108864$p7DBp3v1Zx+69RVx34h5Ag7cD3afRPCzVRVnEjsHyJw$68t4RJhzu/jlU0LBQ1WcOT11/DF8Ycn3h6CqBOsC1HNKkQDYoTyzcd2G1AWxGM0h4rX/JeykrycI1FDMYM8psQ');   

INSERT INTO "ItemSection"
  (title, "userId", "createdAt")
VALUES
  ('Activity', 1,    '2020-01-01 15:55:55'),
  ('Other', 1,       '2020-01-01 15:57:05');

INSERT INTO "Item" 
  (title, description, target, "sectionId", "valueType", "valueAssessment", "userId", "createdAt")
VALUES
  ('MIGRATION', 'Migration number type check', 5, 1, 'number', TRUE, 1, '2020-04-20 18:15:00'),
  ('MIGRATION2', 'Migration text type check', NULL, 2, 'text', TRUE, 1, '2020-04-21 18:15:00');

INSERT INTO public."ItemValue"
  ("itemId", value, "createdAt")
VALUES
  (1,        1,     '2023-04-19 08:00:00')


-- "latestAt": '2023-04-19 08:00:00'
-- "titleValue": 
-- "startedAt":'2023-04-19 08:00:00'
-- "daysDone"
-- "daysMissed"
-- "daysMinStrike"
-- "dateDaysMinStrike"
-- "daysMaxStrike"
-- "dateDaysMaxStrike"
-- "daysLatestStrike"
-- "dateDaysLatestStrike"
-- "daysMinDelay"
-- "dateDaysMinDelay"
-- "daysMaxDelay"
-- "dateDaysMaxDelay"
-- "daysLatestDelay"
-- "dateDaysLatestDelay"
-- "min"
-- "dateMin"
-- "max"
-- "dateMax"
-- "minPerDay"
-- "dateMinPerDay"
-- "maxPerDay"
-- "dateMaxPerDay"
-- "total"