import { API } from "@/API/API";
import { ServiceDTO } from "@/API/NauthApi_gen";
import AdminLayout from "@/components/admin/AdminLayout";
import EditService from "@/components/admin/EditService";
import { GetServerSidePropsContext } from "next";

export default function EditServicePage({ _service }: { _service: ServiceDTO }) {
  return (
    <AdminLayout>
      <EditService _service={_service} />
    </AdminLayout>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const service = await API.SSR.Service.GetById({
    serviceId: ctx.params?.serviceId as string,
    token: ctx.req.cookies.nauth ?? "",
  });

  return {
    props: {
      _service: JSON.parse(JSON.stringify(service.response)),
    },
  };
};
