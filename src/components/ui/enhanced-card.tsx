import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export function EnhancedCard({
  title,
  description,
  children,
  className,
  hover = true,
  glow = false,
  gradient = false,
}: EnhancedCardProps) {
  const cardContent = (
    <Card
      className={cn(
        "transition-all duration-300",
        gradient && "bg-gradient-to-br from-card via-card to-primary/5",
        glow && "hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]",
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

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  className,
}: {
  icon: any;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <p
                  className={cn(
                    "text-xs mt-1 font-medium",
                    trend.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.value}
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "backdrop-blur-xl bg-card/80 border border-white/10 rounded-xl p-6 shadow-xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
