-- =============================================================================
-- EduKard seed data (idempotent). Run AFTER all migrations.
--   supabase db reset           (applies migrations + this seed locally)
--   or paste into the SQL editor on a hosted project.
-- =============================================================================

-- ---- Liquidity pools (the app expects exactly these two tranches) -----------
INSERT INTO liquidity_pools (tranche, total_capital, deployed_capital, available_capital, utilization_ratio, target_apy)
VALUES
  ('senior', 0, 0, 0, 0, 8),
  ('junior', 0, 0, 0, 0, 14)
ON CONFLICT (tranche) DO NOTHING;

-- ---- Designated Learning Institutions (Canadian DLI list) ------------------
-- slug matches src/lib/constants.ts so the apply flow can resolve UUID by slug.
INSERT INTO universities (slug, name, dli_number, province, city) VALUES
  ('uoft','University of Toronto','O19395067212','ON','Toronto'),
  ('ubc','University of British Columbia','O19279029902','BC','Vancouver'),
  ('mcgill','McGill University','O19359015732','QC','Montreal'),
  ('ualberta','University of Alberta','O19258921222','AB','Edmonton'),
  ('mcmaster','McMaster University','O19358994122','ON','Hamilton'),
  ('uwaterloo','University of Waterloo','O19395085252','ON','Waterloo'),
  ('wlu','Wilfrid Laurier University','O19395124392','ON','Waterloo'),
  ('western','Western University','O19395118032','ON','London'),
  ('queens','Queen''s University','O19359195142','ON','Kingston'),
  ('uottawa','University of Ottawa','O19395061652','ON','Ottawa'),
  ('ucalgary','University of Calgary','O19258922242','AB','Calgary'),
  ('dal','Dalhousie University','O19332403702','NS','Halifax'),
  ('umanitoba','University of Manitoba','O19350767172','MB','Winnipeg'),
  ('usask','University of Saskatchewan','O213817519807','SK','Saskatoon'),
  ('yorku','York University','O19395128542','ON','Toronto'),
  ('sfu','Simon Fraser University','O19279030972','BC','Burnaby'),
  ('uvic','University of Victoria','O19279032352','BC','Victoria'),
  ('guelph','University of Guelph','O19395037392','ON','Guelph'),
  ('carleton','Carleton University','O19358985802','ON','Ottawa'),
  ('ryerson','Toronto Metropolitan University','O19395064802','ON','Toronto'),
  ('concordia','Concordia University','O19359005302','QC','Montreal'),
  ('uregina','University of Regina','O213817520967','SK','Regina'),
  ('mun','Memorial University','O19339834562','NL','St. John''s'),
  ('unb','University of New Brunswick','O19338254612','NB','Fredericton'),
  ('seneca','Seneca College','O19376814302','ON','Toronto'),
  ('conestoga','Conestoga College','O110923467577','ON','Kitchener'),
  ('humber','Humber College','O19376816362','ON','Toronto'),
  ('georgebrown','George Brown College','O19376432342','ON','Toronto'),
  ('centennial','Centennial College','O19376374662','ON','Toronto'),
  ('bcit','British Columbia Institute of Technology','O19279018232','BC','Burnaby')
ON CONFLICT (dli_number) DO UPDATE SET slug = EXCLUDED.slug;
