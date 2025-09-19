import { Menu, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Fragment } from "react";

import { API } from "@/API/API";
import { UserDTO } from "@/API/NauthApi_gen";
import useUser from "@/hooks/useUser";
import { GoogleOAuthProvider, useGoogleOneTapLogin } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { BiLogOut } from "react-icons/bi";
import { FiShield, FiUser } from "react-icons/fi";

const UserMenu = ({ mobile }: { mobile?: boolean }) => {
  const router = useRouter();

  const { user, refresh } = useUser();

  if (user) {
    return (
      <div className="relative flex shrink-0 items-center justify-center ltr:ml-4 rtl:mr-4">
        <DropMenu user={user} refresh={refresh} />
      </div>
    );
  } else {
    return (
      <>
        <GoogleProviderWraper />
        <div className="mx-4 flex shrink-0 items-center justify-center">
          <Link className="pr-1 font-semibold" href={`/auth/register?redirect=${router.asPath}`}>
            {"Register"} /
          </Link>

          <Link href={`/auth/login?redirect=${router.asPath}`} className="font-semibold">
            {"Login"}
          </Link>
        </div>
      </>
    );
  }
};

const GoogleProviderWraper = () => {
  return (
    <GoogleOAuthProvider clientId="27550983296-dcl4c3pafiicjt79gudl4ql81imu37lr.apps.googleusercontent.com">
      <GooglePopupLoginElement />
    </GoogleOAuthProvider>
  );
};

const GooglePopupLoginElement = () => {
  const router = useRouter();

  const { refresh } = useUser();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      await API.Client.User.ContinueWithGoogle({
        googleAccessToken: credentialResponse.credential,
      }).then(async (res) => {
        console.log(res);
        if (res.status == "Ok") {
          await refresh();
        }
      });
    },
    onError: () => {},
  });

  return <div />;
};

const DropMenu = ({ user, onClick, refresh }: { user: UserDTO; onClick?: () => void; refresh: () => void }) => {
  return (
    <div className="z-20 shrink-0 text-right">
      <Menu as="div" className="relative inline-block">
        <Menu.Button className="h-full overflow-hidden rounded-xl border-2 border-black">
          <Image
            loading="lazy"
            alt="user avatar"
            src={(user?.avatarURL?.length ?? 0 > 0) ? user!.avatarURL! : "https://nauth-avatars.s3.eu-north-1.amazonaws.com/avatar/default.png"}
            width={50}
            height={50}
            className="rounded-lg"
          />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            onClick={onClick}
            className="absolute right-0 z-50 mt-4 w-56 divide-y divide-gray-100 rounded-md border bg-white pl-0 shadow-lg outline-none"
          >
            <div className="px-1 py-1">
              <Menu.Item>
                <div className={`my-2 flex items-center justify-center text-lg font-semibold text-black dark:text-slate-300`}>
                  <div className="">{"Hi"}&nbsp;</div>

                  <div>{user?.name || user?.email?.split("@")[0]}</div>

                  <div>!</div>
                </div>
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/account`}
                    className={`${
                      active ? "bg-black font-semibold text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <FiUser className={`mx-2`} height={24} width={24} />
                    {"My account"}
                  </Link>
                )}
              </Menu.Item>
            </div>

            <div hidden={(user.permissions?.length ?? 0) === 0} className={`px-1 py-1 ${true ? "" : "hidden"}`}>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/admin/`}
                    className={`${
                      active ? "bg-black font-semibold text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <FiShield className={`mx-2`} height={24} width={24} />
                    {"Admin panel"}
                  </Link>
                )}
              </Menu.Item>
            </div>

            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {
                      API.Client.Session.Revoke({}).then((res) => {
                        refresh();
                      });
                    }}
                    className={`${
                      active ? "bg-black font-semibold text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <BiLogOut className={`mx-2`} height={24} width={24} />

                    {"Log out"}
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default UserMenu;
