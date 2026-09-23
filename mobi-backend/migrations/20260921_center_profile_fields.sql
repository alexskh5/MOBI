alter table centers
  add column if not exists center_owner_phone text,
  add column if not exists center_owner_email text,
  add column if not exists contact_person_phone text,
  add column if not exists contact_person_email text,
  add column if not exists center_website text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists postal_code text,
  add column if not exists about text;
