-- Create tables
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'driver'::"text",
    "full_name" "text",
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "admin_user_id" "uuid" DEFAULT "auth"."uid"(),
    "title" "text",
    "description" "text",
    "youtube_url" "text",
    "category" character varying,
    "duration" character varying,
    "is_annual_renewal" boolean DEFAULT false NOT NULL,
    CONSTRAINT "videos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "videos_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "public"."users_videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user" "uuid" DEFAULT "gen_random_uuid"(),
    "video" "uuid" DEFAULT "gen_random_uuid"(),
    "is_completed" boolean DEFAULT false,
    "last_watched" timestamp with time zone,
    "completed_date" timestamp with time zone,
    "modified_date" timestamp with time zone,
    "last_action" "text",
    "assigned_date" timestamp with time zone,
    CONSTRAINT "user_videos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_videos_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE SET NULL,
    CONSTRAINT "users_videos_video_fkey" FOREIGN KEY ("video") REFERENCES "public"."videos"("id")
);

-- Enable Row Level Security
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users_videos" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated can access users" ON "public"."users" USING (("auth"."role"() = 'authenticated'::"text"));
CREATE POLICY "Authenticated can access videos" ON "public"."videos" USING (("auth"."role"() = 'authenticated'::"text"));
CREATE POLICY "Authenticated can access users_videos" ON "public"."users_videos" USING (("auth"."role"() = 'authenticated'::"text"));

-- Grant permissions
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role"; 