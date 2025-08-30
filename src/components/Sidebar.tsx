import { ChatPanel } from "./ChatPanel";
import { NodePalette } from "./NodePalette";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface SidebarProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export const Sidebar = ({ messages, isLoading, onSendMessage }: SidebarProps) => {
  return (
    <aside className="w-1/4 min-w-[300px] max-w-[400px] bg-card border-r flex flex-col">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 m-2">
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <ChatPanel 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={onSendMessage}
          />
        </TabsContent>
        <TabsContent value="tools">
          <NodePalette />
        </TabsContent>
      </Tabs>
    </aside>
  );
};