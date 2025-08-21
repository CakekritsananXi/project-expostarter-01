# ContentFlow - Content Planning Platform

## Project Overview
A modern content planning platform migrated from Bolt to Replit. The application helps users plan, organize, and manage their content strategy with features including ideation, calendar planning, analytics, and team collaboration.

## Architecture
- **Frontend**: React with TypeScript, using Wouter for routing
- **Backend**: Express.js server with TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Payments**: Stripe integration for subscription management

## Current Migration Status
Migrating from Bolt to Replit environment:
- From React Router Dom → Wouter (Replit standard)
- From Supabase → Neon PostgreSQL + Drizzle
- From Supabase Edge Functions → Express.js API routes
- Implementing proper client/server separation for security

## User Preferences
- None specified yet

## Recent Changes
- 2025-08-21: Successfully completed migration from Bolt to Replit
- 2025-08-21: Migrated from React Router Dom to Wouter for Replit compatibility
- 2025-08-21: Migrated from Supabase to Neon PostgreSQL with Drizzle ORM
- 2025-08-21: Ported Supabase Edge Functions to Express API routes
- 2025-08-21: Implemented JWT-based authentication system
- 2025-08-21: Set up secure Stripe payment processing with API key protection
- 2025-08-21: Added comprehensive database schema supporting users, sessions, and Stripe integration
- 2025-08-21: Fixed Tailwind CSS configuration with custom colors and shadows

## Features
- User authentication
- Dashboard with content metrics
- Content planning and ideation
- Editorial calendar
- Content library management
- Analytics and reporting
- Team collaboration
- Stripe subscription integration

## Tech Stack
- React + TypeScript
- Express.js
- Neon PostgreSQL
- Drizzle ORM
- Tailwind CSS + shadcn/ui
- Stripe
- Wouter (routing)