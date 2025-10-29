import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setOpen(true);
    window.addEventListener('show-shortcuts', handleShow);
    return () => window.removeEventListener('show-shortcuts', handleShow);
  }, []);

  const shortcuts: Shortcut[] = [
    { key: 'K', ctrl: true, description: 'Open command palette' },
    { key: 'N', ctrl: true, description: 'New chat' },
    { key: 'G', ctrl: true, shift: true, description: 'Knowledge Graph' },
    { key: 'E', ctrl: true, shift: true, description: 'Evolution Dashboard' },
    { key: 'A', ctrl: true, shift: true, description: 'Achievements' },
    { key: 'P', ctrl: true, shift: true, description: 'Pricing' },
    { key: '/', ctrl: true, description: 'Show shortcuts' },
    { key: 'Enter', description: 'Send message (in chat)' },
    { key: 'Escape', description: 'Close dialogs' },
  ];

  const renderKeys = (shortcut: Shortcut) => {
    const keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    keys.push(shortcut.key);

    return (
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <Badge key={i} variant="secondary" className="font-mono text-xs px-2">
            {key}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-sm">{shortcut.description}</span>
              {renderKeys(shortcut)}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
