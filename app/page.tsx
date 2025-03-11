import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, CreditCard, FileText, BarChart3, Clock, Users, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Simple Invoicing for Modern Businesses
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Create professional invoices, get paid faster, and manage your business finances with ease.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg" className="h-11 px-8">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-8">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Everything You Need
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                Powerful features to streamline your invoicing workflow
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <FileText className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Professional Invoices</CardTitle>
                <CardDescription>
                  Create beautiful, customizable invoices in seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Customizable templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Add your logo and branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>PDF generation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <CreditCard className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Online Payments</CardTitle>
                <CardDescription>
                  Get paid faster with integrated payment links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Stripe integration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Shareable payment links</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Automatic payment tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <Clock className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Recurring Invoices</CardTitle>
                <CardDescription>
                  Automate your billing with recurring invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Weekly, monthly, or custom schedules</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Automatic generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Email notifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <Users className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  Organize your clients and their information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Client database</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Contact information</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Invoice history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <BarChart3 className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Dashboard & Analytics</CardTitle>
                <CardDescription>
                  Track your business performance at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Financial overview</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Payment status tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Revenue insights</span>
          </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <Shield className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is protected and private
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Data encryption</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>User authentication</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Privacy controls</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Streamline Your Invoicing?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                Join thousands of businesses that use our platform to simplify their invoicing process.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/register">Get Started for Free</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                No credit card required. Start creating invoices in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Invoice Generator. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">Terms</Link>
            <Link href="#" className="hover:underline">Privacy</Link>
            <Link href="#" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
