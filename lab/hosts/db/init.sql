create table if not exists lab_notes (
  id integer primary key,
  slug text not null,
  body text not null
);

insert into lab_notes (id, slug, body) values
  (1, 'welcome', 'PostgreSQL is reachable at 10.77.0.30 inside the shell lab.'),
  (2, 'api', 'The PHP web host can query this database when the db profile is running.')
on conflict (id) do update set
  slug = excluded.slug,
  body = excluded.body;
