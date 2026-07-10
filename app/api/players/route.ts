import { NextResponse } from 'next/server';

const players = [
  { id: 'p1', name: 'Virat Kohli', team: 'RCB', role: 'Batter' },
  { id: 'p2', name: 'Rohit Sharma', team: 'MI', role: 'Batter' },
  { id: 'p3', name: 'MS Dhoni', team: 'CSK', role: 'Wicketkeeper' },
  { id: 'p4', name: 'Suryakumar Yadav', team: 'MI', role: 'Batter' },
  { id: 'p5', name: 'Jasprit Bumrah', team: 'MI', role: 'Bowler' },
  { id: 'p6', name: 'Shubman Gill', team: 'GT', role: 'Batter' },
  { id: 'p7', name: 'Ravindra Jadeja', team: 'CSK', role: 'All-rounder' },
  { id: 'p8', name: 'KL Rahul', team: 'LSG', role: 'Batter' },
  { id: 'p9', name: 'Hardik Pandya', team: 'MI', role: 'All-rounder' },
  { id: 'p10', name: 'Rinku Singh', team: 'KKR', role: 'Batter' },
];

export async function GET() {
  return NextResponse.json({ data: players });
}
