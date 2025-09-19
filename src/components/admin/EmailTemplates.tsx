import { API } from "@/API/API";
import { EmailTemplateDTO, EmailTemplateType } from "@/API/NauthApi_gen";
import useEmailTemplates from "@/hooks/useEmailTemplates";
import { Pencil } from "lucide-react";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

const TemplateTypeColors: { [key in EmailTemplateType]: string } = {
  [EmailTemplateType.VerifyEmail]: "bg-blue-200",
  [EmailTemplateType.PasswordReset]: "bg-green-200",
  [EmailTemplateType.EmailCode]: "bg-yellow-200",
  [EmailTemplateType.EmailSignIn]: "bg-purple-200",
  [EmailTemplateType.DeleteAccount]: "bg-red-200",
  [EmailTemplateType.ChangeEmail]: "bg-orange-200",
};

export const EmailTemplatesAdminTab = ({ _templates }: { _templates: EmailTemplateDTO[] }) => {
  const { emailTemplates, refresh } = useEmailTemplates({ initialEmailTemplates: _templates });

  const groupedTemplates = emailTemplates.reduce(
    (acc, template) => {
      const type = template.type ?? "Uncategorized";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(template);
      return acc;
    },
    {} as Record<string, EmailTemplateDTO[]>,
  );

  return (
    <>
      <ProtalClient />
      <div className="flex flex-wrap">
        {Object.entries(groupedTemplates)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([type, templates]) => (
            <div key={type}>
              <h2 className="mt-4 text-xl font-semibold">{type}</h2>
              <div className="flex flex-wrap">
                {templates
                  .toSorted((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
                  .map((template) => (
                    <TemplateCard key={template.id} template={template} refresh={refresh} />
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

function TemplateCard({ template, refresh }: { template: EmailTemplateDTO; refresh: () => void }) {
  return (
    <div className="m-4 flex w-96 items-center justify-between gap-2 rounded-lg border p-4">
      <Link target="_blank" href={`/admin/email_templates/${template.id}`} className="rounded-md text-sm font-semibold">
        <Pencil className="h-5 w-5" />
      </Link>
      <div>
        <div className="flex items-center gap-2 text-lg font-semibold">
          {template.name}
          <div className={` ${TemplateTypeColors[template.type!]} w-fit rounded-full px-1.5 py-0.5 text-sm font-medium`}>{template.type}</div>
        </div>
        <div className="truncate">{template.subject}</div>
      </div>

      <div className="flex items-center gap-4">
        <Switch
          checked={template.isActive}
          onCheckedChange={async (state) => {
            var res = await API.Client.EmailTemplates.Update({
              emailTemplateDTO: {
                ...template,
                isActive: state,
              },
            });

            if (res.status === "Ok") {
              toast.success("Template updated");
              refresh();
            } else {
              toast.error("Something went wrong");
            }
          }}
        />
      </div>
    </div>
  );
}

function ProtalClient() {
  const [mounted, setMounted] = useState(false);

  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true); // Indicate that the component is mounted on the client
    setElement(document.getElementById("navbar-search-portal") as HTMLElement);
    return () => setMounted(false);
  }, []);

  if (!mounted || !element) {
    return null; // Don't render the portal until mounted
  }

  return createPortal(
    <div className="flex h-full w-full items-center justify-center">
      <Button
        onClick={async () => {
          var res = await API.Client.EmailTemplates.Create({
            createEmailTemplateDTO: {
              name: "New Template",
              subject: "New Template",
              body: "New Template",
              type: EmailTemplateType.VerifyEmail,
              isActive: false,
            },
          });
          if (res.status === "Ok" && res.response) {
            router.push(`/admin/email_templates/${res.response.id}`);
            toast.success("Template created");
          } else {
            toast.error("Something went wrong");
          }
        }}
      >
        New Template
      </Button>
    </div>,
    element!,
  );
}
