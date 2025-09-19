import { API } from "@/API/API";
import { EmailTemplateDTO, EmailTemplateType } from "@/API/NauthApi_gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import router from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export const EditEmailTemplateAdminTab = ({ _template }: { _template: EmailTemplateDTO }) => {
  const [template, setTemplate] = useState<EmailTemplateDTO>(_template);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await API.Client.EmailTemplates.Update({ emailTemplateDTO: template });
    if (res.status === "Ok") {
      toast.success("Template saved successfully");
    } else {
      toast.error("Failed to save template");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await API.Client.EmailTemplates.Delete({ id: template.id! });
    if (res.status === "Ok") {
      toast.success("Template deleted successfully");
      router.push("/admin/email_templates");
    } else {
      toast.error("Failed to delete template");
    }
    setIsDeleting(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Edit Email Template</h1>
      <div className="mt-4 space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={template.name ?? ""} onChange={(e) => setTemplate({ ...template, name: e.target.value })} />
        </div>
        <div>
          <Label>Type</Label>
          <select
            value={template.type}
            onChange={(e) => setTemplate({ ...template, type: e.target.value as EmailTemplateType })}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {Object.values(EmailTemplateType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={template.subject ?? ""} onChange={(e) => setTemplate({ ...template, subject: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            value={template.body ?? ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplate({ ...template, body: e.target.value })}
            rows={10}
          />
        </div>
        <div>
          <Label htmlFor="htmlBody">HTML Body</Label>
          <Textarea
            id="htmlBody"
            value={template.htmlBody ?? ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplate({ ...template, htmlBody: e.target.value })}
            rows={10}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={template.isActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplate({ ...template, isActive: e.target.checked })}
            id="isActive"
          />
          <Label htmlFor="isActive">Is Active</Label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} className="mt-4" disabled={isSaving}>
          Save
        </Button>

        <Button variant="destructive" onClick={handleDelete} className="mt-4" disabled={isDeleting}>
          Delete
        </Button>
      </div>
    </div>
  );
};
