export const Sidebar = () => {
  return (
    <aside className="w-1/4 min-w-[300px] max-w-[400px] bg-card border-r p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Assistant & Tools</h2>
      <div className="flex-1 flex items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground text-center p-4">
          Chat, templates, and nodes will appear here.
        </p>
      </div>
    </aside>
  );
};