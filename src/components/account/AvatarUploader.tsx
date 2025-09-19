import { API } from "@/API/API";
import { Button } from "@/components/ui/button";
import useUser from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AvatarUploader = () => {
  const { user, refresh } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const avatarUrl = (user?.avatarURL?.length ?? 0) > 0 ? user!.avatarURL : null;

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const res = await API.Client.User.UploadAvatar({ file: selectedFile });
      if (res.status === "Ok") {
        toast.success("Avatar updated successfully");
        setSelectedFile(null);
        setPreviewUrl(null);
        refresh();
      } else {
        toast.error(res.status);
      }
    } catch (error) {
      toast.error("An error occurred while uploading the avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const res = await API.Client.User.UploadAvatar({});
      if (res.status === "Ok") {
        toast.success("Avatar removed successfully");
        setSelectedFile(null);
        setPreviewUrl(null);
        refresh();
      } else {
        toast.error(res.status);
      }
    } catch (error) {
      toast.error("An error occurred while removing the avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border bg-white">
      <div className="flex w-full items-start justify-between p-4">
        <div className="flex justify-center text-2xl font-semibold">{"Avatar"}</div>
      </div>
      <div className="flex flex-col items-center space-y-4 p-4">
        <img
          src={previewUrl || avatarUrl || "https://nauth-avatars.s3.eu-north-1.amazonaws.com/avatar/default.png"}
          alt="Avatar"
          className="h-32 w-32 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://nauth-avatars.s3.eu-north-1.amazonaws.com/avatar/default.png";
          }}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="avatar-upload" />
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <Button asChild>
            <span>Choose Image</span>
          </Button>
        </label>
      </div>
      <div className="flex w-full shrink-0 flex-col items-center justify-between border-t bg-neutral-50 px-4 py-2 lg:flex-row">
        <div>{"Upload a new avatar, or remove the current one."}</div>
        <div className="flex space-x-2">
          {selectedFile && (
            <>
              <Button onClick={handleUpload} disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleRemove} disabled={isLoading}>
            {isLoading ? "Removing..." : "Remove Avatar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
