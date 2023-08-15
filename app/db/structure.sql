-- CREATED MANUALLY

-- TYPES
CREATE TYPE "ValueType" AS ENUM ('text', 'number', 'seconds', 'minutes');

-- TABLES
CREATE TABLE "User" (
  id bigint GENERATED ALWAYS AS IDENTITY,
  email varchar(100) NOT NULL,
	token varchar(255),
  password varchar(255),
  "timeZone" smallint,
	"createdAt" timestamp WITHOUT time ZONE DEFAULT NOW(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "User" ADD CONSTRAINT "pkUser" PRIMARY KEY (id);
CREATE UNIQUE INDEX "akUserEmail" ON "User" (email);

CREATE TABLE "ItemSection" (
	id bigint GENERATED ALWAYS AS IDENTITY,
	title varchar(50) NOT NULL,
	"userId" bigint NOT NULL,
	"createdAt" timestamp WITHOUT time ZONE DEFAULT NOW(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "ItemSection" ADD CONSTRAINT "pkItemSection" PRIMARY KEY (id);
ALTER TABLE "ItemSection" ADD CONSTRAINT "fkItemSectionUser" FOREIGN KEY ("userId") REFERENCES "User" (id);

CREATE TABLE "Item" (
	id bigint GENERATED ALWAYS AS IDENTITY,
	title varchar(50) NOT NULL,
	description varchar(255),
	target smallint,
	"sectionId" bigint,
	"valueType" "ValueType" NOT NULL,
	"valueAssessment" boolean,
	visible boolean DEFAULT TRUE,
	"userId" bigint NOT NULL,
	"createdAt" timestamp WITHOUT time ZONE DEFAULT NOW(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "Item" ADD CONSTRAINT "pkItem" PRIMARY KEY (id);
ALTER TABLE "Item" ADD CONSTRAINT "fkItemUser" FOREIGN KEY ("userId") REFERENCES "User" (id);
ALTER TABLE "Item" ADD CONSTRAINT "fkItemSection" FOREIGN KEY ("sectionId") REFERENCES "ItemSection" (id);

CREATE TABLE "ItemValue" (
	id bigint GENERATED ALWAYS AS IDENTITY,
	"itemId" bigint,
	value varchar(255),
	"createdAt" timestamp WITHOUT time ZONE DEFAULT NOW(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "ItemValue" ADD CONSTRAINT "pkItemValue" PRIMARY KEY (id);
ALTER TABLE "ItemValue" ADD CONSTRAINT "fkItemValueItem" FOREIGN KEY ("itemId") REFERENCES "Item" (id);

CREATE TABLE "ValueDetail" (
  id bigint GENERATED ALWAYS AS IDENTITY,
	"itemId" bigint,
  "latestAt" timestamp WITHOUT time ZONE,
	"title" varchar(255),
	"startedAt" timestamp WITHOUT time ZONE,
	"daysDone" integer,
	"daysMissed" integer,
	"total" integer,
	-- "daysMinStrike" integer,
	-- "dateDaysMinStrike" timestamp WITHOUT time ZONE,
	-- "daysMaxStrike" integer,
	-- "dateDaysMaxStrike" timestamp WITHOUT time ZONE,
	-- "daysLatestStrike" integer,
	-- "dateDaysLatestStrike" timestamp WITHOUT time ZONE,
	-- "daysMinDelay" integer,
	-- "dateDaysMinDelay" timestamp WITHOUT time ZONE,
	-- "daysMaxDelay" integer,
	-- "dateDaysMaxDelay" timestamp WITHOUT time ZONE,
	-- "daysLatestDelay" integer,
	-- "dateDaysLatestDelay" timestamp WITHOUT time ZONE,
	-- "min" integer,
	-- "dateMin" timestamp WITHOUT time ZONE,
	-- "max" integer,
	-- "dateMax" timestamp WITHOUT time ZONE,
	-- "minPerDay" integer,
	-- "dateMinPerDay" timestamp WITHOUT time ZONE,
	-- "maxPerDay" integer,
	-- "dateMaxPerDay" timestamp WITHOUT time ZONE,
	-- "daysTargetDone" integer,
	-- "daysTargetMissed" integer,
	-- "daysMinTargetStrike" integer,
	-- "dateDaysMinTargetStrike" timestamp WITHOUT time ZONE,
	-- "daysMaxTargetStrike" integer,
	-- "dateDaysMaxTargetStrike" timestamp WITHOUT time ZONE,
	-- "daysLatestTargetStrike" integer,
	-- "dateDaysLatestTargetStrike" timestamp WITHOUT time ZONE,
	"createdAt" timestamp WITHOUT time ZONE DEFAULT NOW(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
