'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, FileText, Users, Clock, Settings, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, businessProfile, isLoading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.first_name}!
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/invoices/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          </div>
        </div>

        {/* Welcome card for new users */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">Welcome to FacilInvoice!</h3>
                <p className="text-muted-foreground">
                  Thanks for signing up. Here's how to get started:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Complete your business profile</li>
                  <li>Add your first client</li>
                  <li>Create your first invoice</li>
                </ul>
              </div>
              <div className="flex flex-col space-y-2">
                <Button asChild>
                  <Link href="/business-profile">
                    Complete Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/clients/new">
                    Add Client
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {!businessProfile && (
          <Card className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-amber-800 dark:text-amber-400">Complete Your Business Profile</h3>
                  <p className="text-amber-700 dark:text-amber-500">
                    Add your business details to customize your invoices.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/business-profile">
                    Complete Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">0</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
                <p className="text-sm mt-2">
                  Start by creating your first invoice
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/invoices">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Invoices
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/clients">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Clients
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/recurring-invoices">
                    <Clock className="mr-2 h-4 w-4" />
                    Recurring Invoices
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/business-profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Business Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {businessProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Your Business Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {businessProfile.logo_url && (
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                      <Image
                        src={businessProfile.logo_url}
                        alt={businessProfile.business_name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">{businessProfile.business_name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      {businessProfile.email && (
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {businessProfile.email}
                        </p>
                      )}
                      
                      {businessProfile.phone && (
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span> {businessProfile.phone}
                        </p>
                      )}
                      
                      {businessProfile.website && (
                        <p className="text-sm">
                          <span className="font-medium">Website:</span> {businessProfile.website}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      {(businessProfile.address_line1 || businessProfile.city) && (
                        <div className="text-sm">
                          <span className="font-medium">Address:</span>
                          <p className="mt-1">
                            {businessProfile.address_line1}
                            {businessProfile.address_line2 && <><br />{businessProfile.address_line2}</>}
                            {businessProfile.city && <><br />{businessProfile.city}, {businessProfile.state} {businessProfile.postal_code}</>}
                            {businessProfile.country && <><br />{businessProfile.country}</>}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 self-start mt-4 md:mt-0">
                  <Button variant="outline" asChild>
                    <Link href="/business-profile">
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 