import { API } from "@/API/API";
import { ServiceDTO } from "@/API/NauthApi_gen";
import AdminLayout from "@/components/admin/AdminLayout";
import Services from "@/components/admin/Services";
import { GetServerSidePropsContext } from "next";

export default function ServicesPage({ _services }: { _services: ServiceDTO[] }) {
  return (
    <AdminLayout>
      <Services _services={_services} global={true} />
    </AdminLayout>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const services = await API.SSR.Service.GetAllGlobal({
    token: ctx.req.cookies.nauth ?? "",
  });

  console.log(services);

  return {
    props: {
      _services: JSON.parse(JSON.stringify(services.response)),
    },
  };
};
