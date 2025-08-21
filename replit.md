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
- 2025-01-21: Started migration from Bolt to Replit
- 2025-01-21: Created PostgreSQL database and installed Stripe package
- 2025-01-21: Migration in progress - need to update routing and database integration

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