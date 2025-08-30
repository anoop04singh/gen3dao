import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export const DeploymentPanel = () => {
  return (
    <SheetContent className="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>Deploy DAO</SheetTitle>
        <SheetDescription>
          Review your DAO configuration and deploy it to the selected network.
        </SheetDescription>
      </SheetHeader>
      <div className="py-8 space-y-4">
        <div className="text-center p-8 border rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
            Smart contract generation and deployment functionality is coming soon.
            </p>
        </div>
        <Separator />
         <div className="space-y-2">
            <h3 className="font-semibold">Next Steps</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Real-time validation of DAO structure.</li>
                <li>Generate secure smart contracts.</li>
                <li>One-click deployment to testnet or mainnet.</li>
            </ul>
         </div>
      </div>
      <div className="absolute bottom-4 right-4 left-4">
        <Button disabled className="w-full">
            Deploy Now
        </Button>
      </div>
    </SheetContent>
  );
};