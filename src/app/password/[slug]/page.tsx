import { PasswordForm } from "@/components/features/password-form";

export default function PasswordPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50/50 p-4">
       <PasswordForm slug={slug} />
    </div>
  );
}
