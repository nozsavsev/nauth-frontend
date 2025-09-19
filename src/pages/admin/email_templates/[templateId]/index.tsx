import { API } from "@/API/API";
import { EmailTemplateDTO } from "@/API/NauthApi_gen";
import AdminLayout from "@/components/admin/AdminLayout";
import { EditEmailTemplateAdminTab } from "@/components/admin/EditEmailTemplate";
import { GetServerSidePropsContext } from "next";

export default function EmailTemplatesPage({ _template }: { _template: EmailTemplateDTO }) {
  return (
    <AdminLayout>
      <EditEmailTemplateAdminTab _template={_template || []} />
    </AdminLayout>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const templates = await API.SSR.EmailTemplates.GetById({
    id: ctx.params?.templateId as string,
    token: ctx.req.cookies.nauth ?? "",
  });

  return {
    props: {
      _template: JSON.parse(JSON.stringify(templates.response)),
    },
  };
};
