-- Phase 1 onboarding extension
-- Run this after 001_phase1_auth.sql

alter table public.profiles
add column if not exists onboarding_completed boolean not null default false;
