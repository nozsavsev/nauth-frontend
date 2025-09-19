import { API } from "@/API/API";
import { PermissionDTO, UserDTO } from "@/API/NauthApi_gen";
import usePermissions from "@/hooks/usePermissions";
import { isAnyAdmin } from "@/lib/isAnyAdmin";
import { Dialog, Menu, Transition } from "@headlessui/react";
import _ from "lodash";
import { LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dispatch, Fragment, SetStateAction, useEffect, useRef, useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { CgLastpass, CgUnblock, CgUserRemove } from "react-icons/cg";
import { FiEdit3, FiShield } from "react-icons/fi";
import { GiHammerDrop } from "react-icons/gi";
import { GrValidate } from "react-icons/gr";
import { TbReload } from "react-icons/tb";
import { TiDeleteOutline } from "react-icons/ti";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";
import CModal from "../misc/CModal";

export const UsersAdminTab = ({ _users, _permissions }: { _users: UserDTO[]; _permissions: PermissionDTO[] }) => {
  const router = useRouter();

  const [value, setValue] = useState<string>("");

  const [users, setUsers] = useState<UserDTO[]>(_users);
  const [emptySearchResults, setEmptySearchResults] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const { permissions, refresh } = usePermissions({ initialPermissions: _permissions });

  return (
    <>
      <InfiniteScroll
        className={"flex flex-1 flex-wrap items-center justify-center rounded-xl"}
        dataLength={users.length}
        next={() => {
          API.Client.UserManagement.GetAllUsers({
            skip: users.length,
            take: 10,
            match: value,
          }).then((res) => {
            if (res.status === "Ok") {
              if ((res.response as UserDTO[]).length === 0) {
                setHasMore(false);
                setEmptySearchResults(true);
              } else setUsers([...users, ...(res.response as UserDTO[])]);
            }
          });
        }}
        hasMore={hasMore}
        loader={
          <div className="mt-8 mb-8 flex w-full shrink-0 flex-col items-center justify-center">
            {emptySearchResults ? (
              <div className="text-black-300 mt-4 text-xl font-semibold">Nothing found</div>
            ) : (
              <>
                <LoaderCircleIcon className="mr-2 h-7 w-7 animate-spin" />

                <div className="mt-4 text-xl font-semibold text-neutral-300">One moment please</div>
              </>
            )}
          </div>
        }
      >
        {users
          ?.sort((a: any, b: any) => {
            return a.id > b.id ? 1 : -1;
          })
          ?.map((u, i) => (
            <UserControl
              key={i}
              user={u}
              refetch={async () => {
                await API.Client.UserManagement.GetAllUsers({
                  skip: 0,
                  take: users.length,
                  match: value,
                }).then((res) => {
                  setUsers(res.response || []);
                });
              }}
              permissions={permissions}
              refreshPermissions={refresh}
            />
          ))}

        <div className="h-[60vh] w-[70vw]" />
      </InfiniteScroll>
    </>
  );
};

const UserDropdownMenu = ({
  user,
  refetch,
  permissions,
  refreshPermissions,
}: {
  user: UserDTO;
  refetch: any;
  permissions: PermissionDTO[];
  refreshPermissions: any;
}) => {
  const deleteUserRef = useRef<any>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [localUser, setLocalUser] = useState<UserDTO>(user);

  const [touched, setTouched] = useState<boolean>(false);

  const [animationClassName, setAnimationClassName] = useState<string>("");

  function shake() {
    setAnimationClassName("shake");
    setTimeout(() => {
      setAnimationClassName("");
    }, 1000);
  }

  useEffect(() => {
    setLocalUser(user);
    setTouched(false);
  }, [user]);

  useEffect(() => {
    if (_.isEqual(user, localUser)) setTouched(false);
  }, [localUser]);

  function setLocaluserReportData(args: any) {
    setLocalUser({ ...args });
    setTouched(true);
  }

  return (
    <>
      {isOpen && (
        <>
          <Transition appear show={isOpen} as={Fragment}>
            <Dialog
              as="div"
              className={`relative z-20`}
              onClose={() => {
                if (!touched) setIsOpen(false);
                else {
                  toast.warning("Save or discard changes first!", { autoClose: 500 });
                  shake();
                }
              }}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className={`fixed inset-0 ${touched ? "bg-amber-900/20" : "bg-black/20"} bg-opacity-25 transition-colors duration-300`} />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel
                      className={`relative w-fit transform rounded-2xl bg-white ${animationClassName} p-4 text-left align-middle shadow-xl transition-all`}
                    >
                      <div className="absolute top-4 right-4 flex h-7 text-sm font-semibold">
                        <button
                          onClick={async () => {
                            const nameChanged = localUser.name !== user.name;
                            const permissionsChanged = localUser.permissions !== user.permissions;

                            let success = false;

                            if (nameChanged) {
                              const res = await API.Client.UserManagement.UpdateUserName({
                                adminUpdateUserNameDTO: {
                                  id: localUser.id,
                                  name: localUser.name,
                                },
                              });
                              if (res.status === "Ok") {
                                toast.success("User name updated");
                                success = true;
                              } else {
                                toast.error("Something went wrong updating user name");
                              }
                            }

                            if (permissionsChanged) {
                              //@ts-ignore
                              window.noRedirects = true;

                              const res = await API.Client.UserManagement.UpdatePermissions({
                                userDTO: {
                                  ...localUser,
                                  emailActions: undefined,
                                  sessions: undefined,
                                  services: undefined,
                                  twoFactorAuthEntries: undefined,
                                  permissions: localUser.permissions?.map((p) => {
                                    return { ...p, permission: null as any };
                                  }),
                                },
                              });

                              if (res.status === "Ok") {
                                toast.success("User permissions updated");
                                success = true;
                              } else {
                                console.log(res);
                                toast.error("Something went wrong updating user permissions.");
                              }
                            }

                            if (success) {
                              refetch();
                              setTouched(false);
                            }
                          }}
                          className={` ${
                            touched ? "rounded-full border-2 bg-white hover:border-green-800 hover:bg-green-100" : "hidden"
                          } mr-2 flex w-fit items-center justify-center px-3 transition-all duration-300`}
                        >
                          Save changes
                        </button>

                        <button
                          onClick={() => {
                            refetch();
                          }}
                          className={`flex w-fit items-center justify-center`}
                        >
                          <TbReload className="text-xl" />
                        </button>
                      </div>
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        <div className="mx-2 flex h-12 w-full items-center justify-start">
                          <Image
                            src={localUser.avatarURL ?? "https://nauth-avatars.s3.eu-north-1.amazonaws.com/avatar/default.png"}
                            height={48}
                            width={48}
                            className="rounded-full"
                            alt="user avatar"
                          />
                          <div className="ml-4 flex flex-col items-start justify-center">
                            <div className="flex items-center justify-start">
                              <FiShield className={`mr-1 inline-block text-lg ${!isAnyAdmin(localUser) && "hidden"}`} />
                              <UserNameEditor user={localUser} setUser={setLocaluserReportData} refetch={refetch} />
                            </div>
                            <div className="text-base font-normal text-neutral-700">{user.email}</div>
                          </div>
                        </div>

                        <div className="h-20 w-128">
                          <UserQuickTags user={localUser} />
                        </div>
                      </Dialog.Title>
                      <div className="relative mb-2 flex h-[28rem] w-[34rem] flex-col">
                        <UserPermissionManager
                          setUser={setLocaluserReportData}
                          user={localUser}
                          refetch={refetch}
                          permissions={permissions}
                          refreshPermissions={refreshPermissions}
                        />
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}

      <Menu as="div" className="text-left">
        <div>
          <Menu.Button className="absolute top-4 right-4">
            <BsList className="text-xl" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute top-10 right-4 z-50 mt-2 w-52 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      setIsOpen(true);
                    }}
                    className={`${
                      active ? "bg-green-600 font-semibold text-white" : "bg-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-black`}
                  >
                    {active ? (
                      <FiEdit3 style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                    ) : (
                      <FiEdit3 style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                    )}
                    Edit
                  </button>
                )}
              </Menu.Item>
            </div>

            <div className="px-1 py-1">
              <div>Instant actions</div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      if (user?.isEmailVerified) {
                        const toastId = toast.loading("Invalidating email...");

                        await API.Client.UserManagement.ForceUnVerifyEmail({ id: user.id! }).then((res) => {
                          if (res.status === "Ok") {
                            toast.update(toastId, { type: "success", render: "Email invalidated", isLoading: false, autoClose: 1000 });
                            refetch();
                          } else toast.update(toastId, { type: "error", render: "Something went wrong", isLoading: false, autoClose: 4000 });
                        });
                      } else {
                        const toastId = toast.loading("Force verifing email...");

                        await API.Client.UserManagement.ForceVerifyEmail({ id: user.id! }).then((res) => {
                          if (res.status === "Ok") {
                            toast.update(toastId, { type: "success", render: "Force verified email", isLoading: false, autoClose: 1000 });
                            refetch();
                          } else toast.update(toastId, { type: "error", render: "Something went wrong", isLoading: false, autoClose: 4000 });
                        });
                      }
                    }}
                    className={`${
                      active ? "bg-green-600 font-semibold text-white" : "bg-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-black`}
                  >
                    {user?.isEmailVerified ? (
                      <>
                        {active ? (
                          <AiOutlineMail style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        ) : (
                          <AiOutlineMail style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        )}
                        Invalidate email
                      </>
                    ) : (
                      <>
                        {active ? (
                          <GrValidate style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        ) : (
                          <GrValidate style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        )}
                        Force verify email
                      </>
                    )}
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      if (!user.isEnabled) {
                        const toastId = toast.loading("Unbanning user...");

                        await API.Client.UserManagement.EnableUser({ id: user.id! }).then((res) => {
                          if (res.status === "Ok") {
                            toast.update(toastId, { type: "success", render: "Used unbanned", isLoading: false, autoClose: 1000 });
                            refetch();
                          } else toast.update(toastId, { type: "error", render: "Something went wrong", isLoading: false, autoClose: 4000 });
                        });
                      } else {
                        const toastId = toast.loading("Banning user...");

                        await API.Client.UserManagement.DisableUser({ id: user.id! }).then((res) => {
                          if (res.status === "Ok") {
                            toast.update(toastId, { type: "success", render: "User banned", isLoading: false, autoClose: 1000 });
                            refetch();
                          } else toast.update(toastId, { type: "error", render: "Something went wrong", isLoading: false, autoClose: 4000 });
                        });
                      }
                    }}
                    className={`${
                      active ? "bg-green-600 font-semibold text-white" : "bg-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-black`}
                  >
                    {!user?.isEnabled ? (
                      <>
                        {active ? (
                          <CgUnblock style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        ) : (
                          <CgUnblock style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        )}
                        Unban
                      </>
                    ) : (
                      <>
                        {active ? (
                          <GiHammerDrop style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        ) : (
                          <GiHammerDrop style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                        )}
                        Ban
                      </>
                    )}
                  </button>
                )}
              </Menu.Item>
              <CModal
                ref={deleteUserRef}
                title={`You sure you want to delete ${user.email}?`}
                buttonNoPadding
                className="w-full"
                button={
                  <button className="group flex w-full flex-1 shrink-0 items-center rounded-md px-2 py-2 text-sm text-red-500 hover:bg-red-600 hover:font-semibold hover:text-white">
                    <TiDeleteOutline style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                    Delete
                  </button>
                }
              >
                <ul className="ml-4 list-disc marker:text-red-500">
                  <li>This action is IRREVESIBLE. You will not be able to undo this action.</li>
                  <li>User will be immidiatly purged from the website.</li>
                </ul>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => {
                      API.Client.UserManagement.DeleteUser({ id: user.id! }).then((res) => {
                        if (res.status === "Ok") {
                          toast.success("User deleted");
                          refetch();
                        }
                      });
                    }}
                    className="rounded-lg border-2 border-red-700 bg-white px-4 py-2 font-semibold text-red-700"
                  >
                    Yes. Delete this user
                  </button>
                  <button onClick={() => {}} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-neutral-50">
                    No, DO NOT Delete this user
                  </button>
                </div>
              </CModal>
            </div>

            <div className="px-1 py-1">
              <div>Email actions</div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      await API.Client.UserManagement.PasswordResetRequest({ userId: user.id! }).then((res) => {
                        if (res.status === "Ok") {
                          toast.success("Password reset email sent");
                        } else toast.error("Something went wrong, please wait about 2 minutes");
                      });
                    }}
                    className={`${
                      active ? "bg-green-600 font-semibold text-white" : "bg-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-black`}
                  >
                    {active ? (
                      <CgLastpass style={{ transition: "none" }} className="mr-1 text-base opacity-80 transition-none" />
                    ) : (
                      <CgLastpass style={{ transition: "none" }} className="mr-1 text-base opacity-50 transition-none" />
                    )}
                    Password reset
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      await API.Client.UserManagement.VerifyEmailRequest({ userId: user.id! }).then((res) => {
                        if (res.status === "Ok") {
                          toast.success("Email verification link sent");
                        } else toast.error("Something went wrong, please wait about 2 minutes");
                      });
                    }}
                    className={`${
                      active ? "bg-green-600 font-semibold text-white" : "bg-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-black`}
                  >
                    {active ? (
                      <GrValidate style={{ transition: "none" }} className="mr-1 text-base opacity-80 transition-none" />
                    ) : (
                      <GrValidate style={{ transition: "none" }} className="mr-1 text-base opacity-50 transition-none" />
                    )}
                    Email verification
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      await API.Client.UserManagement.DeleteAccountRequest({ userId: user.id! }).then((res) => {
                        if (res.status === "Ok") {
                          toast.success("Account removal link sent");
                        } else toast.error("Something went wrong, please wait about 2 minutes");
                      });
                    }}
                    className={`${
                      active ? "bg-green-600 font-semibold text-white" : "bg-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-black`}
                  >
                    {active ? (
                      <CgUserRemove style={{ transition: "none" }} className="mr-1 text-lg opacity-80 transition-none" />
                    ) : (
                      <CgUserRemove style={{ transition: "none" }} className="mr-1 text-lg opacity-50 transition-none" />
                    )}
                    Account removal
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

function UserNameEditor({ user, setUser, refetch }: { user: UserDTO; setUser: Dispatch<SetStateAction<UserDTO>>; refetch: any }) {
  return (
    <span className="max-w-[10rem] overflow-hidden">
      <EditableText value={user.name!} setValue={(str) => setUser({ ...user, name: str })} />
    </span>
  );
}

function EditableText({ value, setValue }: { value: string; setValue: (str: string) => void }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused) inputRef?.current?.focus();
  });

  if (focused) {
    return (
      <input
        ref={inputRef}
        onBlur={() => setFocused(false)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="ml-1 box-content inline w-96 rounded-lg border px-2 font-semibold outline-none"
      />
    );
  } else
    return (
      <span
        tabIndex={0}
        onFocus={() => {
          setFocused(true);
          inputRef?.current?.focus();
        }}
        className="ml-1"
      >
        {value}
      </span>
    );
}

const UserControl = ({
  user,
  refetch,
  permissions,
  refreshPermissions,
}: {
  user: UserDTO;
  refetch: any;
  permissions: PermissionDTO[];
  refreshPermissions: any;
}) => {
  return (
    <div className="relative mx-2 mb-4 flex h-44 w-96 flex-col rounded-xl border bg-white p-4">
      <UserDropdownMenu user={user} refetch={refetch} permissions={permissions} refreshPermissions={refreshPermissions} />

      <div className="mx-2 flex h-12 w-full items-center justify-start">
        <Image
          src={user.avatarURL ?? "https://nauth-avatars.s3.eu-north-1.amazonaws.com/avatar/default.png"}
          height={48}
          width={48}
          className="rounded-full"
          alt="user avatar"
        />
        <div className="ml-4 flex flex-col items-start justify-center">
          <div className="flex items-center justify-start">
            <FiShield className={`mr-1 inline-block text-lg ${!isAnyAdmin(user) && "hidden"}`} />
            <span className="mr-1 font-semibold">{user.name}</span>
          </div>
          <div className="text-base font-normal text-neutral-700">{user.email}</div>
        </div>
      </div>

      <UserQuickTags user={user} />
    </div>
  );
};

function UserQuickTags({ user }: { user: UserDTO }) {
  return (
    <div className="mt-2 flex shrink-0 flex-wrap items-start justify-start select-none">
      {(
        [
          isAnyAdmin(user) && {
            name: "Admin",
            type: "warning",
            icon: <FiShield className="mr-1 inline-block text-base" />,
          },

          user?.twoFactorAuthEntries?.length && user?.twoFactorAuthEntries?.length > 0
            ? {
                name: "2FA",
                type: "pleasing",
              }
            : {
                name: "No 2FA",
                type: "warning",
              },

          user?.isEmailVerified
            ? {
                name: "Email verified",
                type: "pleasing",
                icon: <GrValidate className="mr-1 inline-block text-base" />,
              }
            : {
                name: "Email NOT verified",
                type: "danger",
              },

          isAnyAdmin(user) && {
            name: `${user.permissions?.filter((p) => p.permission?.serviceId === "0").length} admin permissions`,
            type: "warning",
          },
        ] as { name: string; type: "danger" | "pleasing" | "warning"; icon: any }[]
      )
        .filter((t) => t)
        .map((t, i) => (
          <span
            key={i}
            className={`mt-1.5 mr-1 rounded-full px-2.5 py-0.5 text-sm ${t.type === "pleasing" && "bg-green-100"} ${t.type === "warning" && "bg-amber-100"} ${t.type === "danger" && "bg-red-100"} flex items-center justify-center font-semibold text-black`}
          >
            {t.icon}
            {t.name}
          </span>
        ))}
    </div>
  );
}

function UserPermissionManager({
  user,
  setUser,
  refetch,
  permissions,
  refreshPermissions,
}: {
  user: UserDTO;
  setUser: Dispatch<SetStateAction<UserDTO>>;
  refetch: any;
  permissions: PermissionDTO[];
  refreshPermissions: any;
}) {
  function getPermissionName(permissionKey: string) {
    return permissions.find((p) => p.key === permissionKey || p.id === permissionKey)?.name?.replaceAll("Pr", "") ?? "";
  }

  function getPermissionServiceName(permissionKey: string) {
    return permissions.find((p) => p.key === permissionKey || p.id === permissionKey)?.service?.name ?? "";
  }

  return (
    <div className="mx-2 flex h-full w-full items-start justify-evenly pb-2">
      <div className="mt-4 flex w-1/2 flex-col items-start justify-start space-y-3 text-base">
        <h1 className="text-xl font-semibold">This user can:</h1>

        <ul className="ml-4">
          {user.permissions
            ?.map((p) => p.permission)
            ?.map((permission, i) => (
              <li
                className={`w-fit list-disc opacity-60 transition-all duration-150 marker:text-green-700 hover:opacity-100 hover:marker:text-red-700`}
                key={i}
              >
                <button
                  onClick={() => {
                    setUser({
                      ...user,
                      permissions: [...(user.permissions ?? []).filter((p) => p.permissionId !== permission?.id)],
                    });
                  }}
                  className={`flex items-center justify-center rounded-lg px-2.5 py-0.5 font-semibold text-black hover:bg-red-100`}
                >
                  <div className="flex flex-col items-start justify-start">
                    <div>{getPermissionName(permission?.id ?? "")}</div>
                    <div className="text-xs font-medium">Managed by {getPermissionServiceName(permission?.id ?? "")}</div>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-4 flex w-1/2 flex-col items-start justify-start space-y-3">
        <h1 className="text-xl font-semibold">This user can NOT:</h1>

        <ul className="ml-4">
          {permissions
            ?.filter((p) => !user.permissions?.some((up) => up.permissionId === p.id))
            ?.map((permission, i) => (
              <li
                className={`w-fit list-disc opacity-60 transition-all duration-150 marker:text-red-700 hover:opacity-100 hover:marker:text-green-700`}
                key={i}
              >
                <button
                  onClick={() => {
                    setUser({
                      ...user,
                      permissions: [
                        ...(user.permissions ?? []),
                        {
                          id: permission?.id,
                          userId: user.id,
                          permissionId: permission?.id,
                          permission: permission,
                          createdAt: new Date(),
                        },
                      ],
                    });
                  }}
                  className={`flex items-center justify-center rounded-lg px-2.5 py-0.5 font-semibold text-black hover:bg-green-100`}
                >
                  <div className="flex flex-col items-start justify-start">
                    <span>{getPermissionName(permission?.id ?? "")}</span>
                    <span className="text-xs font-medium">Managed by {getPermissionServiceName(permission?.id ?? "")}</span>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
