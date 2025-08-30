// src/types/roles.ts
export enum Role {
    Admin = "admin",
    User = "user",
    Companion = "companion",
  }
  
  export enum UserGender {
    MALE = "male",
    FEMALE = "female",
    OTHERS = "others",
  }
  
  export enum EventStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    ONGOING = "ongoing",
  }
  
  export enum MediaType {
    PHOTO = "photo",
    VIDEO = "video",
  }

  export enum BookingStatus {
    PAID = "paid",
    CANCELLED = "cancelled",
    PENDING = "pending",
  }

  export enum MaritalStatus {
    SINGLE = "single",
    MARRIED = "married",
    DIVORCED = "divorced",
    WIDOWED = "widowed",
    OTHER = "other",
  }

  export enum RelationshipType {
    FRIEND = "friend",
    FAMILY = "family",
    SPOUSE = "spouse",
    COLLEAGUE = "colleague",
    OTHER = "other",
  }
  