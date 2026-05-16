import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/creem";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started for free",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    productId: null,
    cta: "Current plan",
  },
  {
    name: "Monthly",
    price: "$9",
    period: "per month",
    description: "For individuals and small teams",
    features: ["Everything in Free", "Feature 4", "Feature 5", "Priority support"],
    productId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_MONTHLY,
    cta: "Upgrade to Monthly",
    highlighted: true,
  },
  {
    name: "Yearly",
    price: "$79",
    period: "per year",
    description: "Best value — 2 months free",
    features: ["Everything in Monthly", "Feature 6", "Feature 7", "Annual discount"],
    productId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_YEARLY,
    cta: "Upgrade to Yearly",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple pricing</h1>
          <p className="text-muted-foreground">Start free, upgrade when you need more.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
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
                  <CheckoutButton productId={plan.productId} cta={plan.cta} />
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckoutButton({ productId, cta }: { productId: string; cta: string }) {
  return (
    <form
      className="w-full"
      action={async () => {
        "use server";
        const session = await auth();
        if (!session?.user?.email) redirect("/login");

        const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
        const checkout = await createCheckoutSession({
          productId,
          customerEmail: session.user.email,
          successUrl: `${appUrl}/dashboard?upgraded=true`,
        });

        redirect(checkout.url);
      }}
    >
      <Button className="w-full" type="submit">
        {cta}
      </Button>
    </form>
  );
}
