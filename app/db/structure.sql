-- CREATED MANUALLY
CREATE TABLE "User" (
  id bigint generated always as identity,
  email varchar(64) NOT NULL,
  password varchar
);
ALTER TABLE "User" ADD CONSTRAINT "pkUser" PRIMARY KEY (id);
CREATE UNIQUE INDEX "akUserEmail" ON "User" (email);

CREATE TYPE "ItemPriority" AS ENUM ('none', 'low', 'medium', 'high');
CREATE TYPE "ItemType" AS ENUM('active', 'sport', 'other');
CREATE TABLE "Item" (
	id bigint GENERATED ALWAYS AS IDENTITY,
	title varchar NOT NULL,
	description varchar,
	"targetValue" varchar,
	priority "ItemPriority",
	type "ItemType",
	"userId" bigint, -- SHOULD BE NOT NULL, will be implemented with authorization
	"createdAt" timestamp WITHOUT time ZONE DEFAULT now(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "Item" ADD CONSTRAINT "pkItem" PRIMARY KEY (id);
ALTER TABLE "Item" ADD CONSTRAINT "fkItemUser" FOREIGN KEY ("userId") REFERENCES "User" (id);

CREATE TABLE "ItemValue" (
	id bigint GENERATED ALWAYS AS IDENTITY,
	"itemId" bigint,
	"userId" bigint,
	value varchar,
	"createdAt" timestamp WITHOUT time ZONE DEFAULT now(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "ItemValue" ADD CONSTRAINT "pkItemValue" PRIMARY KEY (id);
ALTER TABLE "ItemValue" ADD CONSTRAINT "fkItemValueItem" FOREIGN KEY ("itemId") REFERENCES "Item" (id);
ALTER TABLE "ItemValue" ADD CONSTRAINT "fkItemValueUser" FOREIGN KEY ("userId") REFERENCES "User" (id);
