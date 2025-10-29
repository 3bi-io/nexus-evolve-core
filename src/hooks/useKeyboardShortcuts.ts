import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      ctrl: true,
      description: 'Open command palette',
      action: () => {
        // Toggle command palette (we'll implement this)
        const event = new CustomEvent('toggle-command-palette');
        window.dispatchEvent(event);
      },
    },
    {
      key: 'n',
      ctrl: true,
      description: 'New chat',
      action: () => {
        navigate('/');
        const event = new CustomEvent('new-chat');
        window.dispatchEvent(event);
      },
    },
    {
      key: 'g',
      ctrl: true,
      shift: true,
      description: 'Go to Knowledge Graph',
      action: () => navigate('/knowledge-graph'),
    },
    {
      key: 'e',
      ctrl: true,
      shift: true,
      description: 'Go to Evolution Dashboard',
      action: () => navigate('/evolution'),
    },
    {
      key: 'a',
      ctrl: true,
      shift: true,
      description: 'Go to Achievements',
      action: () => navigate('/achievements'),
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      description: 'Go to Pricing',
      action: () => navigate('/pricing'),
    },
    {
      key: '/',
      ctrl: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        const event = new CustomEvent('show-shortcuts');
        window.dispatchEvent(event);
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
