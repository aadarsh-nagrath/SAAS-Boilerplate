import { PLANS } from "@/constants";
import { CheckoutButton } from "@/components/shared";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/constants";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple pricing</h1>
          <p className="text-muted-foreground">Start free, upgrade when you need more.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted && <Badge>Popular</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.productId ? (
                  <CheckoutButton productId={plan.productId} label={`Get ${plan.name}`} />
                ) : (
                  <Link
                    href={ROUTES.dashboard}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full text-center")}
                  >
                    Current plan
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
