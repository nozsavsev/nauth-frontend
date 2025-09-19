import { API } from "@/API/API";
import { EmailActionDTO } from "@/API/NauthApi_gen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";

const EmailActionManager = () => {
  const [emailActions, setEmailActions] = useState<EmailActionDTO[]>([]);

  const fetchEmailActions = async () => {
    const res = await API.Client.EmailActions.GetMyEmailActions();
    if (res.status === "Ok") {
      setEmailActions(res.response ?? []);
      console.log(res.response);
    }
  };

  const neutralizeEmailAction = async (id: string) => {
    await API.Client.EmailActions.NeutralizeEmailAction({ id: id });
    await fetchEmailActions();
  };

  useEffect(() => {
    fetchEmailActions();
  }, []);

  return (
    <Card className="h-fit min-h-[20rem] w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Email Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailActions.map((action) => (
              <TableRow key={action.id}>
                <TableCell>{action.type}</TableCell>
                <TableCell>{new Date(action.expiresAt ?? 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => neutralizeEmailAction(action.id ?? "")}>
                    Invalidate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmailActionManager;
