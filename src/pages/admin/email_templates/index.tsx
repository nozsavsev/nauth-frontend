import { API } from "@/API/API";
import { EmailTemplateDTO } from "@/API/NauthApi_gen";
import AdminLayout from "@/components/admin/AdminLayout";
import { EmailTemplatesAdminTab } from "@/components/admin/EmailTemplates";
import { GetServerSidePropsContext } from "next";

export default function EmailTemplatesPage({ _templates }: { _templates: EmailTemplateDTO[] }) {
  return (
    <AdminLayout>
      <EmailTemplatesAdminTab _templates={_templates || []} />
    </AdminLayout>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const templates = await API.SSR.EmailTemplates.GetAll({
    token: ctx.req.cookies.nauth ?? "",
  });

  return {
    props: {
      _templates: JSON.parse(JSON.stringify(templates.response)),
    },
  };
};
