import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EnhancedCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  className?: string;
}

export function EnhancedCard({
  children,
  title,
  description,
  hover = true,
  glow = false,
  gradient = false,
  className,
}: EnhancedCardProps) {
  const cardContent = (
    <Card
      className={cn(
        "transition-all duration-300",
        gradient && "bg-gradient-to-br from-card to-card/50",
        className
      )}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );

  if (hover || glow) {
    return (
      <motion.div
        whileHover={
          hover
            ? {
                y: -5,
                boxShadow: glow
                  ? "0 10px 40px hsl(var(--primary) / 0.3)"
                  : "0 10px 30px -10px rgba(0,0,0,0.3)",
              }
            : undefined
        }
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ icon: Icon, label, value, trend, className }: StatCardProps) {
  return (
    <EnhancedCard hover glow className={className}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </EnhancedCard>
  );
}

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card
      className={cn(
        "backdrop-blur-xl bg-card/40 border-border/50 shadow-2xl",
        className
      )}
    >
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
