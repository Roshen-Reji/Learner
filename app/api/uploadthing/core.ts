import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  notesUploader: f({ blob: { maxFileSize: "16MB" }, pdf: { maxFileSize: "16MB" }, image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error("Unauthorized");
      return { userId: (session.user as any).id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { fileUrl: file.url, fileKey: file.key };
    }),

  ieeeUploader: f({ image: { maxFileSize: "4MB" }, pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error("Unauthorized");
      return { userId: (session.user as any).id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const dbConnect = (await import("@/lib/db")).default;
      const User = (await import("@/models/User")).default;
      await dbConnect();
      await User.findByIdAndUpdate(metadata.userId, { 
        ieeeCardUrl: file.url,
        ieeeStatus: "none"
      });
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
