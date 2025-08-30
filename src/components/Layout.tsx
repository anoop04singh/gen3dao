import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface LayoutProps {
  children: React.ReactNode;
  configPanel: React.ReactNode;
}

export const Layout = ({ children, configPanel }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <main className="h-full">{children}</main>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          {configPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};