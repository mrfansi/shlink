import Image from "next/image";
import { getSession } from "@/lib/auth-server";
import { UserMenu } from "@/components/auth/user-menu";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await getSession();
	
	if (!session?.user) {
		redirect("/sign-in");
	}

	return (
		<div className="font-sans min-h-screen">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={120} height={25} priority />
					</div>
					<UserMenu user={session.user} />
				</div>
			</header>
			
			<main className="container mx-auto px-4 py-8">
				<div className="max-w-2xl">
					<h1 className="text-3xl font-bold mb-4">Welcome, {session.user.name}!</h1>
					<p className="text-muted-foreground mb-8">
						You are successfully authenticated. This page is protected and only accessible to signed-in users.
					</p>
					
					<div className="bg-muted p-6 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">Your Account</h2>
						<dl className="space-y-2">
							<div>
								<dt className="text-sm font-medium text-muted-foreground">Name</dt>
								<dd className="text-base">{session.user.name}</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-muted-foreground">Email</dt>
								<dd className="text-base">{session.user.email}</dd>
							</div>
						</dl>
					</div>
				</div>
			</main>
		</div>
	);
}
