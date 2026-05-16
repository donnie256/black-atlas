-- Seed data for Black Atlas Denver — run in Supabase SQL Editor after the migration

insert into businesses (
  slug, name, description, category, subcategory, diaspora_origin,
  address, city, state, zip, neighborhood_id,
  phone, website, instagram,
  status, is_verified, is_featured
) values
(
  'uncle-ms-kitchen',
  'Uncle M''s Kitchen',
  'Soul food and Southern comfort cooking in the heart of Five Points. Known for their fried chicken, oxtails, and sweet potato pie.',
  'restaurant', 'Soul Food', '{african_american}',
  '2500 Welton St', 'Denver', 'CO', '80205',
  (select id from neighborhoods where slug = 'five-points'),
  '(720) 555-0101', null, 'unclemskitchen',
  'approved', true, true
),
(
  'fade-masters-barbershop',
  'Fade Masters Barbershop',
  'Premier cuts, lineups, and fades for the culture. Walk-ins welcome, appointments preferred.',
  'barbershop', null, '{african_american, caribbean}',
  '3201 Colorado Blvd', 'Denver', 'CO', '80207',
  (select id from neighborhoods where slug = 'park-hill'),
  '(720) 555-0202', null, 'fademasters_denver',
  'approved', true, false
),
(
  'calabash-afro-caribbean-restaurant',
  'Calabash Afro-Caribbean Restaurant',
  'Authentic West African and Caribbean dishes — jollof rice, fufu, jerk chicken, and oxtail stew. Dine-in and takeout.',
  'restaurant', 'African & Caribbean', '{african, caribbean}',
  '780 S Colorado Blvd', 'Denver', 'CO', '80246',
  (select id from neighborhoods where slug = 'other'),
  '(303) 555-0303', null, 'calabashdenver',
  'approved', false, false
),
(
  'black-threads-thrift',
  'Black Threads Thrift',
  'Curated vintage and secondhand clothing with an eye for Black style and culture. New arrivals every week.',
  'thrift', null, '{african_american}',
  '4800 Peoria St', 'Denver', 'CO', '80239',
  (select id from neighborhoods where slug = 'montbello'),
  '(720) 555-0404', null, 'blackthrifts_denver',
  'approved', false, false
);
