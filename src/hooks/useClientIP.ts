import { useState, useEffect } from 'react';

export const useClientIP = () => {
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        // Try multiple IP detection services for redundancy
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        // Fallback: use a placeholder that won't break the system
        console.warn('Failed to fetch IP address:', error);
        setIpAddress('unknown');
      } finally {
        setLoading(false);
      }
    };

    fetchIP();
  }, []);

  return { ipAddress, loading };
};
