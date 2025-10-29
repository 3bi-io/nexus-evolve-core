import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  MessageSquare,
  Network,
  Brain,
  Trophy,
  CreditCard,
  Settings,
  BookOpen,
  User,
  Sparkles,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    window.addEventListener('toggle-command-palette', handleToggle);
    
    return () => window.removeEventListener('toggle-command-palette', handleToggle);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/knowledge-graph'))}>
            <Network className="mr-2 h-4 w-4" />
            <span>Knowledge Graph</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/evolution'))}>
            <Brain className="mr-2 h-4 w-4" />
            <span>Evolution Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/achievements'))}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Achievements</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/problem-solver'))}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Problem Solver</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/capabilities'))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Capabilities</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate('/account'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/pricing'))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Pricing</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                navigate('/');
                window.dispatchEvent(new CustomEvent('new-chat'));
              })
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>New Chat</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                window.dispatchEvent(new CustomEvent('show-shortcuts'));
              })
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
