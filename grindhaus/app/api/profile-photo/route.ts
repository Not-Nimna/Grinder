import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "You must be signed in to upload a profile photo." }, { status: 401 });
    }

    const supabase = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session. Sign in again before uploading." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file first." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Profile photo must be an image." }, { status: 400 });
    }

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: "Profile photo must be smaller than 3 MB." }, { status: 400 });
    }

    const cloudName = getEnv("cloudinary_CLOUD_NAME");
    const apiKey = getEnv("cloudinary_API_Key");
    const apiSecret = getEnv("cloudinary_API_Secret");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "grindhaus/profile-photos";
    const publicId = user.id;
    const uploadParams = {
      folder,
      public_id: publicId,
      timestamp,
      overwrite: "true",
    };
    const signature = signCloudinaryParams(uploadParams, apiSecret);
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
    const cloudinaryFormData = new FormData();

    cloudinaryFormData.set("file", dataUri);
    cloudinaryFormData.set("api_key", apiKey);
    cloudinaryFormData.set("folder", folder);
    cloudinaryFormData.set("public_id", publicId);
    cloudinaryFormData.set("timestamp", timestamp);
    cloudinaryFormData.set("overwrite", "true");
    cloudinaryFormData.set("signature", signature);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    });
    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: uploadResult.error?.message || "Cloudinary upload failed." },
        { status: uploadResponse.status },
      );
    }

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload profile photo." },
      { status: 500 },
    );
  }
}
