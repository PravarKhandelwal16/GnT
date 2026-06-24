import React from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ArrowUpRight, ArrowDownLeft, Gift, Image as ImageIcon, Users, ShieldCheck, Filter } from 'lucide-react';

export const Wallet: React.FC = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Balance Card */}
          <div className="bg-card border border-border rounded-[20px] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-textMain mb-1">Available Balance</h2>
              <p className="text-textMain-secondary mb-8">Your tradable community credits</p>
              <div className="text-5xl sm:text-6xl font-bold text-textMain mb-10 tracking-tight">1,240</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="primary" className="w-full">Transfer</Button>
              <Button variant="outline" className="w-full bg-surface text-textMain border border-border">Request</Button>
            </div>
          </div>

          {/* Earn Credits Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-textMain">Earn Credits</h2>
              <a href="#" className="text-primary hover:text-primary-hover font-medium">View all opportunities</a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:h-[calc(100%-48px)]">
              {/* Earn Card 1 */}
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-textMain mb-2 text-lg">List an Item</h3>
                <p className="text-textMain-secondary text-sm mb-6 flex-1">Add something you no longer need to the market.</p>
                <div>
                  <Badge variant="success" className="bg-success/10 text-success border-none shadow-none rounded-full px-3 py-1 font-medium">+ 50 Credits</Badge>
                </div>
              </div>
              
              {/* Earn Card 2 */}
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-textMain mb-2 text-lg">Refer a Neighbor</h3>
                <p className="text-textMain-secondary text-sm mb-6 flex-1">Invite friends to join the community.</p>
                <div>
                  <Badge variant="success" className="bg-success/10 text-success border-none shadow-none rounded-full px-3 py-1 font-medium">+ 100 Credits</Badge>
                </div>
              </div>

              {/* Earn Card 3 */}
              <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-textMain mb-2 text-lg">Verify Account</h3>
                <p className="text-textMain-secondary text-sm mb-6 flex-1">Complete your profile to build trust.</p>
                <div>
                  <Badge variant="success" className="bg-success/10 text-success border-none shadow-none rounded-full px-3 py-1 font-medium">+ 25 Credits</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-card border border-border rounded-[20px] shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-border flex justify-between items-center bg-card">
            <h2 className="text-2xl font-bold text-textMain">Recent Activity</h2>
            <button className="p-2 hover:bg-surface rounded-full text-textMain-secondary transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          
          <div className="divide-y divide-border bg-card">
            {/* Activity 1 */}
            <div className="p-6 flex items-center justify-between hover:bg-surface transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-textMain group-hover:text-primary transition-colors">Purchased Vintage Lamp</h3>
                  <p className="text-textMain-secondary text-sm">From user @alex_g • Oct 24, 2023</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-textMain">-120</div>
                <div className="text-sm text-textMain-secondary">Credits</div>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="p-6 flex items-center justify-between hover:bg-surface transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
                  <ArrowDownLeft className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-textMain group-hover:text-primary transition-colors">Sold Record Player</h3>
                  <p className="text-textMain-secondary text-sm">To user @sarah_m • Oct 22, 2023</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-success">+450</div>
                <div className="text-sm text-textMain-secondary">Credits</div>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="p-6 flex items-center justify-between hover:bg-surface transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-textMain group-hover:text-primary transition-colors">Welcome Bonus</h3>
                  <p className="text-textMain-secondary text-sm">System • Oct 20, 2023</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-success">+100</div>
                <div className="text-sm text-textMain-secondary">Credits</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border bg-card">
            <button className="text-primary hover:text-primary-hover hover:bg-surface font-medium text-sm w-full py-4 transition-colors">
              Load More Transactions
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};
