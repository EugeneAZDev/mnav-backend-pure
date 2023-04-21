-- CREATED MANUALLY
CREATE TABLE "User" (
  id bigint generated always as identity,
  email varchar(64) NOT NULL,
  password varchar
);
ALTER TABLE "User" ADD CONSTRAINT "pkUser" PRIMARY KEY (id);
CREATE UNIQUE INDEX "akUserEmail" ON "User" (email);

CREATE TYPE "ItemPriority" AS ENUM ('low', 'medium', 'high', 'none', 'optional');
CREATE TYPE "ItemType" AS ENUM('active', 'sport', 'other');
CREATE TABLE "Item" (
	id bigint GENERATED ALWAYS AS IDENTITY,
	title varchar NOT NULL,
	description varchar,
	"targetValue" smallint,
	priority "ItemPriority",
	type "ItemType",
	"userId" bigint,
	"createdAt" timestamp WITHOUT time ZONE DEFAULT now(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "Item" ADD CONSTRAINT "pkItem" PRIMARY KEY (id);
ALTER TABLE "Item" ADD CONSTRAINT "fkItemUser" FOREIGN KEY ("userId") REFERENCES "User" (id);

CREATE TABLE "ItemValue" (
	id bigint GENERATED ALWAYS AS IDENTITY,
	"itemId" bigint,
	value varchar,
	"createdAt" timestamp WITHOUT time ZONE DEFAULT now(),
	"updatedAt" timestamp WITHOUT time ZONE,
	"deletedAt" timestamp WITHOUT time ZONE
);
ALTER TABLE "ItemValue" ADD CONSTRAINT "pkItemValue" PRIMARY KEY (id);
ALTER TABLE "ItemValue" ADD CONSTRAINT "fkItemValueItem" FOREIGN KEY ("itemId") REFERENCES "Item" (id);
