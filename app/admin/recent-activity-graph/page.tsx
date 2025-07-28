"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { date: "Apr 2", mobile: 80, desktop: 60 },
  { date: "Apr 6", mobile: 120, desktop: 90 },
  { date: "Apr 10", mobile: 150, desktop: 110 },
  { date: "Apr 14", mobile: 200, desktop: 140 },
  { date: "Apr 18", mobile: 170, desktop: 120 },
  { date: "Apr 23", mobile: 220, desktop: 160 },
  { date: "Apr 28", mobile: 180, desktop: 130 },
  { date: "May 3", mobile: 240, desktop: 180 },
  { date: "May 7", mobile: 210, desktop: 150 },
  { date: "May 12", mobile: 230, desktop: 170 },
  { date: "May 17", mobile: 190, desktop: 140 },
  { date: "May 22", mobile: 250, desktop: 200 },
  { date: "May 27", mobile: 220, desktop: 160 },
  { date: "Jun 1", mobile: 200, desktop: 178 },
  { date: "Jun 5", mobile: 210, desktop: 160 },
  { date: "Jun 9", mobile: 230, desktop: 170 },
  { date: "Jun 14", mobile: 250, desktop: 200 },
  { date: "Jun 19", mobile: 220, desktop: 160 },
  { date: "Jun 24", mobile: 240, desktop: 180 },
  { date: "Jun 30", mobile: 260, desktop: 200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 text-white rounded-lg px-4 py-2 shadow-lg">
        <div className="font-semibold mb-1">{label}</div>
        <div className="flex flex-col gap-1 text-sm">
          <span>Mobile <span className="font-bold">{payload[0].value}</span></span>
          <span>Desktop <span className="font-bold">{payload[1].value}</span></span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RecentActivityGraphPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18181b] p-6">
      <div className="w-full max-w-6xl rounded-2xl bg-[#18181b] p-6 shadow border border-[#232329]">
        <h2 className="text-xl font-bold mb-2 text-white">Total Visitors</h2>
        <p className="text-white/70 mb-4">Total for the last 3 months</p>
        <div className="w-full h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#aaa" tick={{ fill: '#aaa', fontFamily: 'Roboto, sans-serif' }} />
              <YAxis stroke="#aaa" tick={{ fill: '#aaa', fontFamily: 'Roboto, sans-serif' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="mobile" stroke="#fff" fill="url(#colorMobile)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="desktop" stroke="#fff" fill="url(#colorDesktop)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 