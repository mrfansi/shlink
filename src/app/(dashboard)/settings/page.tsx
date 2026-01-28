import { ApiKeyManager } from "@/components/features/api-key-manager";
import { listApiKeys } from "@/app/actions/api-keys";
import { BulkUploader } from "@/components/features/bulk-uploader";

export default async function SettingsPage() {
    const keys = await listApiKeys();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings & Tools</h1>
                <p className="text-muted-foreground">Manage your account settings, API keys, and bulk tools.</p>
            </div>
            
            <ApiKeyManager keys={keys} />
            <BulkUploader />
        </div>
    );
}
