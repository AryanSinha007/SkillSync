-- Allows signed-out visitors to submit an unanswered-question suggestion.
-- Authenticated users continue to use the existing owner-only RLS policy.
-- Run in Supabase SQL Editor after the base chatbot tables have been created.

begin;
alter table public.chatbot_unanswered_queries
  alter column user_id drop not null;

drop policy if exists "Anonymous users submit unanswered questions"
  on public.chatbot_unanswered_queries;

create policy "Anonymous users submit unanswered questions"
  on public.chatbot_unanswered_queries
  for insert to anon
  with check (user_id is null and conversation_id is null);

grant insert on public.chatbot_unanswered_queries to anon;
commit;
