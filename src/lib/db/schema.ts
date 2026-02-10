import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "landlord", "tenant"]);
export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "house",
  "room",
  "studio",
  "commercial",
]);
export const documentTypeEnum = pgEnum("document_type", ["cc", "ce", "passport"]);
export const leaseStatusEnum = pgEnum("lease_status", [
  "draft",
  "pending_signature",
  "pending_landlord_approval",
  "approved",
  "rejected",
  "cancelled",
  "active",
  "completed",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("password_hash", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  roles: userRoleEnum("roles").array().default(["tenant"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  propertyType: propertyTypeEnum("property_type").notNull().default("apartment"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("COP"),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  areaSqm: decimal("area_sqm", { precision: 8, scale: 2 }),
  isFurnished: boolean("is_furnished").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property images table
export const propertyImages = pgTable("property_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tenant profiles table
export const tenantProfiles = pgTable("tenant_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  documentNumber: varchar("document_number", { length: 50 }).notNull(),
  occupation: varchar("occupation", { length: 255 }).notNull(),
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }).notNull(),
  referenceName: varchar("reference_name", { length: 255 }).notNull(),
  referencePhone: varchar("reference_phone", { length: 20 }).notNull(),
  referenceRelation: varchar("reference_relation", { length: 100 }).notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leases table
export const leases = pgTable("leases", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  monthlyRent: decimal("monthly_rent", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("COP"),
  depositAmount: decimal("deposit_amount", { precision: 12, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: leaseStatusEnum("status").notNull().default("draft"),
  currentStep: integer("current_step").notNull().default(1),
  tenantSignedAt: timestamp("tenant_signed_at"),
  tenantSignatureHash: varchar("tenant_signature_hash", { length: 255 }),
  landlordRespondedAt: timestamp("landlord_responded_at"),
  landlordNotes: text("landlord_notes"),
  contractContent: text("contract_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// OTP codes table
export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leaseId: uuid("lease_id")
    .notNull()
    .references(() => leases.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  properties: many(properties),
  tenantProfile: one(tenantProfiles),
  leasesAsTenant: many(leases, { relationName: "tenant" }),
  leasesAsLandlord: many(leases, { relationName: "landlord" }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  images: many(propertyImages),
  leases: many(leases),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const tenantProfilesRelations = relations(tenantProfiles, ({ one }) => ({
  user: one(users, {
    fields: [tenantProfiles.userId],
    references: [users.id],
  }),
}));

export const leasesRelations = relations(leases, ({ one }) => ({
  property: one(properties, {
    fields: [leases.propertyId],
    references: [properties.id],
  }),
  tenant: one(users, {
    fields: [leases.tenantId],
    references: [users.id],
    relationName: "tenant",
  }),
  landlord: one(users, {
    fields: [leases.landlordId],
    references: [users.id],
    relationName: "landlord",
  }),
}));

export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, {
    fields: [otpCodes.userId],
    references: [users.id],
  }),
  lease: one(leases, {
    fields: [otpCodes.leaseId],
    references: [leases.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;
export type TenantProfile = typeof tenantProfiles.$inferSelect;
export type NewTenantProfile = typeof tenantProfiles.$inferInsert;
export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
