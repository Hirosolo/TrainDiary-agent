-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.exercises (
  exercise_id integer NOT NULL DEFAULT nextval('exercises_exercise_id_seq'::regclass),
  name character varying NOT NULL,
  category character varying,
  default_sets integer,
  default_reps integer,
  description text,
  target_muscle_group character varying,
  difficulty_factor real DEFAULT 1.0,
  CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id)
);
CREATE TABLE public.foods (
  food_id integer NOT NULL DEFAULT nextval('foods_food_id_seq'::regclass),
  name character varying NOT NULL,
  calories_per_serving real NOT NULL,
  protein_per_serving real NOT NULL,
  carbs_per_serving real NOT NULL,
  fat_per_serving real NOT NULL,
  serving_type character varying NOT NULL,
  image character varying,
  fibers_per_serving numeric DEFAULT 0,
  sugars_per_serving numeric DEFAULT 0,
  zincs_per_serving numeric DEFAULT 0,
  magnesiums_per_serving numeric DEFAULT 0,
  calciums_per_serving numeric DEFAULT 0,
  irons_per_serving numeric DEFAULT 0,
  vitamin_a_per_serving numeric DEFAULT 0,
  vitamin_c_per_serving numeric DEFAULT 0,
  vitamin_b12_per_serving numeric DEFAULT 0,
  vitamin_d_per_serving numeric DEFAULT 0,
  CONSTRAINT foods_pkey PRIMARY KEY (food_id)
);
CREATE TABLE public.nutrition_goals (
  goal_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id integer NOT NULL,
  calories_target integer,
  protein_target_g integer,
  carbs_target_g integer,
  fat_target_g integer,
  fiber_target_g integer,
  hydration_target_ml integer,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT nutrition_goals_pkey PRIMARY KEY (goal_id),
  CONSTRAINT nutrition_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.personal_records (
  record_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id integer NOT NULL,
  exercise_id integer NOT NULL,
  weight_kg real NOT NULL,
  achieved_at timestamp with time zone DEFAULT now(),
  CONSTRAINT personal_records_pkey PRIMARY KEY (record_id),
  CONSTRAINT personal_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT personal_records_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id)
);
CREATE TABLE public.plan_day_exercises (
  plan_day_exercise_id integer NOT NULL DEFAULT nextval('plan_day_exercises_plan_day_exercise_id_seq'::regclass),
  plan_day_id integer NOT NULL,
  exercise_id integer NOT NULL,
  sets integer,
  reps integer,
  CONSTRAINT plan_day_exercises_pkey PRIMARY KEY (plan_day_exercise_id),
  CONSTRAINT plan_day_exercises_plan_day_id_fkey FOREIGN KEY (plan_day_id) REFERENCES public.plan_days(plan_day_id),
  CONSTRAINT plan_day_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id)
);
CREATE TABLE public.plan_days (
  plan_day_id integer NOT NULL DEFAULT nextval('plan_days_plan_day_id_seq'::regclass),
  plan_id integer NOT NULL,
  day_number integer NOT NULL,
  day_type character varying,
  CONSTRAINT plan_days_pkey PRIMARY KEY (plan_day_id),
  CONSTRAINT plan_days_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.workout_plans(plan_id)
);
CREATE TABLE public.session_details (
  session_detail_id integer NOT NULL DEFAULT nextval('session_details_session_detail_id_seq'::regclass),
  session_id integer NOT NULL,
  exercise_id integer NOT NULL,
  status text,
  CONSTRAINT session_details_pkey PRIMARY KEY (session_detail_id),
  CONSTRAINT session_details_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.workout_sessions(session_id),
  CONSTRAINT session_details_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id)
);
CREATE TABLE public.sessions_exercise_details (
  set_id integer NOT NULL DEFAULT nextval('exercise_logs_log_id_seq'::regclass),
  session_detail_id integer NOT NULL,
  reps integer NOT NULL,
  weight_kg real,
  notes text,
  status text NOT NULL,
  CONSTRAINT sessions_exercise_details_pkey PRIMARY KEY (set_id),
  CONSTRAINT exercise_logs_session_detail_id_fkey FOREIGN KEY (session_detail_id) REFERENCES public.session_details(session_detail_id)
);
CREATE TABLE public.user_meal_details (
  meal_detail_id integer NOT NULL DEFAULT nextval('user_meal_details_meal_detail_id_seq'::regclass),
  meal_id integer NOT NULL,
  food_id integer NOT NULL,
  numbers_of_serving real NOT NULL,
  CONSTRAINT user_meal_details_pkey PRIMARY KEY (meal_detail_id),
  CONSTRAINT user_meal_details_meal_id_fkey FOREIGN KEY (meal_id) REFERENCES public.user_meals(meal_id),
  CONSTRAINT user_meal_details_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(food_id)
);
CREATE TABLE public.user_meals (
  meal_id integer NOT NULL DEFAULT nextval('user_meals_meal_id_seq'::regclass),
  user_id integer NOT NULL,
  meal_type character varying NOT NULL,
  log_date date NOT NULL,
  CONSTRAINT user_meals_pkey PRIMARY KEY (meal_id),
  CONSTRAINT user_meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.user_progress_summary (
  summary_id integer NOT NULL DEFAULT nextval('user_progress_summary_summary_id_seq'::regclass),
  user_id integer NOT NULL,
  period_type character varying NOT NULL CHECK (period_type::text = ANY (ARRAY['weekly'::character varying, 'monthly'::character varying]::text[])),
  period_start date NOT NULL,
  total_workouts integer DEFAULT 0,
  total_calories_burned real DEFAULT 0,
  avg_duration_minutes real DEFAULT 0,
  total_calories_intake real DEFAULT 0,
  avg_protein real DEFAULT 0,
  avg_carbs real DEFAULT 0,
  avg_fat real DEFAULT 0,
  CONSTRAINT user_progress_summary_pkey PRIMARY KEY (summary_id),
  CONSTRAINT user_progress_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  username character varying,
  phone_number text UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.workout_plans (
  plan_id integer NOT NULL DEFAULT nextval('workout_plans_plan_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  CONSTRAINT workout_plans_pkey PRIMARY KEY (plan_id)
);
CREATE TABLE public.workout_sessions (
  session_id integer NOT NULL DEFAULT nextval('workout_sessions_session_id_seq'::regclass),
  user_id integer NOT NULL,
  scheduled_date date NOT NULL,
  type character varying,
  notes text,
  status text NOT NULL,
  gr_score integer,
  CONSTRAINT workout_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT workout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);