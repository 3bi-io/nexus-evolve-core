import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnnouncementCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from("system_announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }
  };

  const createAnnouncement = async () => {
    if (!title || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("system_announcements")
      .insert({
        title,
        message,
        type,
        created_by: user?.id,
      });

    if (!error) {
      toast({ title: "Success", description: "Announcement created" });
      setTitle("");
      setMessage("");
      setType("info");
      loadAnnouncements();
    } else {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-mobile">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Announcement Center</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Create and manage system-wide announcements</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Announcement
            </CardTitle>
            <CardDescription>Broadcast a message to all users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Announcement message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createAnnouncement} className="w-full">
              <Megaphone className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Announcements</CardTitle>
            <CardDescription>Current system announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active announcements</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{announcement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{announcement.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
