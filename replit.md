# Overview

This is a Thai language referral management system called "World ID Referral" that allows users to register, login, and manage referrals with automatic allocation. The system is built as a full-stack web application with a React frontend and Express.js backend, using PostgreSQL for data persistence and implementing a mobile-first responsive design.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing with protected and public route components
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent design
- **Styling**: Tailwind CSS with CSS custom properties for theming, supporting both light and dark modes
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Client-side authentication using localStorage for session persistence

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema Validation**: Zod schemas shared between frontend and backend for consistent validation
- **API Design**: RESTful API with JSON responses and centralized error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

## Database Design
- **Users Table**: Stores user information including phone numbers, referrer relationships, and earning limits
- **Referrals Table**: Tracks referral relationships with status management (pending, verified, completed)
- **Constraints**: Unique phone numbers, referrer relationships, and automatic UUID generation

## Mobile-First Design
- **Responsive Layout**: Mobile-optimized interface with bottom navigation for primary actions
- **Touch-Friendly**: Large touch targets and gesture-friendly interactions
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features

## Authentication Flow
- **Registration**: Phone-based registration with optional referrer ID from URL parameters
- **Login**: OTP-based authentication (currently using hardcoded OTP "123456" for development)
- **Session Management**: JWT-less approach using localStorage for client-side session persistence

## Referral Management System
- **Automatic Allocation**: Fair distribution system limiting each user to maximum 5 referrals
- **Earnings Tracking**: 50 THB per verified referral with total earnings calculation
- **Status Workflow**: Three-stage referral process (pending → verified → completed)

# External Dependencies

## Core Framework Dependencies
- **Neon Database**: Serverless PostgreSQL database provider (@neondatabase/serverless)
- **Drizzle Kit**: Database migrations and schema management tool
- **React Query**: Server state management and caching solution

## UI and Styling
- **Radix UI**: Headless UI component primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating type-safe component variants

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

## Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Fonts and Internationalization
- **Google Fonts**: Sarabun and Inter fonts for Thai and English text support
- **Thai Language Support**: Native Thai language interface and validation messages